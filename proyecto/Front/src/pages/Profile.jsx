import React, { useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle, FaArrowLeft, FaCamera, FaTrash, FaSearch, FaPaperPlane } from "react-icons/fa"; // Importa FaPaperPlane para el botón de enviar mensaje
import { FiSun, FiMoon, FiLogOut } from "react-icons/fi";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import UserFollowList from "../components/UserFollowList"; // Importa el componente UserFollowList
import ChatComponent from "../components/ChatComponent"; // Importa el nuevo ChatComponent

/**
 * Componente principal de perfil de usuario
 * Muestra la información del usuario, sus libros y relaciones de seguimiento
 * Incluye funcionalidad para editar perfil, cambiar tema y gestionar listas de libros
 */
const Profile = () => {
  // Hooks para navegación y contexto
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  // Estados del usuario
  const [user, setUser] = useState(null); // Datos completos del usuario
  const [currentUserId, setCurrentUserId] = useState(null); // ID del usuario logueado (el que está viendo su propio perfil)
  const [isEditingDescription, setIsEditingDescription] = useState(false); // Control de edición de la descripción
  const [newDescription, setNewDescription] = useState(""); // Descripción editada
  const [imagePreview, setImagePreview] = useState(null); // Vista previa de la imagen de perfil

  // Estados para pestañas y listas de seguidores/seguidos
  const [activeTab, setActiveTab] = useState("mensajes"); // Pestaña activa ('mensajes', 'favoritos', 'leidos')
  const [followListConfig, setFollowListConfig] = useState({
    show: false, // Visibilidad del modal de lista de seguidores/seguidos
    type: null, // Tipo de lista a mostrar: 'followers' o 'following'
    title: "", // Título del modal
    userId: null, // ID del usuario cuyas listas se están viendo (para el perfil propio, será currentUserId)
  });

  // Estados para gestión de libros
  const [favoriteBooks, setFavoriteBooks] = useState([]); // Libros marcados como favoritos
  const [readBooks, setReadBooks] = useState([]); // Libros marcados como leídos
  const [bookSearchTerm, setBookSearchTerm] = useState(""); // Término de búsqueda para filtrar libros
  const [booksPerPage] = useState(4); // Cantidad de libros a mostrar por página
  const [currentBookPage, setCurrentBookPage] = useState(1); // Página actual de la lista de libros

  /**
   * Efecto para cargar los datos iniciales del usuario
   * Se ejecuta al montar el componente o cuando cambia la navegación (por ejemplo, al redirigir al login)
   */
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    console.log("Token de sessionStorage:", token);
    if (!token) {
      // Si no hay token, redirige al login
      navigate("/login");
      return;
    }

    // Decodificar el token para obtener el ID del usuario actual
    const decoded = jwtDecode(token);
    setCurrentUserId(decoded.sub); // Establece el ID del usuario logueado
     console.log("Token decodificado:", decoded); // Paso 2
      console.log("ID de usuario (decoded.sub):", decoded.sub); // Paso 3

    /**
     * Función asíncrona para obtener los datos del usuario desde la API
     * Incluye información básica, libros favoritos y libros leídos
     */
    const fetchUserData = async () => {
      try {
        // Realiza todas las peticiones a la API en paralelo para optimizar la carga
        const [userRes, favRes, readRes] = await Promise.all([
          fetch(`http://localhost:8080/api/users/${decoded.sub}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`http://localhost:8080/api/books/fav/${decoded.sub}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`http://localhost:8080/api/books/read/${decoded.sub}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // Procesa todas las respuestas obtenidas
        const [userData, favData, readData] = await Promise.all([
          userRes.json(),
          favRes.json(),
          readRes.json(),
        ]);

        // Actualiza los estados con los datos obtenidos
        setUser(userData); // Datos del perfil del usuario
        setNewDescription(userData.description || ""); // Inicializa la descripción para la edición
        setFavoriteBooks(favData); // Lista de libros favoritos
        setReadBooks(readData); // Lista de libros leídos
      } catch (err) {
        console.error("Error al obtener datos del perfil", err);
        // Si hay un error, redirige al login (manejo de errores básicos)
        navigate("/login");
      }
    };

    fetchUserData(); // Llama a la función para obtener los datos al cargar el componente
  }, [navigate]); // Dependencias del efecto: se ejecuta si 'navigate' cambia (generalmente, solo al montar)

  /**
   * Función para mostrar el modal de la lista de seguidores o seguidos.
   * @param {string} type - El tipo de lista a mostrar: 'followers' o 'following'.
   */
  const showFollowList = useCallback((type) => {
    // Asegúrate de que el ID del usuario actual esté disponible
    if (!currentUserId) return;

    // Configura el estado para mostrar el modal con el tipo y título correctos
    setFollowListConfig({
      show: true,
      type,
      title: type === "followers" ? "Seguidores" : "Siguiendo",
      userId: currentUserId, // El ID del usuario cuyas listas se van a mostrar (en este caso, el propio usuario)
    });
  }, [currentUserId]); // Dependencia: se actualiza si currentUserId cambia

  /**
   * Función para manejar la acción de seguir/dejar de seguir a un usuario.
   * Se pasa al componente UserFollowList para permitir la interacción dentro del modal.
   * @param {number} targetUserId - El ID del usuario al que se va a seguir o dejar de seguir.
   */
  const handleFollowToggle = useCallback(async (targetUserId) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        navigate("/login"); // Si no hay token, redirige al login
        return;
      }

      // Determina si el usuario logueado ya está siguiendo al targetUserId
      // Esto se basa en el estado 'user' local, que contiene la lista de 'following' del usuario actual
      const isCurrentlyFollowing = user?.following?.some(u => u.id === targetUserId);
      const endpoint = isCurrentlyFollowing ? "unfollow" : "follow"; // Elige el endpoint de la API

      // Realiza la petición a la API para seguir o dejar de seguir
      const response = await fetch(`http://localhost:8080/api/follow/${targetUserId}/${endpoint}`, {
        method: "GET", // Asumiendo que tu API usa GET para follow/unfollow
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error al ${isCurrentlyFollowing ? 'dejar de seguir' : 'seguir'} al usuario`);
      }

      // Actualiza el estado 'user' de forma optimista para reflejar el cambio en la lista de 'following'
      // Esto mejora la experiencia del usuario sin esperar una nueva petición de datos completos del perfil
      setUser(prevUser => {
        if (!prevUser) return null; // Si no hay usuario previo, no hace nada

        let updatedFollowing;
        if (isCurrentlyFollowing) {
          // Si ya lo seguía, lo elimina de la lista de 'following'
          updatedFollowing = prevUser.following.filter(u => u.id !== targetUserId);
        } else {
          // Si no lo seguía, lo añade a la lista de 'following'.
          // Aquí se podría hacer una petición adicional para obtener los datos completos del usuario seguido,
          // o simplemente añadir un objeto básico con su ID. Para esta demo, añadimos un placeholder.
          updatedFollowing = [...prevUser.following, { id: targetUserId, username: 'Unknown User', imageUrl: '' }];
        }
        return { ...prevUser, following: updatedFollowing }; // Retorna el usuario con la lista de 'following' actualizada
      });

      // El componente `UserFollowList` se encargará de refrescar sus propios datos
      // cuando sus props `userId` o `type` cambien, asegurando que muestre
      // el estado de seguimiento más reciente para cada usuario en su lista.
      // No es necesario actualizar `followListConfig.users` aquí directamente.

    } catch (error) {
      console.error("Error al actualizar seguimiento:", error);
      alert(`Error al actualizar seguimiento: ${error.message}`);
    }
  }, [user, navigate]); // Dependencias: 'user' para saber el estado actual, 'navigate' para redirigir

  // Contadores de relaciones
  // Se asume que `user.following` son los usuarios a quienes el `user` sigue.
  // Se asume que `user.followers` son los usuarios que siguen al `user`.
  const followingCount = Array.isArray(user?.followers) ? user.followers.length : 0;
  const followersCount = Array.isArray(user?.following) ? user.following.length : 0;


  /**
   * Función para filtrar una lista de libros según un término de búsqueda.
   * Filtra por título del libro o por el nombre del autor.
   * @param {Array} books - La lista de libros a filtrar.
   * @returns {Array} La lista de libros filtrados.
   */
  const filterBooks = (books) => {
    if (!bookSearchTerm) return books; // Si no hay término de búsqueda, devuelve todos los libros
    return books.filter(
      (book) =>
        book.title.toLowerCase().includes(bookSearchTerm.toLowerCase()) || // Filtra por título
        (book.authors &&
          book.authors.some((author) =>
            author.toLowerCase().includes(bookSearchTerm.toLowerCase()) // Filtra por autor
          ))
    );
  };

  /**
   * Función genérica para paginar un array de ítems.
   * @param {Array} items - La lista completa de ítems.
   * @param {number} page - La página actual (base 1).
   * @param {number} perPage - El número de ítems por página.
   * @returns {Object} Un objeto que contiene los ítems paginados y el número total de páginas.
   */
  const getPaginatedItems = (items, page, perPage) => {
    const startIndex = (page - 1) * perPage; // Calcula el índice de inicio
    const paginatedItems = items.slice(startIndex, startIndex + perPage); // Obtiene los ítems para la página actual
    const totalPages = Math.ceil(items.length / perPage); // Calcula el total de páginas
    return { paginatedItems, totalPages };
  };

  // Obtener libros favoritos paginados y filtrados
  const filteredFavorites = filterBooks(favoriteBooks);
  const { paginatedItems: paginatedFavorites, totalPages: totalFavPages } =
    getPaginatedItems(filteredFavorites, currentBookPage, booksPerPage);

  // Obtener libros leídos paginados y filtrados
  const filteredRead = filterBooks(readBooks);
  const { paginatedItems: paginatedRead, totalPages: totalReadPages } =
    getPaginatedItems(filteredRead, currentBookPage, booksPerPage);


  // Muestra un spinner de carga mientras se obtienen los datos del usuario
  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === "light" ? "bg-gray-50" : "bg-gray-900"} transition-colors duration-300`}>
      {/* Componente de lista de seguidores/seguidos (modal) */}
      {followListConfig.show && (
        <UserFollowList
          userId={followListConfig.userId} // Pasa el ID del usuario cuyas listas se van a buscar
          type={followListConfig.type}     // Pasa el tipo de lista ('followers' o 'following')
          title={followListConfig.title}    // Pasa el título para el modal
          currentUserId={currentUserId}    // Pasa el ID del usuario actual para saber a quién está siguiendo
          onClose={() => setFollowListConfig(prev => ({ ...prev, show: false }))} // Función para cerrar el modal
          theme={theme}                    // Pasa el tema actual para consistencia de estilo
          onFollowToggle={handleFollowToggle} // Pasa la función para seguir/dejar de seguir
        />
      )}

      {/* Contenedor principal del perfil */}
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Encabezado de la página de perfil con navegación y acciones */}
        <header className="flex justify-between items-center mb-8">
          {/* Botón para volver a la página anterior (generalmente el feed principal) */}
          <button
            onClick={() => navigate("/")}
            className={`flex items-center space-x-2 ${theme === "light" ? "text-gray-700" : "text-gray-300"} hover:text-blue-500 transition-colors`}
          >
            <FaArrowLeft className="text-lg" />
            <span className="hidden sm:inline">Volver</span>
          </button>

          {/* Título de la sección "Mi Perfil" */}
          <h1 className="text-2xl font-bold text-center">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Mi Perfil
            </span>
          </h1>

          {/* Botones de acción: cambiar tema y cerrar sesión */}
          <div className="flex items-center space-x-4">
            {/* Botón para alternar el tema (claro/oscuro) */}
            <button
              onClick={() => {
                toggleTheme(); // Esto ahora actualizará automáticamente la base de datos
              }}
              className={`p-2 rounded-full ${theme === "light" ? "bg-gray-200 hover:bg-gray-300" : "bg-gray-700 hover:bg-gray-600"} transition-colors`}
              aria-label="Cambiar tema"
            >
              {theme === "light" ? <FiMoon size={18} /> : <FiSun size={18} />}
            </button>
            {/* Botón para cerrar sesión */}
            <button
              onClick={() => {
                sessionStorage.removeItem("token"); // Elimina el token de sesión
                logout(); // Llama a la función de logout del contexto de autenticación
                navigate("/login"); // Redirige a la página de login
                
                // Fuerza una recarga completa de la página para que el ThemeProvider
                // se reinicie y aplique el tema por defecto al no encontrar el token.
                window.location.reload();
              }}
              className={`p-2 rounded-full ${theme === "light" ? "bg-gray-200 hover:bg-gray-300" : "bg-gray-700 hover:bg-gray-600"} transition-colors`}
              aria-label="Cerrar sesión"
            >
              <FiLogOut size={18} />
            </button>
          </div>
        </header>

        {/* Tarjeta principal del perfil */}
        <div className={`rounded-xl shadow-lg overflow-hidden ${theme === "light" ? "bg-white" : "bg-gray-800"} transition-colors duration-300 mb-6`}>
          {/* Sección de imagen de perfil con opciones de edición */}
          <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-600">
            <div className="absolute -bottom-16 left-6">
              <div className="relative group">
                {/* Muestra la vista previa de la imagen o la imagen de perfil actual del usuario, o un ícono por defecto */}
                {imagePreview || user.imageUrl ? (
                  <img
                    src={imagePreview || user.imageUrl}
                    alt="Perfil"
                    className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-md"
                  />
                ) : (
                  <FaUserCircle className="w-32 h-32 text-gray-300 rounded-full border-4 border-white bg-white" />
                )}
                {/* Botón para subir nueva imagen de perfil */}
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
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    const previewUrl = URL.createObjectURL(file);
                    setImagePreview(previewUrl); // Actualiza la vista previa

                    const formData = new FormData();
                    formData.append("file", file); // Añade el archivo a un FormData

                    try {
                      // Petición a la API para subir la imagen de perfil
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
                      setUser((prev) => ({ ...prev, imageUrl: updatedUser.imageUrl })); // Actualiza la URL de la imagen en el estado del usuario
                    } catch (err) {
                      console.error("Error:", err);
                      alert(`Error al subir la imagen: ${err.message || err}`);
                    }
                  }}
                  className="hidden" // Oculta el input de archivo
                />
                {/* Botón para eliminar la imagen de perfil (solo si hay una imagen) */}
                {(imagePreview || user.imageUrl) && (
                  <button
                    onClick={async () => {
                      try {
                        // Petición a la API para eliminar la imagen de perfil
                        const response = await fetch(
                          `http://localhost:8080/api/users/${currentUserId}/profile-picture`,
                          {
                            method: "DELETE",
                            headers: {
                              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                            },
                          }
                        );

                        if (!response.ok) throw new Error("Error al eliminar la imagen");

                        setUser((prev) => ({ ...prev, imageUrl: null })); // Elimina la URL de la imagen del estado del usuario
                        setImagePreview(null); // Borra la vista previa
                      } catch (err) {
                        console.error("Error al eliminar la imagen:", err);
                        alert("Error al eliminar la imagen");
                      }
                    }}
                    className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <FaTrash size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Información del usuario (nombre de usuario y fecha de membresía) */}
          <div className="pt-20 px-6 pb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold dark:text-gray-100">
                  {user.username}
                </h2>
                <p className={`text-sm ${theme === "light" ? "text-gray-500" : "text-gray-300"}`}>
                  Miembro desde {user?.createdAtFormatted || "Fecha no disponible"}
                </p>
              </div>
            </div>

            {/* Sección de descripción editable del usuario */}
            <div className="mb-6">
              {isEditingDescription ? (
                // Modo de edición de la descripción
                <div className="space-y-3">
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className={`w-full p-3 rounded-lg border ${theme === "light" ? "border-gray-300" : "border-gray-600 bg-gray-700"} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Cuéntanos algo sobre ti..."
                    rows="3"
                  />
                  <div className="flex space-x-3">
                    {/* Botón para guardar la descripción */}
                    <button
                      onClick={async () => {
                        try {
                          // Petición a la API para actualizar la descripción del usuario
                          const response = await fetch(
                            `http://localhost:8080/api/users/${currentUserId}`,
                            {
                              method: "PUT",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                              },
                              body: JSON.stringify({ description: newDescription }),
                            }
                          );

                          if (!response.ok) throw new Error("Error al actualizar la descripción");

                          setUser((prev) => ({ ...prev, description: newDescription })); // Actualiza la descripción en el estado local
                          setIsEditingDescription(false); // Sale del modo de edición
                        } catch (err) {
                          console.error("Error al actualizar la descripción", err);
                          alert(`Error al actualizar la descripción: ${err.message}`);
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Guardar
                    </button>
                    {/* Botón para cancelar la edición */}
                    <button
                      onClick={() => {
                        setIsEditingDescription(false); // Sale del modo de edición
                        setNewDescription(user.description || ""); // Restaura la descripción original
                      }}
                      className={`px-4 py-2 rounded-lg ${theme === "light" ? "bg-gray-200 hover:bg-gray-300" : "bg-gray-700 hover:bg-gray-600"} transition-colors`}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                // Modo de visualización de la descripción
                <div>
                  <p className={`mb-2 ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>
                    {user.description || ""}
                  </p>
                  <button
                    onClick={() => setIsEditingDescription(true)} // Entra en modo de edición
                    className={`text-sm ${theme === "light" ? "text-blue-600 hover:text-blue-800" : "text-blue-400 hover:text-blue-300"} transition-colors`}
                  >
                    Editar descripción
                  </button>
                </div>
              )}
            </div>

            {/* Estadísticas del perfil (seguidores, seguidos, libros) */}
            <div className="grid grid-cols-3 gap-4 mb-6 text-center">
              {/* Contadores de Seguidores */}
              <div
                onClick={() => showFollowList("followers")} // Muestra el modal de seguidores al hacer clic
                className={`p-3 rounded-lg cursor-pointer ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-gray-700"} transition-colors`}
              >
                <p className="text-2xl font-bold dark:text-white">
                  {followersCount}
                </p>
                <p className={`text-sm ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
                  Seguidores
                </p>
              </div>
              {/* Contadores de Seguidos */}
              <div
                onClick={() => showFollowList("following")} // Muestra el modal de seguidos al hacer clic
                className={`p-3 rounded-lg cursor-pointer ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-gray-700"} transition-colors`}
              >
                <p className="text-2xl font-bold dark:text-white">
                  {followingCount}
                </p>
                <p className={`text-sm ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
                  Siguiendo
                </p>
              </div>
              {/* Total de libros (favoritos + leídos) */}
              <div
                className={`p-3 rounded-lg ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-gray-700"} transition-colors`}
              >
                <p className="text-2xl font-bold dark:text-white">
                  {favoriteBooks.length + readBooks.length}
                </p>
                <p className={`text-sm ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
                  Libros
                </p>
              </div>
            </div>

            {/* Pestañas de contenido (Mensajes, Libros Favoritos, Libros Leídos) */}
            <div className="mb-6">
              <div className="flex border-b border-gray-200 dark:border-gray-600">
                {["favoritos", "leidos"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab); // Cambia la pestaña activa
                      setCurrentBookPage(1); // Reinicia la paginación de libros al cambiar de pestaña
                      setBookSearchTerm(""); // Borra el término de búsqueda al cambiar de pestaña
                    }}
                    className={`px-4 py-2 font-medium text-sm ${
                      activeTab === tab
                        ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                        : theme === "light"
                        ? "text-gray-500 hover:text-gray-700"
                        : "text-gray-400 hover:text-gray-300"
                    } transition-colors`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)} {/* Capitaliza la primera letra del nombre de la pestaña */}
                  </button>
                ))}
              </div>

              {/* Contenido de las pestañas */}
              <div className="mt-4 min-h-[200px]">

                {/* Contenido de las pestañas "Favoritos" o "Leídos" */}
                {(activeTab === "favoritos" || activeTab === "leidos") && (
                  <div>
                    {/* Barra de búsqueda para libros */}
                    <div className={`relative flex items-center mb-4 ${theme === "light" ? "bg-white" : "bg-gray-600"} rounded-lg px-3 py-2 shadow-sm`}>
                      <FaSearch className={`mr-2 ${theme === "light" ? "text-gray-400" : "text-gray-300"}`} />
                      <input
                        type="text"
                        placeholder={`Buscar ${activeTab === "favoritos" ? "favoritos" : "leídos"}...`}
                        value={bookSearchTerm}
                        onChange={(e) => {
                          setBookSearchTerm(e.target.value); // Actualiza el término de búsqueda
                          setCurrentBookPage(1); // Reinicia la paginación al buscar
                        }}
                        className={`bg-transparent outline-none flex-1 ${theme === "light" ? "placeholder-gray-400" : "placeholder-gray-300"}`}
                      />
                    </div>

                    {/* Lista de libros (favoritos o leídos) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto p-1" style={{ scrollbarWidth: "thin" }}>
                      {(activeTab === "favoritos" ? paginatedFavorites : paginatedRead).map((book) => (
                        <div
                          key={book.olid}
                          className={`relative flex items-start p-3 rounded-lg ${theme === "light" ? "bg-white hover:bg-gray-50 border border-gray-200" : "bg-gray-700 hover:bg-gray-600 border border-gray-600"} transition-colors shadow-sm`}
                        >
                          {/* Botón para eliminar un libro de la lista */}
                          <button
                            onClick={async () => {
                              try {
                                const token = sessionStorage.getItem("token");
                                if (!token) {
                                  navigate("/login");
                                  return;
                                }

                                // Determina el endpoint correcto para eliminar el libro (favorito o leído)
                                const endpoint = activeTab === "favoritos"
                                  ? `http://localhost:8080/api/books/fav/${currentUserId}/${book.olid}`
                                  : `http://localhost:8080/api/books/read/${currentUserId}/${book.olid}`;

                                const method = "DELETE"; // Método HTTP para eliminar

                                const response = await fetch(endpoint, {
                                  method: method,
                                  headers: {
                                    'Authorization': `Bearer ${token}`,
                                  },
                                });

                                if (!response.ok) {
                                  throw new Error(`Error al eliminar el libro de ${activeTab}`);
                                }

                                // Actualiza el estado local para eliminar el libro de la lista correspondiente
                                if (activeTab === "favoritos") {
                                  setFavoriteBooks(prev => prev.filter(b => b.olid !== book.olid));
                                } else {
                                  setReadBooks(prev => prev.filter(b => b.olid !== book.olid));
                                }

                                alert("Libro eliminado correctamente.");

                              } catch (error) {
                                console.error("Error al eliminar libro:", error);
                                alert(`Error al eliminar el libro: ${error.message}`);
                              }
                            }}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-75 hover:opacity-100 transition-opacity"
                            title="Eliminar libro"
                          >
                            <FaTrash size={12} />
                          </button>
                          {/* Imagen de la portada del libro */}
                          <img
                            src={book.coverUrl || `https://via.placeholder.com/60x90?text=No+Cover`}
                            alt={book.title}
                            className="w-16 h-24 object-cover rounded-sm mr-3 shadow-sm"
                          />
                          {/* Información del libro (título, autor, año de publicación) */}
                          <div className="flex-1">
                            <h4 className={`font-semibold ${theme === "light" ? "text-gray-900" : "text-gray-100"}`}>{book.title}</h4>
                            <p className={`text-sm ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
                              {book.authors?.join(", ") || "Autor desconocido"}
                            </p>
                            <p className={`text-xs ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
                              Publicado en: {book.firstPublishYear || "N/A"}
                            </p>
                          </div>
                        </div>
                      ))}
                      {/* Mensaje si no hay libros en la lista o en la búsqueda */}
                      {(activeTab === "favoritos" ? paginatedFavorites : paginatedRead).length === 0 && (
                        <div className="text-center py-10 col-span-full">
                          <p className="text-gray-500">
                            {bookSearchTerm
                              ? "No se encontraron libros con esa búsqueda."
                              : activeTab === "favoritos"
                              ? "No tienes libros favoritos."
                              : "No tienes libros leídos."}
                          </p>
                        </div>
                      )}
                    </div>
                    {/* Paginación de libros */}
                    {((activeTab === "favoritos" ? totalFavPages : totalReadPages) > 1) && (
                      <div className="flex justify-center mt-4 space-x-2">
                        {Array.from({ length: activeTab === "favoritos" ? totalFavPages : totalReadPages }, (_, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentBookPage(i + 1)} // Cambia la página actual
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              currentBookPage === i + 1
                                ? "bg-blue-600 text-white"
                                : theme === "light"
                                ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                            } transition-colors`}
                          >
                            {i + 1}
                          </button>
                        ))}
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