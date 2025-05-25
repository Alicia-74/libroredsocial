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
  // Estado para el tema, inicializado desde localStorage o 'light'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  // Estado para controlar cuándo se cierra sesión
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const userId = useMemo(() => {
    if (isLoggingOut) return null; // Forzar reset si se está cerrando sesión

    const token = sessionStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        return decodedToken.sub;
      } catch (error) {
        sessionStorage.removeItem("token");
        return null;
      }
    }
    return null;
  }, [isLoggingOut]);

  const getAuthHeaders = () => {
    const token = sessionStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Efecto para cargar el tema cuando userId cambia
  useEffect(() => {
    const loadTheme = async () => {
      if (!userId) {
        // Al cerrar sesión: volver al tema de localStorage o light
        const localTheme = localStorage.getItem('theme') || 'light';
        setTheme(localTheme);
        return;
      }

      // Al iniciar sesión: cargar tema de la DB
      try {
        const response = await axios.get(
          `http://localhost:8080/api/users/${userId}/theme`,
          { headers: getAuthHeaders() }
        );
        const dbTheme = response.data || 'light';
        setTheme(dbTheme);
        localStorage.setItem('theme', dbTheme);
      } catch (err) {
        console.error("Error loading theme:", err);
      }
    };

    loadTheme();
  }, [userId]);

  // Efecto para aplicar el tema y guardar cambios
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem('theme', theme);

    if (userId) {
      axios.put(
        `http://localhost:8080/api/users/${userId}/theme`,
        { theme },
        { headers: getAuthHeaders() }
      ).catch(err => console.error("Error saving theme:", err));
    }
  }, [theme, userId]);

  // Función para cerrar sesión que maneja el tema correctamente
  const handleLogout = () => {
    setIsLoggingOut(true); // Esto hará que userId sea null
    sessionStorage.removeItem('token');
    // Restablecer para futuros logins
    setTimeout(() => setIsLoggingOut(false), 100);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, handleLogout }}>
      {children}
    </ThemeContext.Provider>
  );
};