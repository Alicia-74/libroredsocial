import React, { useState, useEffect } from 'react';
import { FaSearch, FaArrowLeft } from 'react-icons/fa';
import { FaUserCircle } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Importamos useNavigate para la navegación programática

const UserFollowList = ({
  type, // 'followers' o 'following'
  userId, // ID del usuario cuyos seguidores/seguidos queremos ver
  title,
  currentUserId, // ID del usuario actualmente logueado
  onClose, // Función para cerrar la lista de usuarios
  theme, // Tema actual ('light' o 'dark')
  onFollowToggle, // Función para manejar el seguimiento/dejado de seguir
  initialSearchTerm = '', // Término de búsqueda inicial
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm); // Estado para el término de búsqueda
  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual de paginación
  const [users, setUsers] = useState([]); // Estado para la lista de usuarios
  const [loading, setLoading] = useState(true); // Estado para el estado de carga
  const [error, setError] = useState(null); // Estado para errores
  const itemsPerPage = 10; // Número de usuarios por página

  const API_URL = process.env.REACT_APP_API_URL;
  
  useEffect(() => {
    // Función para obtener los usuarios (seguidores o seguidos)
    const fetchUsers = async () => {
      try {
        setLoading(true); // Iniciamos el estado de carga
        const response = await axios.get(`${API_URL}/api/follow/${userId}/${type}`);
        setUsers(response.data); // Guardamos los usuarios en el estado
        setError(null); // Limpiamos cualquier error previo
      } catch (err) {
        setError('Error al cargar los usuarios'); // Establecemos el mensaje de error
        console.error(err);
      } finally {
        setLoading(false); // Finalizamos el estado de carga
      }
    };

    fetchUsers(); // Llamamos a la función al montar el componente o cuando cambian userId o type
  }, [userId, type]);

  // Filtrar usuarios
  const filteredUsers = users.filter(user =>
    user.id !== currentUserId && // Excluimos al usuario actual de la lista
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) // Filtramos por nombre de usuario
  );

  // Paginación
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage); // Calculamos el total de páginas
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  ); // Obtenemos los usuarios para la página actual

  // Mostrar indicador de carga
  if (loading) {
    return (
      <div className={`fixed inset-0 z-50 ${theme === 'light' ? 'bg-white' : 'bg-gray-900'} p-4 overflow-y-auto flex items-center justify-center`}>
        <p>Cargando...</p>
      </div>
    );
  }

  // Mostrar mensaje de error
  if (error) {
    return (
      <div className={`fixed inset-0 z-50 ${theme === 'light' ? 'bg-white' : 'bg-gray-900'} p-4 overflow-y-auto flex items-center justify-center`}>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-50 ${theme === 'light' ? 'bg-white' : 'bg-gray-900'} p-4 overflow-y-auto`}>
      {/* Encabezado */}
      <div className="sticky top-0 bg-inherit py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <button onClick={onClose} className="text-blue-500">
            <FaArrowLeft size={20} />
          </button>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          <div className="w-6"></div>
        </div>
      </div>

      {/* Barra de Búsqueda */}
      <div className={`my-4 flex items-center rounded-full px-4 py-2 ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-800'}`}>
        <FaSearch className="text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Buscar..."
          className="bg-transparent w-full outline-none dark:text-gray-100"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Volvemos a la primera página al cambiar el término de búsqueda
          }}
        />
      </div>

      {/* Lista de Usuarios */}
      <div className="space-y-4">
        {paginatedUsers.map((user) => (
          <UserListItem
            key={user.id}
            user={user} // Pasamos el objeto de usuario completo
            currentUserId={currentUserId}
            theme={theme}
            onFollowToggle={onFollowToggle}
            onClose={onClose} // Pasamos la función para cerrar la lista
          />
        ))}

        {paginatedUsers.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500">
              {searchTerm
                ? 'No se encontraron resultados'
                : 'No hay usuarios para mostrar'}
            </p>
          </div>
        )}
      </div>

      {/* Controles de Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`mx-1 px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-blue-500 text-white' : theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Componente `UserListItem` (Elemento de Usuario en la Lista)

// Componente auxiliar para los elementos de usuario en la lista
const UserListItem = React.memo(({ user, currentUserId, theme, onFollowToggle, onClose }) => {
  // `user.id` es el ID del usuario que se está mostrando en esta fila de la lista.
  // `currentUserId` es el ID del usuario que está actualmente logueado.

  const navigate = useNavigate(); // Hook para la navegación programática

  // Función para manejar el clic en un usuario
  const handleUserClick = () => {
    onClose(); // Primero, cerramos la lista de seguidores/seguidos
    navigate(`/perfilUsuario/${user.id}`); // Navegamos a la página de perfil del usuario clicado
  };

  return (
    <div
      className="flex items-center justify-between cursor-pointer" // Añadimos cursor-pointer para indicar que es clickeable
      onClick={handleUserClick} // Manejador de clic para navegar al perfil
    >
      <div className="flex items-center space-x-3 flex-1">
        <div className="relative">
          {user.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={user.username}
              className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-600"
            />
          ) : (
            <FaUserCircle className="w-12 h-12 text-gray-400" />
          )}
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-gray-100">{user.username}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            @{user.username.toLowerCase().replace(/\s+/g, '')}
          </p>
        </div>
      </div>
    </div>
  );
});

export default UserFollowList;