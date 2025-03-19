import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa"; // Icono de usuario predeterminado
import { AuthContext } from "../context/AuthContext"; // Importamos el contexto de autenticación
import { ThemeContext } from "../context/ThemeContext"; // Importamos el contexto de tema

const Profile = () => {
  const { isLoggedIn, logout } = useContext(AuthContext); // Consumimos el contexto de autenticación
  const { theme, toggleTheme } = useContext(ThemeContext); // Consumimos el contexto de tema
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = 1; // Suponiendo que este es el ID del usuario logueado
    fetch(`http://localhost:8080/api/users/${userId}`)
      .then((response) => response.json())
      .then((data) => setUser(data))
      .catch((error) => console.error("Error al cargar el perfil:", error));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    navigate("/login");
  };

  const handleEdit = () => {
    // Redirigir a la página de edición de perfil
    navigate("/edit-profile");
  };

  if (!user) return <div>Cargando...</div>;

  return (
    <div className={`min-h-screen ${theme === "light" ? "bg-gray-100" : "bg-gray-900"} text-gray-900 dark:text-white flex items-center justify-center`}>
      <div className="p-6 max-w-lg mx-auto bg-white dark:bg-gray-800 shadow-md rounded-lg">
        {/* Foto de perfil y botón de editar */}
        <div className="flex flex-col items-center mb-4">
          <div className="relative mb-3">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt="Foto de perfil"
                className="w-32 h-32 rounded-full object-cover"
              />
            ) : (
              <FaUserCircle className="w-32 h-32 text-gray-500" />
            )}
            {/* Botón de editar */}
            <button
              onClick={handleEdit}
              className="absolute bottom-0 right-0 p-1 bg-blue-600 text-white rounded-full"
            >
              <span className="text-xs">Editar</span>
            </button>
          </div>
          <h2 className="text-2xl font-bold">{user.username}</h2>
        </div>

        {/* Información del perfil */}
        <p className="text-gray-700 dark:text-gray-300">Correo: {user.email}</p>
        <p className="text-gray-700 dark:text-gray-300">Seguidores: {user.followers.length}</p>
        <p className="text-gray-700 dark:text-gray-300">Siguiendo: {user.following.length}</p>

        {/* Botones de acción */}
        <div className="mt-4 flex flex-col items-center space-y-4">
          {/* Botón para cambiar tema */}
          <button onClick={toggleTheme} className="text-lg font-medium">
            {theme === "light" ? "🌙" : "☀️"}
          </button>

          {/* Botones de editar perfil y cerrar sesión */}
          <div className="flex space-x-4">
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Editar Perfil
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
