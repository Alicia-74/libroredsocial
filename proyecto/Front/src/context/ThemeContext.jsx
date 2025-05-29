import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

export const ThemeContext = createContext(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return localStorage.getItem('theme') || (prefersDark ? 'dark' : 'light');
  });

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isThemeLoading, setIsThemeLoading] = useState(true);

  const [themeChangedManually, setThemeChangedManually] = useState(false);


  // ✅ NUEVO: Estado que almacena el userId actual del token
  const [userId, setUserId] = useState(() => {
    const token = sessionStorage.getItem("token");
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return decoded.sub;
    } catch (err) {
      return null;
    }
  });

  // ✅ NUEVO: useEffect que escucha si el token cambia (por login manual) y actualiza userId
  useEffect(() => {
    const interval = setInterval(() => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setUserId(null);
        return;
      }
      try {
        const decoded = jwtDecode(token);
        const newUserId = decoded.sub;
        setUserId(prev => {
          if (prev !== newUserId) {
            setThemeChangedManually(false); // ✅ Resetea al cambiar de sesión
          }
          return newUserId;
        });
      } catch (err) {
        setUserId(null);
      }
    }, 500); // Comprobamos cada 0.5s si ha cambiado

    return () => clearInterval(interval); // Limpiamos al desmontar
  }, []);

  const getAuthHeaders = useCallback(() => {
    const token = sessionStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  useEffect(() => {
    const loadAndApplyInitialTheme = async () => {
      setIsThemeLoading(true);

      if (userId) {
        try {
          console.log(`[ThemeContext] Cargando tema para userId: ${userId} desde la DB.`);
          const response = await axios.get(
            `http://localhost:8080/api/users/${userId}/theme`,
            { headers: getAuthHeaders() }
          );
          const dbTheme = response.data?.themePreference || response.data || 'light';
          
          if (dbTheme !== theme) {
             setTheme(dbTheme);
             setThemeChangedManually(false); 
          }
          console.log(`[ThemeContext] Tema del usuario ${userId} cargado de DB: ${dbTheme}.`);

        } catch (err) {
          console.error("[ThemeContext] Error al cargar el tema desde la DB:", err.response?.data || err.message);
          const fallbackTheme = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
          if (fallbackTheme !== theme) {
             setTheme(fallbackTheme);
          }
          setThemeChangedManually(false); 
          console.log(`[ThemeContext] Fallo al cargar de DB para logueado, usando fallback: ${fallbackTheme}`);
        }
      } else {
        console.log("[ThemeContext] Usuario no logueado, determinando tema...");
        const localTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        const finalGuestTheme = localTheme || (prefersDark ? 'dark' : 'light');
        if (finalGuestTheme !== theme) {
            setTheme(finalGuestTheme);
        }
        console.log(`[ThemeContext] Tema para usuario no logueado: ${finalGuestTheme}`);
        setThemeChangedManually(false);
      }
      setIsThemeLoading(false);
    };

    setThemeChangedManually(false);
    loadAndApplyInitialTheme();
  }, [userId, getAuthHeaders]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");

    if (!isThemeLoading && themeChangedManually) {
      if (userId) {
        console.log(`[ThemeContext] Persistiendo tema '${theme}' para userId: ${userId} en la DB.`);
        axios.put(
          `http://localhost:8080/api/users/${userId}/theme`,
          { theme },
          { headers: getAuthHeaders() }
        ).catch(err => console.error("[ThemeContext] Error al guardar el tema en la DB:", err));
      } else {
        localStorage.setItem('theme', theme);
        console.log(`[ThemeContext] Tema '${theme}' guardado en localStorage (usuario no logueado).`);
      }
    }
  }, [theme, userId, getAuthHeaders, isThemeLoading]);

  const handleLogout = useCallback(() => {
    setIsLoggingOut(true);
    sessionStorage.removeItem('token');

    const localOrPrefers = localStorage.getItem('theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(localOrPrefers);
    localStorage.setItem('theme', localOrPrefers); 
    
    setTimeout(() => setIsLoggingOut(false), 50);
    console.log("[ThemeContext] Sesión cerrada. Tema restablecido para usuario no logueado.");
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const newTheme = prev === "light" ? "dark" : "light";
      console.log(`[ThemeContext] Alternando tema a: ${newTheme}`);
      setThemeChangedManually(true);
      return newTheme;
    });
  }, []);

  const value = useMemo(() => ({
    theme,
    toggleTheme,
    handleLogout,
    isThemeLoading
  }), [theme, toggleTheme, handleLogout, isThemeLoading]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
