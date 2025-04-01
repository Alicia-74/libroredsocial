import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("token"); // Obtener el token del localStorage
    if (token) {
      fetch("http://localhost:8080/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Error al obtener el usuario");
          }
          return res.json();
        })
        .then((data) => setUser(data))
        .catch((err) => {
          console.error("Error al cargar el usuario:", err);
          setUser(null);
        });

        setIsLoggedIn(true); // Si el token existe, consideramos que el usuario está autenticado
    }
  }, []);

 const login = (userData, token) => {
    setIsLoggedIn(true); // Cambiar el estado a true cuando el usuario inicie sesión
    setUser(userData);
    localStorage.setItem("token", token); // Guardar token en sessionStorage
  };

  const logout = () => {
    setIsLoggedIn(false); // Cambiar el estado a false cuando el usuario cierre sesión
    setUser(null);
    localStorage.removeItem("token"); // Eliminar token
  };

  return (
    <AuthContext.Provider value={{ login, logout, isLoggedIn}}>
      {children}
    </AuthContext.Provider>
  );
};
