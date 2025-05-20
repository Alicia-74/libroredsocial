import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Inicializamos el tema con localStorage o "light"
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "light";
    }
    return "light";
  });

  // Obtener el userId guardado cuando el usuario inicia sesión
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    // Aplicar o quitar la clase dark en <html>
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Guardar el tema en localStorage
    localStorage.setItem("theme", theme);

    // Guardar el tema en la base de datos
    if (userId) {
      console.log("Intentando guardar tema en BD:", theme);
      axios
        .put(`http://localhost:8080/api/users/${userId}/theme`, { theme })
        .then(() => {
          console.log("Tema guardado en base de datos:", theme);
        })
        .catch((err) => {
          console.error("Error guardando tema:", err);
        });
    }
  }, [theme, userId]);

  // Función para alternar el tema
  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
