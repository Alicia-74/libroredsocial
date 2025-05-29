import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FaHome, FaComment, FaUser, FaQrcode } from "react-icons/fa";
import { FiLogIn, FiUserPlus } from "react-icons/fi";

/**
 * Componente Navbar - Barra de navegación superior e inferior
 * @param {boolean} hideOnChat - Indica si el navbar debe estar oculto (cuando se está en el chat en móvil)
 */
const Navbar = ({ hideOnChat = false }) => {
  const { isLoggedIn, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Función para manejar el logout
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      {/* --------------------------------------------
          BARRA SUPERIOR (SOLO MÓVIL) 
          Se oculta cuando hideOnChat es true
      -------------------------------------------- */}
      <nav 
        className={`sticky top-0 z-50 bg-white shadow-sm dark:bg-gray-800 transition-all duration-300
                   ${hideOnChat ? "transform -translate-y-full" : "translate-y-0"} 
                   md:hidden`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-16">
            <Link 
              to="/" 
              className="flex items-center space-x-2 hover:opacity-90 transition-opacity"
            >
              <span role="img" aria-label="book" className="text-2xl">📚</span>
              <span className="text-2xl font-semibold text-blue-600">LibroRedSocial</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* --------------------------------------------
          BARRA SUPERIOR (DESKTOP) 
          Siempre visible en desktop
      -------------------------------------------- */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm dark:bg-gray-800 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link 
                to="/" 
                className="flex items-center space-x-2 hover:opacity-90 transition-opacity"
              >
                <span role="img" aria-label="book" className="text-2xl">📚</span>
                <span className="text-2xl font-semibold text-blue-600">LibroRedSocial</span>
              </Link>
            </div>

            {/* Menú de navegación */}
            <div className="flex items-center space-x-1">
              {/* Botón Inicio */}
              <Link
                to="/"
                className="flex items-center px-4 py-2 rounded-lg text-sm font-medium group transition-all duration-200"
              >
                <span className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full mr-2 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors">
                  <FaHome className="text-blue-600 dark:text-blue-400 text-sm" />
                </span>
                <span className="text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  Inicio
                </span>
              </Link>

              {/* Botón Mensajes (solo cuando está logueado) */}
              {isLoggedIn && (
                <Link
                  to="/messages"
                  className="flex items-center px-4 py-2 rounded-lg text-sm font-medium group transition-all duration-200"
                >
                  <span className="flex items-center justify-center w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full mr-2 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/50 transition-colors">
                    <FaComment className="text-purple-600 dark:text-purple-400 text-sm" />
                  </span>
                  <span className="text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                    Mensajes
                  </span>
                </Link>
              )}

              {/* Botón QR */}
              <Link
                to="/qr"
                className="flex items-center px-4 py-2 rounded-lg text-sm font-medium group transition-all duration-200"
              >
                <span className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full mr-2 group-hover:bg-green-200 dark:group-hover:bg-green-800/50 transition-colors">
                  <FaQrcode className="text-green-600 dark:text-green-400 text-sm" />
                </span>
                <span className="text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400">
                  QR
                </span>
              </Link>

              {/* Botón Perfil (solo cuando está logueado) */}
              {isLoggedIn && (
                <Link
                  to="/profile"
                  className="flex items-center px-4 py-2 rounded-lg text-sm font-medium group transition-all duration-200"
                >
                  <span className="flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full mr-2 group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors">
                    <FaUser className="text-gray-600 dark:text-gray-300 text-sm" />
                  </span>
                  <span className="text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    Perfil
                  </span>
                </Link>
              )}

              {/* Botones Login/Registro o Logout */}
              {!isLoggedIn ? (
                <>
                  <Link
                    to="/login"
                    className="ml-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 flex items-center shadow-sm hover:shadow-md"
                  >
                    <FiLogIn className="mr-2" /> Iniciar sesión
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-lg text-sm font-medium border border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors duration-200 flex items-center ml-2 shadow-sm hover:shadow-md"
                  >
                    <FiUserPlus className="mr-2" /> Registro
                  </Link>
                </>
              ) : (
                <button
                  onClick={handleLogout}
                  className="ml-2 px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center"
                >
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* --------------------------------------------
          BARRA INFERIOR (SOLO MÓVIL) 
          Estilo similar a Instagram
      -------------------------------------------- */}
      <div 
        className={`fixed bottom-0 w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-2 md:hidden z-50
                   transition-all duration-300
                   ${hideOnChat ? "transform translate-y-full" : "translate-y-0"}`}
      >
        <div className="flex justify-around items-center">
          {/* Ícono Inicio */}
          <Link
            to="/"
            className="flex flex-col items-center justify-center p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <FaHome className="text-xl" />
            <span className="text-xs mt-1">Inicio</span>
          </Link>

          {/* Ícono Mensajes (solo logueado) */}
          {isLoggedIn && (
            <Link
              to="/messages"
              className="flex flex-col items-center justify-center p-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
            >
              <FaComment className="text-xl" />
              <span className="text-xs mt-1">Mensajes</span>
            </Link>
          )}

          {/* Ícono QR */}
          <Link
            to="/qr"
            className="flex flex-col items-center justify-center p-2 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400"
          >
            <FaQrcode className="text-xl" />
            <span className="text-xs mt-1">QR</span>
          </Link>

          {/* Ícono Perfil o Login */}
          {isLoggedIn ? (
            <Link
              to="/profile"
              className="flex flex-col items-center justify-center p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <FaUser className="text-xl" />
              <span className="text-xs mt-1">Perfil</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="flex flex-col items-center justify-center p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <FiLogIn className="text-xl" />
              <span className="text-xs mt-1">Entrar</span>
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;