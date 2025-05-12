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
      const response = await fetch(`http://localhost:8080/api/users/${currentUserId}/upload-profile-image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: formData,
      });

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
        "Authorization": `Bearer ${sessionStorage.getItem("token")}`,
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

  if (!user) return <div>Cargando...</div>;

  const followersCount = Array.isArray(user.followers) ? user.followers.length : 0;
  const followingCount = Array.isArray(user.following) ? user.following.length : 0;

  return (
    <div className={`min-h-screen ${theme === "light" ? "bg-gray-100" : "bg-gray-900"} text-gray-900 dark:text-white`}>
      <div className="max-w-xl mx-auto p-4">

        {/* Encabezado con título, tema y logout */}
        <div className="relative border-b pb-2 flex items-center justify-center">
          <button onClick={handleBack} className="absolute left-0 text-gray-500 dark:text-white hover:text-blue-600" title="Página Principal">
            <FaArrowLeft />
          </button>
          <h1 className="text-xl font-bold">{user.username}</h1>
          <div className="absolute right-0 flex items-center space-x-8">
            <button onClick={toggleTheme} title="Cambiar tema">
              {theme === "light" ? <FiMoon size={20} /> : <FiSun size={20} />}
            </button>
            <button onClick={handleLogout} title="Cerrar sesión">
              <FiLogOut size={20} />
            </button>
          </div>
        </div>

        {/* Imagen de perfil y edición */}
        <div className="flex flex-col items-center mt-4">
          <div className="relative">
            {imagePreview || user.imageUrl ? (
              <img src={imagePreview || user.imageUrl} alt="Perfil" className="w-28 h-28 rounded-full object-cover" />
            ) : (
              <FaUserCircle className="w-28 h-28 text-gray-500" />
            )}
            <label htmlFor="file-upload" className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full cursor-pointer">
              <FaCamera />
            </label>
            <input type="file" id="file-upload" accept="image/*" onChange={handleFileChange} className="hidden" />
            <button onClick={handleDeleteProfilePicture} className="mt-2 text-red-600 hover:text-red-800">
              <FaTrash size={18} />
            </button>
          </div>

          {/* Descripción del perfil */}
          {isEditingDescription ? (
            <div className="w-full mt-2">
              <textarea value={newDescription} onChange={handleDescriptionChange} className="w-full p-2 border rounded" placeholder="Editar descripción" />
              <div className="flex gap-2 mt-2 justify-center">
                <button onClick={handleSaveDescription} className="bg-blue-600 text-white px-4 py-1 rounded">Guardar</button>
                <button onClick={() => { setIsEditingDescription(false); setNewDescription(user.description || ""); }} className="bg-gray-500 text-white px-4 py-1 rounded">Cancelar</button>
              </div>
            </div>
          ) : (
            <div className="text-center mt-2">
              <p>{user.description}</p>
              <button onClick={() => setIsEditingDescription(true)} className="text-blue-600">Editar descripción</button>
            </div>
          )}
        </div>

        {/* Estadísticas: Seguidores y Seguidos */}
        <div className="flex justify-around text-center mt-6">
          <div onClick={toggleFollowers} className="cursor-pointer">
            <p className="font-bold">{followersCount}</p>
            <p className="text-sm text-gray-500">Seguidores</p>
          </div>
          <div onClick={toggleFollowing} className="cursor-pointer">
            <p className="font-bold">{followingCount}</p>
            <p className="text-sm text-gray-500">Siguiendo</p>
          </div>
          <div>
            <p className="font-bold">•</p>
            <p className="text-sm text-gray-500">Mensajes</p>
          </div>
        </div>

        {/* Lista de Seguidores */}
        {showFollowers && (
          <div className="mt-4">
            <h2 className="text-lg font-bold mb-2">Seguidores</h2>
            {user.followers?.length > 0 ? (
              <ul className="space-y-2">
                {user.followers.map((follower) => (
                      <li key={follower.id} className="flex items-center gap-3 border p-2 rounded shadow-sm">
                      <img src={imagePreview || follower.imageUrl} alt={follower.username} className="w-10 h-10 rounded-full object-cover"/>
                      <span>{follower.username}</span>
                    </li>
                ))} 
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No tienes seguidores.</p>
            )}
          </div>
        )}

        {/* Lista de Seguidos */}
        {showFollowing && (
          <div className="mt-4">
            <h2 className="text-lg font-bold mb-2">Siguiendo</h2>
            {user.following?.map((following) => (
                <li key={following.id} className="flex items-center gap-3 border p-2 rounded shadow-sm">
                  <img src={imagePreview || following.imageUrl} alt={following.username} className="w-10 h-10 rounded-full object-cover"/>
                  <span>{following.username}</span>
                </li>
            ))} 
            : (
              <p className="text-sm text-gray-500">No estás siguiendo a nadie.</p>
            )
          </div>
        )}

        {/* Navegación por pestañas */}
        <div className="flex justify-around mt-6 border-b">
          {['mensajes', 'favoritos', 'leidos'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 ${activeTab === tab ? 'border-b-2 border-blue-500 font-medium' : ''}`}
            >
              {tab[0].toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Contenido de la pestaña activa */}
        <div className="mt-4 min-h-[200px]">
          {activeTab === "mensajes" && <p className="text-center text-gray-500">Aquí aparecerán tus mensajes.</p>}
          {activeTab === "favoritos" && (
            favoriteBooks.length > 0 ? (
              <ul className="space-y-4">
                {favoriteBooks.map(book => (
                  <li key={book.olid} className="flex items-center gap-4 border p-2 rounded shadow-sm">
                    <img src={`http://localhost:8080/api/books/external/book/${book.olid}-L.jpg`} alt={book.title} className="w-12 h-16 object-cover" />
                    <div>
                      <p className="font-bold">{book.title}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : <p className="text-center text-gray-500">No hay libros favoritos aún.</p>
          )}

          {activeTab === "leidos" && (
            readBooks.length > 0 ? (
              <ul className="space-y-4">
                {readBooks.map(book => (
                  <li key={book.olid} className="flex items-center gap-4 border p-2 rounded shadow-sm">
                    <img src={`http://localhost:8080/api/books/external/book/${book.olid}-L.jpg`} alt={book.title} className="w-12 h-16 object-cover" />
                    <div>
                      <p className="font-bold">{book.title}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : <p className="text-center text-gray-500">No hay libros leídos aún.</p>
          )}

        </div>

        {/* Botón de cierre de sesión final */}
        <div className="mt-6 flex justify-center">
          <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded">Cerrar sesión</button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
