import React, { createContext, useState, useEffect } from "react";

// Creamos el contexto de autenticación
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Comprobar si hay un token guardado en sessionStorage
    const token = sessionStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true); // Si hay un token, el usuario está logueado
    } else {
      setIsLoggedIn(false); // Si no hay token, el usuario no está logueado
    }
  }, []); // Solo ejecutamos esto al montar el componente

  const login = (token) => {
    sessionStorage.setItem("token", token);
    setIsLoggedIn(true);
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
