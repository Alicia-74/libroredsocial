import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { ThemeContext } from "../context/ThemeContext"; // Contexto para tema claro/oscuro
import { FaSearch } from "react-icons/fa"; // Icono de lupa
import { useNavigate } from "react-router-dom"; // Para redirección
import { jwtDecode } from "jwt-decode"; // Para decodificar el token JWT
import debounce from "lodash.debounce"; // Debounce para evitar llamadas excesivas

const BusquedaUsuarios = () => {
  const { theme } = useContext(ThemeContext); // Tema actual
  const [searchTerm, setSearchTerm] = useState(""); // Término de búsqueda
  const [usuarios, setUsuarios] = useState([]); // Resultados de búsqueda
  const [currentUserId, setCurrentUserId] = useState(null); // ID del usuario autenticado
  const [loading, setLoading] = useState(false); // Estado de carga

  const navigate = useNavigate();

  // Obtener ID del usuario desde el token
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const id = decoded.sub?.toString(); // Puede ser 'sub' o 'id' según el backend
        setCurrentUserId(id);
        console.log("ID del usuario actual:", id);
      } catch (err) {
        console.error("Token inválido:", err);
      }
    }
  }, []);

  // Función para hacer la búsqueda de usuarios
  const searchUsers = async (term) => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      console.log("Token:", token);
      const response = await fetch(
        `http://localhost:8080/api/users/search/${term}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` // Agregar el token de autorización
            }
        }
    );


      if (response.status === 403) {
        throw new Error("Acceso no autorizado - Token inválido o expirado");
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setUsuarios(data); // Guardar resultados
    } catch (error) {
      console.error("Error buscando usuarios:", error.message);
      setUsuarios([]); // Limpiar resultados en caso de error
    } finally {
      setLoading(false); // Quitar estado de carga
    }
  };

  // Ejecutar búsqueda con debounce cuando cambia searchTerm
  useEffect(() => {
    if (!searchTerm.trim()) {
      setUsuarios([]);
      return;
    }

    // Ejecuta la búsqueda
    searchUsers(searchTerm);
  }, [searchTerm]);

  // Manejador de cambio de texto con debounce (retraso)
  const handleChange = debounce((e) => {
    setSearchTerm(e.target.value);
  }, 500); // 500ms de espera tras dejar de escribir

  return (
    <div className={`relative ${theme === "dark" ? "dark:bg-gray-900 dark:text-white" : ""}`}>
      {/* Barra de búsqueda */}
      <div
        className={`flex items-center mb-8 w-full sm:w-60 md:w-26 lg:w-50 px-4 py-2 border rounded-md transition-all duration-200 
        ${theme === "dark"
          ? "bg-gray-700 text-white border-gray-600 focus-within:ring-2 focus-within:ring-blue-500"
          : "bg-white text-gray-700 border-gray-300 focus-within:ring-2 focus-within:ring-gray-700"}`}>
        <FaSearch className="text-gray-500 mr-2" />
        <input
          type="text"
          onChange={handleChange}
          placeholder="Buscar usuarios..."
          className="bg-transparent outline-none w-full"
        />
      </div>

      {/* Resultados */}
      {loading ? (
        <div className="absolute top-full left-0 w-full sm:w-60 md:w-72 lg:w-80 mx-auto mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-md z-10 p-4 text-center text-gray-500">
          Cargando...
        </div>
      ) : (
        searchTerm && usuarios.length > 0 && (
          <div className="absolute top-full left-0 w-full sm:w-60 md:w-72 lg:w-80 mx-auto mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-md z-10">
            {usuarios.map((user) => {
              const userId = user.id?.toString();
              if (!userId) return null;

              return (
                <div
                  key={user.id}
                  onClick={() => {
                    if (userId === currentUserId) {
                      navigate("/profile");
                    } else {
                      navigate(`/perfilusuario/${userId}`);
                    }
                  }}
                  className="flex items-center p-4 border-b dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <img
                    src={user.profilePicture && user.profilePicture !== "" ? user.profilePicture : "/icono.jpg"}
                    alt={user.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="ml-4 flex-1">
                    <h3 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                      {user.username}
                    </h3>
                    <div className="mt-1 text-sm text-gray-400">
                      <span>{user.followersCount} seguidores</span> •{" "}
                      <span>{user.followingCount} seguido</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Mensaje si no hay usuarios */}
      {searchTerm && !loading && usuarios.length === 0 && (
        <div className="absolute top-full left-0 w-full sm:w-60 md:w-72 lg:w-80 mx-auto mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-md z-10 p-4 text-center text-gray-500">
          No se encontraron usuarios.
        </div>
      )}
    </div>
  );
};

export default BusquedaUsuarios;
