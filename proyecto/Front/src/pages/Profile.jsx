import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle, FaArrowLeft, FaCamera } from "react-icons/fa";
import { FiSun, FiMoon, FiLogOut } from "react-icons/fi"; // Iconos de sol, luna y cerrar sesión
import { useParams } from "react-router-dom"; // Para obtener parámetros de la URL
import { FaTrash } from "react-icons/fa"; // Importar el ícono de la papelera
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { jwtDecode } from "jwt-decode";

const Profile = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  const [user, setUser] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [newDescription, setNewDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);  // Estado para la imagen seleccionada
  const [imagePreview, setImagePreview] = useState(null); // Estado para la vista previa de la imagen

  const [activeTab, setActiveTab] = useState("mensajes");

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
      setUser(data); // Aquí obtienes toda la información del usuario, incluida la imagen
      setNewDescription(data.description || "");
    })
    .catch((err) => {
      console.error("Error al obtener perfil", err);
      navigate("/login");
    });
}, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    logout();
    navigate("/login");
  };

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
      .then((res) => {
        return res.json();
      })
      .then(() => {
        setUser((prev) => ({ ...prev, description: newDescription }));
        setIsEditingDescription(false);
      })
      .catch((err) => console.error("Error al actualizar la descripción", err));
  };

  

  const handleFileChange = (event) => {
    const file = event.target.files[0];  // Obtén el archivo seleccionado
    if (file) {
      setImageFile(file);  // Guarda el archivo
      setImagePreview(URL.createObjectURL(file)); // Crea una URL temporal para previsualizar la imagen
  
      // Ahora vamos a enviar el archivo al servidor
      const formData = new FormData();
      formData.append("file", file);
  
      // Realiza una petición PUT (o POST) para enviar el archivo al backend
      fetch(`http://localhost:8080/api/users/${currentUserId}/profile-picture`, {
        method: "PUT", // Método PUT o POST, dependiendo de tu API
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`, // Autenticación, si es necesario
        },
        body: formData,  // Enviar el archivo como FormData
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Error al subir la imagen");
          }
          return res.json();  // Suponiendo que el backend devuelve la URL de la imagen guardada
        })
        .then((data) => {
          console.log("Imagen actualizada", data);
          // Actualiza el estado del usuario con la nueva imagen
          setUser((prevUser) => ({ ...prevUser, imageUrl: data.imageUrl }));
        })
        .catch((err) => {
          console.error("Error al subir la imagen", err);
        });
    }
  };


  const handleDeleteProfilePicture = () => {
    fetch(`http://localhost:8080/api/users/${currentUserId}/profile-picture/delete`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Error al eliminar la foto de perfil");
        }
        return res.json();
      })
      .then(() => {
        // Actualizamos el estado del usuario para que no tenga imagen
        setUser((prevUser) => ({ ...prevUser, profilePicture: null }));
      })
      .catch((err) => {
        console.error("Error al eliminar la foto de perfil", err);
      });
  };
  

  const handleBack = () => navigate("/");

  if (!user) return <div>Cargando...</div>;

  const followersCount = Array.isArray(user.followers) ? user.followers.length : 0;
  const followingCount = Array.isArray(user.following) ? user.following.length : 0;

  return (
    <div className={`min-h-screen ${theme === "light" ? "bg-gray-100" : "bg-gray-900"} text-gray-900 dark:text-white`}>
      <div className="max-w-xl mx-auto p-4">
        {/* Header */}
        <div className="relative border-b pb-2 flex items-center justify-center">
          <button
            onClick={handleBack}
            className="absolute left-0 text-gray-500 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
            title="Página Principal"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-xl font-bold text-center">{user.username}</h1>
          <div className="absolute right-0 flex items-center space-x-8">
            <button
              onClick={toggleTheme}
              className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition"
              title="Cambiar tema"
            >
              {theme === "light" ? <FiMoon size={20} /> : <FiSun size={20} />}
            </button>
            <button
              onClick={handleLogout}
              className="text-gray-600 dark:text-gray-300 hover:text-red-500 transition"
              title="Cerrar sesión"
            >
              <FiLogOut size={20} />
            </button>
          </div>
        </div>

        {/* Profile Image and Description */}
        <div className="flex flex-col items-center mt-4">
          <div className="relative">
            {imagePreview || user.profilePicture ? (
              <img
                src={imagePreview || user.profilePicture}
                alt="Perfil"
                className="w-28 h-28 rounded-full object-cover"
              />
            ) : (
              <FaUserCircle className="w-28 h-28 text-gray-500" />
            )}
            <label htmlFor="file-upload" className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full cursor-pointer">
              <FaCamera />
            </label>
            <input
              type="file"
              id="file-upload"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={handleDeleteProfilePicture}
              className="mt-2 text-red-600 hover:text-red-800 transition"
            >
              <FaTrash size={18} />
            </button>
          </div>

          {isEditingDescription ? (
            <div className="w-full mt-2">
              <textarea
                value={newDescription}
                onChange={handleDescriptionChange}
                className="w-full p-2 border rounded"
                placeholder="Editar descripción"
              />
              <div className="flex gap-2 mt-2 justify-center">
                <button onClick={handleSaveDescription} className="bg-blue-600 text-white px-4 py-1 rounded">Guardar</button>
                <button onClick={() => {
                  setIsEditingDescription(false);
                  setNewDescription(user.description || "");
                }} className="bg-gray-500 text-white px-4 py-1 rounded">Cancelar</button>
              </div>
            </div>
          ) : (
            <div className="text-center mt-2">
              <p>{user.description}</p>
              <button onClick={() => setIsEditingDescription(true)} className="text-blue-600">Editar descripción</button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex justify-around text-center mt-6">
          <div>
            <p className="font-bold">{followersCount}</p>
            <p className="text-sm text-gray-500">Seguidores</p>
          </div>
          <div>
            <p className="font-bold">{followingCount}</p>
            <p className="text-sm text-gray-500">Siguiendo</p>
          </div>
          <div>
            <p className="font-bold">•</p>
            <p className="text-sm text-gray-500">Mensajes</p>
          </div>
        </div>

        {/* Tabs */}
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

        {/* Tab Content Placeholder */}
        <div className="mt-4 min-h-[200px]">
          {activeTab === "mensajes" && <p className="text-center text-gray-500">Aquí aparecerán tus mensajes.</p>}
          {activeTab === "favoritos" && <p className="text-center text-gray-500">Aquí verás tus libros favoritos.</p>}
          {activeTab === "leidos" && <p className="text-center text-gray-500">Aquí se listarán los libros leídos.</p>}
        </div>

        {/* Logout */}
        <div className="mt-6 flex justify-center">
          <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded">Cerrar sesión</button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
