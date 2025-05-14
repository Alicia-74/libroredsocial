import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaUserCircle, FaArrowLeft, FaRegComment, FaBook, FaHeart, FaCheck } from "react-icons/fa";
import { FiUserPlus, FiUserMinus } from "react-icons/fi";
import { ThemeContext } from "../context/ThemeContext";
import { jwtDecode } from "jwt-decode";

const PerfilUsuario = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);

  const [user, setUser] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("favoritos"); // 'favoritos' o 'leidos'
  const [favoriteBooks, setFavoriteBooks] = useState([]);
  const [readBooks, setReadBooks] = useState([]);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const decoded = jwtDecode(token);
    setCurrentUserId(decoded.sub);

    const loadUserData = async () => {
      setIsLoading(true);
      try {
        // Cargar datos del usuario
        const userResponse = await fetch(`http://localhost:8080/api/users/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const userData = await userResponse.json();
        
        const safeData = {
          ...userData,
          followers: Array.isArray(userData.followers) ? userData.followers : [],
          following: Array.isArray(userData.following) ? userData.following : [],
        };

        setUser(safeData);
        
        if (decoded.sub) {
          setIsFollowing(safeData.followers.some((f) => f.id === decoded.sub));
        }

        // Cargar libros favoritos
        const favResponse = await fetch(`http://localhost:8080/api/books/fav/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const favData = await favResponse.json();
        setFavoriteBooks(favData);

        // Cargar libros leídos
        const readResponse = await fetch(`http://localhost:8080/api/books/read/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const readData = await readResponse.json();
        setReadBooks(readData);

      } catch (err) {
        console.error("Error al obtener datos", err);
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [id, navigate]);

  const handleFollow = async () => {
    const token = sessionStorage.getItem("token");
    try {
      await fetch(`http://localhost:8080/api/follow/${id}/follow`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          userId: currentUserId,
        },
      });
      setIsFollowing(true);
      setUser((prev) => ({
        ...prev,
        followers: [...prev.followers, { id: currentUserId }],
      }));
    } catch (err) {
      console.error("Error al seguir", err);
    }
  };

  const handleUnfollow = async () => {
    const token = sessionStorage.getItem("token");
    try {
      await fetch(`http://localhost:8080/api/follow/${id}/unfollow`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          userId: currentUserId,
        },
      });
      setIsFollowing(false);
      setUser((prev) => ({
        ...prev,
        followers: prev.followers.filter((f) => f.id !== currentUserId),
      }));
    } catch (err) {
      console.error("Error al dejar de seguir", err);
    }
  };

  const handleBack = () => navigate(-1);
  const handleChat = () => navigate(`/chat/${id}`);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${theme === "light" ? "bg-gray-50" : "bg-gray-900"}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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

  const followersCount = user.followers.length;
  const followingCount = user.following.length;

  return (
    <div className={`min-h-screen ${theme === "light" ? "bg-gray-50" : "bg-gray-900"} transition-colors duration-300`}>
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Encabezado */}
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
          {/* Banner superior */}
          <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative">
            {/* Foto de perfil */}
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
                <p className={`text-sm ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
                  Miembro desde {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Descripción */}
            {user.description && (
              <div className="mb-6">
                <p className={`${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>
                  {user.description}
                </p>
              </div>
            )}

            {/* Estadísticas */}
            <div className="grid grid-cols-3 gap-4 mb-6 text-center">
              <div className={`p-3 rounded-lg ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-gray-700"} transition-colors`}>
                <p className="text-2xl font-bold dark:text-white">{followersCount}</p>
                <p className={`text-sm ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
                  Seguidores
                </p>
              </div>
              <div className={`p-3 rounded-lg ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-gray-700"} transition-colors`}>
                <p className="text-2xl font-bold dark:text-white">{followingCount}</p>
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

            {/* Botones de acción */}
            <div className="flex space-x-4">
              {isFollowing ? (
                <>
                  <button
                    onClick={handleUnfollow}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 border border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  >
                    <FiUserMinus />
                    <span>Dejar de seguir</span>
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
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  <FiUserPlus />
                  <span>Seguir</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sección de libros */}
        <div className={`mt-6 rounded-xl shadow-lg overflow-hidden ${theme === "light" ? "bg-white" : "bg-gray-800"} transition-colors duration-300`}>
          {/* Pestañas de libros */}
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
            {activeTab === "favoritos" ? (
              favoriteBooks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {favoriteBooks.map((book) => (
                    <div 
                      key={book.olid}
                      className={`flex items-start p-3 rounded-lg ${theme === "light" ? "bg-gray-50 hover:bg-gray-100" : "bg-gray-700 hover:bg-gray-600"} transition-colors cursor-pointer`}
                      onClick={() => navigate(`/book/${book.olid}`)}
                    >
                      <img
                        src={`http://localhost:8080/api/books/external/book/${book.olid}-M.jpg`}
                        alt={book.title}
                        className="w-16 h-20 object-cover rounded shadow mr-4"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/64x80?text=No+Image";
                        }}
                      />
                      <div>
                        <h4 className="font-medium line-clamp-2 dark:text-gray-100">{book.title}</h4>
                        {book.authors && (
                          <p className={`text-sm mt-1 ${theme === "light" ? "text-gray-600" : "text-gray-300"}`}>
                            {book.authors.join(", ")}
                          </p>
                        )}
                        <div className="flex items-center mt-2 text-yellow-500">
                          <FaHeart className="mr-1" />
                          <span className="text-xs">Favorito</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
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
            ) : (
              readBooks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {readBooks.map((book) => (
                    <div 
                      key={book.olid}
                      className={`flex items-start p-3 rounded-lg ${theme === "light" ? "bg-gray-50 hover:bg-gray-100" : "bg-gray-700 hover:bg-gray-600"} transition-colors cursor-pointer`}
                      onClick={() => navigate(`/book/${book.olid}`)}
                    >
                      <img
                        src={`http://localhost:8080/api/books/external/book/${book.olid}-M.jpg`}
                        alt={book.title}
                        className="w-16 h-20 object-cover rounded shadow mr-4"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/64x80?text=No+Image";
                        }}
                      />
                      <div>
                        <h4 className="font-medium line-clamp-2 dark:text-gray-100">{book.title}</h4>
                        {book.authors && (
                          <p className={`text-sm mt-1 ${theme === "light" ? "text-gray-600" : "text-gray-300"}`}>
                            {book.authors.join(", ")}
                          </p>
                        )}
                        <div className="flex items-center mt-2 text-green-500">
                          <FaCheck className="mr-1" />
                          <span className="text-xs">Leído</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
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
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfilUsuario;