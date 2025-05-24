// src/context/ThemeContext.js

import React, { createContext, useState, useEffect, useContext, useMemo } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

export const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");
  const [initialThemeLoaded, setInitialThemeLoaded] = useState(false);

  // --- useMemo: Calcular el userId en cada render ---
  // Este hook recalcula el userId cada vez que el componente se renderiza.
  // Es la clave para que el ThemeContext sepa si el token ha cambiado (ej. por logout).
  const userId = useMemo(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        // Asegúrate de que 'sub' es la propiedad correcta para el ID de usuario en tu JWT.
        // Otros nombres comunes pueden ser 'id', 'user_id', etc.
        console.log("ThemeContext (useMemo): Token decodificado, userId:", decodedToken.sub);
        return decodedToken.sub;
      } catch (error) {
        console.error("ThemeContext (useMemo): Error al decodificar token, limpiando:", error);
        sessionStorage.removeItem("token"); // Limpiar token inválido
        return null;
      }
    }
    console.log("ThemeContext (useMemo): No hay token o es null, userId es null.");
    return null;
  }, []); // Dependencia vacía: solo se recalcula si la referencia del token en sessionStorage cambia,
          // o si el ThemeProvider se remonta.
          // En realidad, useMemo con [] se ejecutará una vez y luego solo si se remonta.
          // La reactividad a cambios en sessionStorage se manejará en useEffects.

  // --- Función auxiliar para obtener los encabezados de autorización ---
  const getAuthHeaders = () => {
    const token = sessionStorage.getItem('token');
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  };

  // --- useEffect 1: Cargar el tema del usuario o establecer por defecto ---
  // Este efecto se ejecuta cada vez que el 'userId' cambia.
  // Cuando el usuario inicia sesión (userId pasa de null a un ID) o cierra sesión (ID a null),
  // este efecto se disparará y cargará el tema correcto.
  useEffect(() => {
    const loadAndApplyTheme = async () => {
      let currentResolvedTheme = "light"; // Siempre por defecto "light"

      if (userId) { // Si hay un userId (usuario logueado)...
        console.log(`ThemeContext: Intentando cargar tema para userId: ${userId}`);
        try {
          const response = await axios.get(`http://localhost:8080/api/users/${userId}/theme`, {
            headers: getAuthHeaders()
          });
          currentResolvedTheme = response.data || "light";
          console.log(`ThemeContext: Tema de BD cargado para userId ${userId}: ${currentResolvedTheme}`);
        } catch (err) {
          console.error("ThemeContext: Error cargando tema del usuario desde la base de datos:", err.response?.data || err.message, err.response?.status);
          // Un 403 o 401 aquí significa que el token no era válido para esa petición.
          // Dejar el tema en "light" es lo correcto en este caso.
        }
      } else { // Si NO hay userId (usuario deslogueado o token no válido)...
        console.log("ThemeContext: Usuario no logueado, forzando tema a 'light'.");
      }

      setTheme(currentResolvedTheme); // Aplica el tema determinado.
      setInitialThemeLoaded(true); // Marca que el tema inicial ya se ha intentado cargar.
    };

    loadAndApplyTheme();

    // --- Listener para el evento 'storage' ---
    // Esto es crucial para detectar cambios en sessionStorage/localStorage
    // que ocurren en OTRAS pestañas del navegador.
    const handleStorageChange = (event) => {
        // Solo reaccionamos si el cambio es en la clave 'token' y si el valor ha cambiado.
        if (event.key === 'token') {
            console.log("ThemeContext: Evento 'storage' detectado para 'token'. Re-evaluando tema.");
            // Forzar una re-ejecución de la lógica de carga del tema
            // al cambiar el token (ej. al cerrar sesión en otra pestaña).
            // Esto llamará a loadAndApplyTheme y recalculará userId.
            // Para que esto funcione, el `useMemo` de `userId` también debe reaccionar.
            // La solución más simple es recargar la página para cambios síncronos de token.
            // O bien, tener un AuthContext que actualice un estado que ThemeContext observa.
            // Sin un AuthContext, si el token se elimina en la MISMA pestaña, la página DEBE recargarse
            // o el componente que contiene el ThemeProvider debe re-renderizarse de forma que ThemeProvider
            // se "resetee" (ej. cambiando su `key` prop, lo cual no es ideal).

            // Si el token se elimina en la misma pestaña y quieres que funcione sin recarga:
            // Es necesario que la lógica de login/logout que elimina el token
            // también haga algo que fuerce una re-renderización del ThemeProvider.
            // Por ejemplo, si tienes una ruta '/dashboard' y al desloguear rediriges a '/',
            // y '/' no tiene el ThemeProvider montado, y luego navegas de vuelta,
            // el ThemeProvider se montará de nuevo y hará el chequeo.

            // Para la reactividad SÍNCRONA al logout en la MISMA PESTAÑA:
            // La función de logout en tu componente de logout DEBE hacer un `window.location.reload()`
            // o un redireccionamiento que haga que tu App.js re-renderice el ThemeProvider de cero.
            // O, como último recurso sin AuthContext, puedes recalcular el `userId` aquí:
            const newToken = sessionStorage.getItem("token");
            if (!newToken && userId) { // Si el token se fue y teníamos un userId
                console.log("ThemeContext: Token eliminado en la misma pestaña. Forzando a light.");
                setTheme("light"); // Esto hará que el tema cambie a light
            } else if (newToken && !userId) { // Si aparece un token y no teníamos userId
                console.log("ThemeContext: Nuevo token en la misma pestaña. Re-cargando tema.");
                loadAndApplyTheme(); // Recargar tema del usuario nuevo
            }
        }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };

  }, [userId]); // Este efecto se re-ejecuta cada vez que el userId del estado cambia.

  // --- useEffect 2: Aplicar la clase al <html> y guardar el tema en DB ---
  useEffect(() => {
    // Aplica/quita la clase 'dark' en el elemento <html> para el CSS.
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Guardar el tema en la base de datos.
    // Solo si el tema inicial ya se cargó (initialThemeLoaded)
    // Y si hay un usuario logueado (userId).
    if (initialThemeLoaded && userId) {
      console.log(`ThemeContext: Intentando guardar tema en DB para userId ${userId}: ${theme}`);
      axios.put(`http://localhost:8080/api/users/${userId}/theme`, { theme: theme }, {
        headers: getAuthHeaders()
      })
        .then(() => {
          console.log("ThemeContext: Tema guardado en base de datos:", theme);
        })
        .catch((err) => {
          console.error("ThemeContext: Error guardando tema en base de datos:", err.response?.data || err.message, err.response);
          // Si el guardado falla (ej. por un 403/401 porque el token expiró),
          // el tema en la UI podría no coincidir con lo que el backend cree.
          // Considerar limpiar el token aquí si es un error de autenticación.
        });
    } else if (initialThemeLoaded && !userId) {
      // Si el tema inicial ya se cargó y NO hay userId (usuario deslogueado).
      console.log("ThemeContext: Usuario deslogueado. Asegurando tema 'light'.");
      // Si el tema actual NO es "light", lo forzamos a "light".
      if (theme !== "light") {
          setTheme("light");
      }
    }
  }, [theme, userId, initialThemeLoaded]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};