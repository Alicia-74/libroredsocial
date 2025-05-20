import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaUserCircle, FaArrowLeft, FaRegComment, FaBook, FaHeart, FaCheck } from "react-icons/fa";
import { FiUserPlus, FiUserMinus } from "react-icons/fi";
import { ThemeContext } from "../context/ThemeContext";
import { jwtDecode } from "jwt-decode";

const PerfilUsuario = () => {
  // Obtener parámetros de la URL y navegación
  const { id } = useParams(); // ID del usuario cuyo perfil estamos viendo
  const navigate = useNavigate(); // Para navegar entre páginas
  const { theme } = useContext(ThemeContext); // Tema claro/oscuro

  // Estados para los datos del usuario
  const [user, setUser] = useState(null); // Datos del usuario cuyo perfil estamos viendo
  const [currentUserId, setCurrentUserId] = useState(null); // ID del usuario actual (el que está logueado)
  const [isFollowing, setIsFollowing] = useState(false); // Si el usuario actual sigue a este usuario
  const [isLoading, setIsLoading] = useState(true); // Estado de carga general
  const [activeTab, setActiveTab] = useState("favoritos"); // Pestaña activa (favoritos/leídos)
  
  // Estados para los libros
  const [favoriteBooks, setFavoriteBooks] = useState([]); // Libros favoritos del usuario
  const [readBooks, setReadBooks] = useState([]); // Libros leídos del usuario
  const [booksLoading, setBooksLoading] = useState(true); // Estado de carga de libros
  const [booksError, setBooksError] = useState(null); // Error al cargar libros
  
  // Estados para el seguimiento de usuarios
  const [isFollowLoading, setIsFollowLoading] = useState(false); // Estado de carga para botones de seguir/dejar de seguir
  const [followError, setFollowError] = useState(null); // Error en operaciones de seguimiento

  /**
   * Carga los datos del usuario desde el backend
   */
  const loadUserData = async () => {
    setIsLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // Decodificar el token para obtener el ID del usuario actual
      const decoded = jwtDecode(token);
      setCurrentUserId(decoded.sub);

      // 1. Cargar datos del usuario cuyo perfil estamos viendo
      const userResponse = await fetch(`http://localhost:8080/api/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error("No se pudo cargar el perfil del usuario");
      }

      const userData = await userResponse.json();

      // Asegurarnos que followers y following son arrays (por si el backend devuelve null/undefined)
      const safeData = {
        ...userData,
        followers: Array.isArray(userData.followers) ? userData.followers : [],
        following: Array.isArray(userData.following) ? userData.following : [],
      };

      setUser(safeData);

      // 2. Verificar si el usuario actual sigue a este usuario
      const followCheckResponse = await fetch(`http://localhost:8080/api/follow/${id}/is-following`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          userId: decoded.sub,
        },
      });

      if (followCheckResponse.ok) {
        const isFollowingResult = await followCheckResponse.json();
        setIsFollowing(isFollowingResult === true);
      } else {
        console.warn("No se pudo verificar el estado de seguimiento");
        setIsFollowing(false);
      }

    } catch (err) {
      console.error("Error al obtener datos del usuario", err);
      navigate("/login");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Carga los libros (favoritos y leídos) del usuario
   */
  const loadBooks = async () => {
    setBooksLoading(true);
    setBooksError(null);
    try {
      const token = sessionStorage.getItem("token");
      
      // Cargar libros favoritos
      const favResponse = await fetch(`http://localhost:8080/api/books/fav/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!favResponse.ok) throw new Error("Error al cargar favoritos");
      const favData = await favResponse.json();
      setFavoriteBooks(favData);
      
      // Cargar libros leídos
      const readResponse = await fetch(`http://localhost:8080/api/books/read/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!readResponse.ok) throw new Error("Error al cargar leídos");
      const readData = await readResponse.json();
      setReadBooks(readData);
    } catch (err) {
      console.error("Error loading books:", err);
      setBooksError(err.message);
    } finally {
      setBooksLoading(false);
    }
  };

  // Efecto para cargar los datos cuando el componente se monta o cambia el ID
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    loadUserData();
    loadBooks();
  }, [id, navigate]);

  /**
   * Maneja el seguimiento a un usuario
   */
  const handleFollow = async () => {
    setFollowError(null);
    setIsFollowLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(`http://localhost:8080/api/follow/${id}/follow`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          userId: currentUserId,
        },
      });

      if (!response.ok) {
        throw new Error("Error al seguir usuario");
      }

      setIsFollowing(true);
      // Vuelve a cargar los datos para asegurar consistencia
      await loadUserData();
    } catch (err) {
      console.error("Error al seguir", err);
      setFollowError("Error al seguir usuario. Inténtalo de nuevo.");
    } finally {
      setIsFollowLoading(false);
    }
  };

  /**
   * Maneja dejar de seguir a un usuario
   */
  const handleUnfollow = async () => {
    setFollowError(null);
    setIsFollowLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(`http://localhost:8080/api/follow/${id}/unfollow`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          userId: currentUserId,
        },
      });

      if (!response.ok) {
        throw new Error("Error al dejar de seguir usuario");
      }

      setIsFollowing(false);
      // Vuelve a cargar los datos para asegurar consistencia
      await loadUserData();
    } catch (err) {
      console.error("Error al dejar de seguir", err);
      setFollowError("Error al dejar de seguir usuario. Inténtalo de nuevo.");
    } finally {
      setIsFollowLoading(false);
    }
  };

  // Navegación
  const handleBack = () => navigate(-1); // Volver a la página anterior
  const handleChat = () => navigate(`/chat/${id}`); // Ir al chat con este usuario

  /**
   * Componente para mostrar un libro en la lista
   * @param {Object} book - Datos del libro
   * @param {string} type - Tipo de libro ('favorite' o 'read')
   */
  const BookItem = ({ book, type }) => (
    <div 
      className={`flex items-start p-3 rounded-lg ${theme === "light" ? "bg-gray-50 hover:bg-gray-100" : "bg-gray-700 hover:bg-gray-600"} transition-colors cursor-pointer`}
      onClick={() => navigate(`/book/${book.olid}`)}
    >
      {/* Imagen del libro con fallback si no carga */}
      <img
        src={`http://localhost:8080/api/books/external/book/${book.olid}-L.jpg`}
        alt={book.title}
        className="w-16 h-20 object-cover rounded shadow mr-4"
        loading="lazy"
        onError={(e) => {
          e.target.src = "https://via.placeholder.com/64x80?text=No+Image";
        }}
      />
      <div>
        {/* Título del libro (se limita a 2 líneas) */}
        <h4 className="font-medium line-clamp-2 dark:text-gray-100">{book.title}</h4>
        {/* Autores del libro (si existen) */}
        {book.authors && (
          <p className={`text-sm mt-1 ${theme === "light" ? "text-gray-600" : "text-gray-300"}`}>
            {book.authors.join(", ")}
          </p>
        )}
        {/* Indicador de tipo (favorito o leído) */}
        <div className={`flex items-center mt-2 ${
          type === 'favorite' ? 'text-yellow-500' : 'text-green-500'
        }`}>
          {type === 'favorite' ? <FaHeart className="mr-1" /> : <FaCheck className="mr-1" />}
          <span className="text-xs">{type === 'favorite' ? 'Favorito' : 'Leído'}</span>
        </div>
      </div>
    </div>
  );

  // Mostrar spinner de carga mientras se obtienen los datos
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${theme === "light" ? "bg-gray-50" : "bg-gray-900"}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Mostrar mensaje si no se pudo cargar el perfil
  if (!user) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${theme === "light" ? "bg-gray-50" : "bg-gray-900"}`}>
        <div className="text-center">
          <p className={`text-lg ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>
            No se pudo cargar el perfil
          </p>
          <button
            onClick={() => navigate("/")}
            className={`mt-4 px-4 py-2 rounded-md ${theme === "light" ? "bg-blue-500 text-white" : "bg-blue-600 text-white"} hover:bg-blue-600 transition-colors`}
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // Contadores para estadísticas
  const followersCount = user.followers?.length || 0; // Personas que siguen a este usuario
  const followingCount = user.following?.length || 0; // Personas que este usuario sigue

  return (
    <div className={`min-h-screen ${theme === "light" ? "bg-gray-50" : "bg-gray-900"} transition-colors duration-300`}>
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Encabezado con botón de volver y título */}
        <header className="flex justify-between items-center mb-6">
          <button
            onClick={handleBack}
            className={`flex items-center space-x-2 ${theme === "light" ? "text-gray-700" : "text-gray-300"} hover:text-blue-500 transition-colors`}
          >
            <FaArrowLeft className="text-lg" />
            <span className="hidden sm:inline">Volver</span>
          </button>
          
          <h1 className="text-2xl font-bold text-center">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Perfil de Usuario
            </span>
          </h1>
          
          <div className="w-10"></div> {/* Espaciador para alinear el título */}
        </header>

        {/* Tarjeta de perfil */}
        <div className={`rounded-xl shadow-lg overflow-hidden ${theme === "light" ? "bg-white" : "bg-gray-800"} transition-colors duration-300`}>
          {/* Banner superior con gradiente */}
          <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative">
            {/* Foto de perfil (absoluta para superponer sobre el banner) */}
            <div className="absolute -bottom-16 left-6">
              <div className="relative">
                {user.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt="Perfil"
                    className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-md"
                  />
                ) : (
                  <FaUserCircle className="w-32 h-32 text-gray-300 rounded-full border-4 border-white bg-white" />
                )}
              </div>
            </div>
          </div>

          {/* Información del usuario */}
          <div className="pt-20 px-6 pb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold dark:text-gray-100">{user.username}</h2>
                <p className={`text-sm ${theme === "light" ? "text-gray-500" : "text-gray-300"}`}>
                  Miembro desde {user?.createdAtFormatted || "Fecha no disponible"}
                </p>
              </div>
            </div>

            {/* Descripción del usuario (si existe) */}
            {user.description && (
              <div className="mb-6">
                <p className={`${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>
                  {user.description}
                </p>
              </div>
            )}

            {/* Estadísticas del usuario */}
            <div className="grid grid-cols-3 gap-4 mb-6 text-center">
              <div className={`p-3 rounded-lg ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-gray-700"} transition-colors`}>
                <p className="text-2xl font-bold dark:text-white">{followingCount}</p>
                <p className={`text-sm ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
                  Seguidores
                </p>
              </div>
              <div className={`p-3 rounded-lg ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-gray-700"} transition-colors`}>
                <p className="text-2xl font-bold dark:text-white">{followersCount}</p>
                <p className={`text-sm ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
                  Siguiendo
                </p>
              </div>
              <div className={`p-3 rounded-lg ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-gray-700"} transition-colors`}>
                <p className="text-2xl font-bold dark:text-white">{favoriteBooks.length + readBooks.length}</p>
                <p className={`text-sm ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
                  Libros
                </p>
              </div>
            </div>

            {/* Botones de acción (seguir/dejar de seguir, mensaje) */}
            <div className="flex space-x-4">
              {isFollowing ? (
                <>
                  <button
                    onClick={handleUnfollow}
                    disabled={isFollowLoading}
                    className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 border border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors ${isFollowLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isFollowLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-500"></div>
                    ) : (
                      <>
                        <FiUserMinus />
                        <span>Dejar de seguir</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleChat}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    <FaRegComment />
                    <span>Mensaje</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={handleFollow}
                  disabled={isFollowLoading}
                  className={`w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors ${isFollowLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isFollowLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <FiUserPlus />
                      <span>Seguir</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Mostrar error de seguimiento si existe */}
            {followError && (
              <div className="mt-2 text-sm text-red-500 text-center">
                {followError}
              </div>
            )}
          </div>
        </div>

        {/* Sección de libros (favoritos/leídos) */}
        <div className={`mt-6 rounded-xl shadow-lg overflow-hidden ${theme === "light" ? "bg-white" : "bg-gray-800"} transition-colors duration-300`}>
          {/* Pestañas para alternar entre favoritos y leídos */}
          <div className="flex border-b border-gray-200 dark:border-gray-600">
            <button
              onClick={() => setActiveTab("favoritos")}
              className={`flex-1 py-3 font-medium text-sm flex items-center justify-center space-x-2 ${activeTab === "favoritos" 
                ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400" 
                : theme === "light" 
                ? "text-gray-500 hover:text-gray-700" 
                : "text-gray-400 hover:text-gray-300"} transition-colors`}
            >
              <FaHeart />
              <span>Favoritos ({favoriteBooks.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("leidos")}
              className={`flex-1 py-3 font-medium text-sm flex items-center justify-center space-x-2 ${activeTab === "leidos" 
                ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400" 
                : theme === "light" 
                ? "text-gray-500 hover:text-gray-700" 
                : "text-gray-400 hover:text-gray-300"} transition-colors`}
            >
              <FaCheck />
              <span>Leídos ({readBooks.length})</span>
            </button>
          </div>

          {/* Contenido de las pestañas */}
          <div className="p-4">
            {booksLoading ? (
              // Spinner de carga para libros
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : booksError ? (
              // Mensaje de error al cargar libros
              <div className="text-center py-10 text-red-500">
                Error al cargar libros: {booksError}
              </div>
            ) : activeTab === "favoritos" ? (
              // Mostrar libros favoritos
              favoriteBooks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {favoriteBooks.map((book) => (
                    <BookItem key={book.olid} book={book} type="favorite" />
                  ))}
                </div>
              ) : (
                // Estado vacío para favoritos
                <div className="text-center py-10">
                  <div className={`inline-block p-4 rounded-full ${theme === "light" ? "bg-gray-100" : "bg-gray-700"}`}>
                    <FaHeart className="w-12 h-12 mx-auto text-gray-400" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium dark:text-gray-100">
                    No hay libros favoritos
                  </h3>
                  <p className={`mt-1 ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
                    {user.username} no ha marcado libros como favoritos todavía.
                  </p>
                </div>
              )
            ) : // Mostrar libros leídos
            readBooks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {readBooks.map((book) => (
                  <BookItem key={book.olid} book={book} type="read" />
                ))}
              </div>
            ) : (
              // Estado vacío para leídos
              <div className="text-center py-10">
                <div className={`inline-block p-4 rounded-full ${theme === "light" ? "bg-gray-100" : "bg-gray-700"}`}>
                  <FaBook className="w-12 h-12 mx-auto text-gray-400" />
                </div>
                <h3 className="mt-4 text-lg font-medium dark:text-gray-100">
                  No hay libros leídos
                </h3>
                <p className={`mt-1 ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
                  {user.username} no ha marcado libros como leídos todavía.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfilUsuario;