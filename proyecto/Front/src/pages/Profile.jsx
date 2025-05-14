import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle, FaArrowLeft, FaCamera, FaTrash } from "react-icons/fa";
import { FiSun, FiMoon, FiLogOut } from "react-icons/fi";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";

const Profile = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  // Estado del usuario y configuraciones de edición
  const [user, setUser] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [newDescription, setNewDescription] = useState("");

  // Imagen de perfil
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Pestañas y secciones
  const [activeTab, setActiveTab] = useState("mensajes");
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  const [favoriteBooks, setFavoriteBooks] = useState([]);
  const [readBooks, setReadBooks] = useState([]);

  // Carga inicial de datos del usuario
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const decoded = jwtDecode(token);
    setCurrentUserId(decoded.sub);

    fetch(`http://localhost:8080/api/users/${decoded.sub}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
        setNewDescription(data.description || "");
      })
      .catch((err) => {
        console.error("Error al obtener perfil", err);
        navigate("/login");
      });

    fetch(`http://localhost:8080/api/books/fav/${decoded.sub}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setFavoriteBooks(data))
      .catch((err) => console.error("Error al obtener favoritos", err));

    fetch(`http://localhost:8080/api/books/read/${decoded.sub}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setReadBooks(data))
      .catch((err) => console.error("Error al obtener leídos", err));
  }, [navigate]);

  // Cerrar sesión
  const handleLogout = () => {
    sessionStorage.removeItem("token");
    logout();
    navigate("/login");
  };

  // Edición de descripción
  const handleDescriptionChange = (e) => setNewDescription(e.target.value);

  const handleSaveDescription = () => {
    fetch(`http://localhost:8080/api/users/${currentUserId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
      body: JSON.stringify({ description: newDescription }),
    })
      .then((res) => res.json())
      .then(() => {
        setUser((prev) => ({ ...prev, description: newDescription }));
        setIsEditingDescription(false);
      })
      .catch((err) => console.error("Error al actualizar la descripción", err));
  };

  // Cargar imagen de perfil
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        `http://localhost:8080/api/users/${currentUserId}/upload-profile-image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Error al subir la imagen");

      const updatedUser = await response.json();
      setUser((prev) => ({ ...prev, imageUrl: updatedUser.imageUrl }));
    } catch (err) {
      console.error("Error:", err);
      alert(`Error al subir la imagen: ${err.message || err}`);
    }
  };

  // Eliminar imagen de perfil
  const handleDeleteProfilePicture = () => {
    fetch(`http://localhost:8080/api/users/${currentUserId}/profile-picture`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    })
      .then(() => {
        setUser((prev) => ({ ...prev, imageUrl: null }));
        setImagePreview(null);
      })
      .catch((err) => {
        console.error("Error al eliminar la imagen:", err);
        alert("Error al eliminar la imagen");
      });
  };

  const handleBack = () => navigate("/");

  // Alternar listas
  const toggleFollowers = () => {
    setShowFollowers((prev) => !prev);
    setShowFollowing(false);
  };

  const toggleFollowing = () => {
    setShowFollowing((prev) => !prev);
    setShowFollowers(false);
  };

  if (!user)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  const followersCount = Array.isArray(user.followers) ? user.followers.length : 0;
  const followingCount = Array.isArray(user.following) ? user.following.length : 0;

  return (
    <div className={`min-h-screen ${theme === "light" ? "bg-gray-50" : "bg-gray-900"} transition-colors duration-300`}>
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Encabezado */}
        <header className="flex justify-between items-center mb-8">
          <button
            onClick={handleBack}
            className={`flex items-center space-x-2 ${theme === "light" ? "text-gray-700" : "text-gray-300"} hover:text-blue-500 transition-colors`}
          >
            <FaArrowLeft className="text-lg" />
            <span className="hidden sm:inline">Volver</span>
          </button>
          
          <h1 className="text-2xl font-bold text-center">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Mi Perfil
            </span>
          </h1>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full ${theme === "light" ? "bg-gray-200 hover:bg-gray-300" : "bg-gray-700 hover:bg-gray-600"} transition-colors`}
              aria-label="Cambiar tema"
            >
              {theme === "light" ? <FiMoon size={18} /> : <FiSun size={18} />}
            </button>
            <button
              onClick={handleLogout}
              className={`p-2 rounded-full ${theme === "light" ? "bg-gray-200 hover:bg-gray-300" : "bg-gray-700 hover:bg-gray-600"} transition-colors`}
              aria-label="Cerrar sesión"
            >
              <FiLogOut size={18} />
            </button>
          </div>
        </header>

        {/* Sección principal del perfil */}
        <div className={`rounded-xl shadow-lg overflow-hidden ${theme === "light" ? "bg-white" : "bg-gray-800"} transition-colors duration-300`}>
          {/* Encabezado del perfil */}
          <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-600">
            <div className="absolute -bottom-16 left-6">
              <div className="relative group">
                {imagePreview || user.imageUrl ? (
                  <img
                    src={imagePreview || user.imageUrl}
                    alt="Perfil"
                    className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-md"
                  />
                ) : (
                  <FaUserCircle className="w-32 h-32 text-gray-300 rounded-full border-4 border-white bg-white" />
                )}
                <label
                  htmlFor="file-upload"
                  className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <FaCamera />
                </label>
                <input
                  type="file"
                  id="file-upload"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {imagePreview || user.imageUrl ? (
                  <button
                    onClick={handleDeleteProfilePicture}
                    className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <FaTrash size={14} />
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          {/* Información del usuario */}
          <div className="pt-20 px-6 pb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold dark:text-gray-100">{user.username}</h2>
                <p className={`text-sm ${theme === "light" ? "text-gray-500" : "text-gray-300"}`}>
                  Miembro desde {user.createAt}
                </p>
              </div>
            </div>

            {/* Descripción */}
            <div className="mb-6">
              {isEditingDescription ? (
                <div className="space-y-3">
                  <textarea
                    value={newDescription}
                    onChange={handleDescriptionChange}
                    className={`w-full p-3 rounded-lg border ${theme === "light" ? "border-gray-300" : "border-gray-600 bg-gray-700"} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Cuéntanos algo sobre ti..."
                    rows="3"
                  />
                  <div className="flex space-x-3">
                    <button
                      onClick={handleSaveDescription}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingDescription(false);
                        setNewDescription(user.description || "");
                      }}
                      className={`px-4 py-2 rounded-lg ${theme === "light" ? "bg-gray-200 hover:bg-gray-300" : "bg-gray-700 hover:bg-gray-600"} transition-colors`}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className={`mb-2 ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>
                    {user.description || "Este usuario no ha añadido una descripción todavía."}
                  </p>
                  <button
                    onClick={() => setIsEditingDescription(true)}
                    className={`text-sm ${theme === "light" ? "text-blue-600 hover:text-blue-800" : "text-blue-400 hover:text-blue-300"} transition-colors`}
                  >
                    Editar descripción
                  </button>
                </div>
              )}
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-3 gap-4 mb-6 text-center">
              <div
                onClick={toggleFollowers}
                className={`p-3 rounded-lg cursor-pointer ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-gray-700"} transition-colors`}
              >
                <p className="text-2xl font-bold dark:text-white">{followersCount}</p>
                <p className={`text-sm ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
                  Seguidores
                </p>
              </div>
              <div
                onClick={toggleFollowing}
                className={`p-3 rounded-lg cursor-pointer ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-gray-700"} transition-colors`}
              >
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

            {/* Listas de seguidores/seguidos */}
            {(showFollowers || showFollowing) && (
              <div className={`mb-6 rounded-lg overflow-hidden ${theme === "light" ? "bg-gray-50" : "bg-gray-700"} transition-colors`}>
                <div className="p-4 border-b border-gray-200 dark:border-gray-600">
                  <h3 className="font-semibold dark:text-gray-100">
                    {showFollowers ? "Seguidores" : "Siguiendo"}
                  </h3>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-600">
                  {(showFollowers ? user.followers : user.following)?.length > 0 ? (
                    (showFollowers ? user.followers : user.following).map((person) => (
                      <div key={person.id} className="p-4 flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                        {person.imageUrl ? (
                          <img
                            src={person.imageUrl}
                            alt={person.username}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <FaUserCircle className="w-10 h-10 text-gray-400" />
                        )}
                        <span className="font-medium dark:text-gray-200">{person.username}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-300">
                      {showFollowers ? "No tienes seguidores" : "No estás siguiendo a nadie"}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pestañas */}
            <div className="mb-6">
              <div className="flex border-b border-gray-200 dark:border-gray-600">
                {["mensajes", "favoritos", "leidos"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 font-medium text-sm ${activeTab === tab
                      ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                      : theme === "light"
                      ? "text-gray-500 hover:text-gray-700"
                      : "text-gray-400 hover:text-gray-300"
                      } transition-colors`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Contenido de las pestañas */}
              <div className="mt-4 min-h-[200px]">
                {activeTab === "mensajes" && (
                  <div className="text-center py-10">
                    <div className={`inline-block p-4 rounded-full ${theme === "light" ? "bg-gray-100" : "bg-gray-700"}`}>
                      <svg
                        className="w-12 h-12 mx-auto text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                      </svg>
                    </div>
                    <h3 className="mt-4 text-lg font-medium dark:text-gray-100">
                      Tus mensajes aparecerán aquí
                    </h3>
                    <p className={`mt-1 ${theme === "light" ? "text-gray-500" : "text-gray-200"}`}>
                      Cuando envíes o recibas mensajes, los verás en esta sección.
                    </p>
                  </div>
                )}

                {activeTab === "favoritos" && (
                  <div>
                    {favoriteBooks.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {favoriteBooks.map((book) => (
                          <div
                            key={book.olid}
                            className={`flex items-start p-3 rounded-lg ${theme === "light" ? "bg-white hover:bg-gray-50 border border-gray-200" : "bg-gray-700 hover:bg-gray-600 border border-gray-600"} transition-colors shadow-sm`}
                          >
                            <img
                              src={`http://localhost:8080/api/books/external/book/${book.olid}-L.jpg`}
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
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <div className={`inline-block p-4 rounded-full ${theme === "light" ? "bg-gray-100" : "bg-gray-700"}`}>
                          <svg
                            className="w-12 h-12 mx-auto text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1}
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                          </svg>
                        </div>
                        <h3 className="mt-4 text-lg font-medium dark:text-gray-100">
                          No hay libros favoritos
                        </h3>
                        <p className={`mt-1 ${theme === "light" ? "text-gray-500" : "text-gray-200"}`}>
                          Marca libros como favoritos para verlos aquí.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "leidos" && (
                  <div>
                    {readBooks.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {readBooks.map((book) => (
                          <div
                            key={book.olid}
                            className={`flex items-start p-3 rounded-lg ${theme === "light" ? "bg-white hover:bg-gray-50 border border-gray-200" : "bg-gray-700 hover:bg-gray-600 border border-gray-600"} transition-colors shadow-sm`}
                          >
                            <img
                              src={`http://localhost:8080/api/books/external/book/${book.olid}-L.jpg`}
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
                              <div className="flex items-center mt-2">
                                <span className={`text-xs px-2 py-1 rounded ${theme === "light" ? "bg-green-100 text-green-800" : "bg-green-900 text-green-200"}`}>
                                  Leído
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <div className={`inline-block p-4 rounded-full ${theme === "light" ? "bg-gray-100" : "bg-gray-700"}`}>
                          <svg
                            className="w-12 h-12 mx-auto text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1}
                              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                            />
                          </svg>
                        </div>
                        <h3 className="mt-4 text-lg font-medium dark:text-gray-100">
                          No hay libros leídos
                        </h3>
                        <p className={`mt-1 ${theme === "light" ? "text-gray-500" : "text-gray-200"}`}>
                          Marca libros como leídos para verlos aquí.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;