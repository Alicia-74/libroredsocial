import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaUserCircle, FaArrowLeft } from "react-icons/fa";
import { ThemeContext } from "../context/ThemeContext"; // Contexto para tema claro/oscuro
import { jwtDecode } from "jwt-decode"; // Para decodificar el token y obtener el ID del usuario actual

const PerfilUsuario = () => {
  const { id } = useParams(); // ID del perfil que se está viendo (desde URL)
  const navigate = useNavigate(); // Para redireccionar
  const { theme } = useContext(ThemeContext); // Obtener el tema actual (light o dark)

  const [user, setUser] = useState(null); // Estado para guardar el perfil del usuario visitado
  const [currentUserId, setCurrentUserId] = useState(null); // ID del usuario autenticado
  const [isFollowing, setIsFollowing] = useState(false); // Si el usuario actual sigue al perfil

  // Hook que se ejecuta al montar el componente
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const decoded = jwtDecode(token);
    setCurrentUserId(decoded.sub);

    // Función para cargar los datos del usuario
    const loadUserData = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/users/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        
        // Asegurarse de que followers y following son arrays
        const safeData = {
          ...data,
          followers: Array.isArray(data.followers) ? data.followers : [],
          following: Array.isArray(data.following) ? data.following : [],
        };

        setUser(safeData);
        
        // Verificar si el usuario actual sigue a este perfil
        if (decoded.sub) {
          setIsFollowing(
            safeData.followers.some((f) => f.id === decoded.sub)
          );
        }
      } catch (err) {
        console.error("Error al obtener perfil", err);
        navigate("/login");
      }
    };

    loadUserData();
  }, [id, navigate]); // Añade id y navigate como dependencias

  // Maneja la acción de "seguir"
  const handleFollow = () => {
    const token = sessionStorage.getItem("token");

    fetch(`http://localhost:8080/api/follow/${id}/follow`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        userId: currentUserId,
      },
    })
      .then(() => {
        setIsFollowing(true);
        // Actualizamos el estado local agregando el nuevo seguidor
        setUser((prev) => ({
          ...prev,
          followers: [...prev.followers, { id: currentUserId }],
        }));
      })
      .catch((err) => console.error("Error al seguir", err));
  };

  // Maneja la acción de "dejar de seguir"
  const handleUnfollow = () => {
    const token = sessionStorage.getItem("token");

    fetch(`http://localhost:8080/api/follow/${id}/unfollow`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        userId: currentUserId,
      },
    })
      .then(() => {
        setIsFollowing(false);
        // Quitamos al usuario actual de la lista de seguidores
        setUser((prev) => ({
          ...prev,
          followers: prev.followers.filter((f) => f.id !== currentUserId),
        }));
      })
      .catch((err) => console.error("Error al dejar de seguir", err));
  };

  // Botón para volver a la página anterior o al inicio
  const handleBack = () => {
    navigate("/");
  };

  // Botón para ir al chat con este usuario
  const handleChat = () => {
    navigate(`/chat/${id}`);
  };

  // Mientras se carga la info del perfil
  if (!user) return <div className="text-center mt-10">Cargando...</div>;

  // Cantidades de seguidores y seguidos
  const followersCount = Array.isArray(user.followers) ? user.followers.length : 0;
  const followingCount = Array.isArray(user.following) ? user.following.length : 0;

  return (
    <div
      className={`min-h-screen ${theme === "light" ? "bg-gray-100" : "bg-gray-900"} text-gray-900 dark:text-white p-4`}
    >
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        {/* Botón de volver */}
        <button
          onClick={handleBack}
          className="text-gray-500 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 mb-4"
          title="Volver"
        >
          <FaArrowLeft />
        </button>

        {/* Header: foto de perfil + username + stats en línea */}
        <div className="flex items-center space-x-6 mb-6">
          {/* Foto de perfil */}
          <div>
            {user.imageUrl ? (
              <img
                src={user.imageUrl}
                alt="Foto de perfil"
                className="w-28 h-28 rounded-full object-cover"
              />
            ) : (
              <FaUserCircle className="w-28 h-28 text-gray-500" />
            )}
          </div>

          {/* Username y estadísticas */}
          <div>
            <h1 className="text-2xl font-bold">{user.username}</h1>
            <div className="flex space-x-6 mt-2 text-gray-600 dark:text-gray-300">
              <span>
                <strong>{followersCount}</strong> Seguidores
              </span>
              <span>
                <strong>{followingCount}</strong> Siguiendo
              </span>
            </div>
          </div>
        </div>

        {/* Descripción del usuario */}
        {user.description && (
          <p className="text-gray-700 dark:text-gray-300 mb-6">{user.description}</p>
        )}

        {/* Botones de acción: seguir / dejar de seguir / enviar mensaje */}
        <div className="flex space-x-4">
          {isFollowing ? (
            <>
              <button
                onClick={handleUnfollow}
                className="w-full sm:w-1/2 px-6 py-2 border border-red-600 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-md transition"
              >
                Dejar de seguir
              </button>
              <button
                onClick={handleChat}
                className="w-full sm:w-1/2 px-6 py-2 border border-blue-500 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-md transition"
              >
                Enviar mensaje
              </button>
            </>
          ) : (
            <button
              onClick={handleFollow}
              className="w-1/2 mx-auto px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition block"
            >
              Seguir
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerfilUsuario;
