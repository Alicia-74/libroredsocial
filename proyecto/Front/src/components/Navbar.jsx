import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FaBars, FaTimes, FaUser, FaHome } from "react-icons/fa";
import { FiLogIn, FiLogOut, FiUserPlus } from "react-icons/fi";

const Navbar = () => {
  const { isLoggedIn, logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo y nombre - Mantenido exactamente como lo tenías */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center space-x-2 hover:opacity-90 transition-opacity">
              <span role="img" aria-label="book" className="text-2xl">📚</span>
              <span className="text-2xl font-semibold text-blue-600">LibroRedSocial</span>
            </Link>
          </div>

          {/* Menú desktop mejorado */}
          <div className="hidden md:flex items-center space-x-1">
            {/* Botón Inicio profesional con icono */}
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
                <FiLogOut className="mr-2" /> Cerrar sesión
              </button>
            )}
          </div>

          {/* Menú móvil hamburguesa */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-white transition-all duration-200"
            >
              {menuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil desplegable */}
      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 shadow-xl border-t border-gray-100 dark:border-gray-700">
          <div className="px-2 pt-2 pb-3 space-y-2">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="flex items-center px-4 py-3 rounded-lg text-base font-medium group transition-all duration-200"
            >
              <span className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full mr-3 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors">
                <FaHome className="text-blue-600 dark:text-blue-400 text-sm" />
              </span>
              <span className="text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                Inicio
              </span>
            </Link>

            {isLoggedIn && (
              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center px-4 py-3 rounded-lg text-base font-medium group transition-all duration-200"
              >
                <span className="flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full mr-3 group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors">
                  <FaUser className="text-gray-600 dark:text-gray-300 text-sm" />
                </span>
                <span className="text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  Perfil
                </span>
              </Link>
            )}

            {!isLoggedIn ? (
              <>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 rounded-lg text-base font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center shadow-sm"
                >
                  <FiLogIn className="mr-3" /> Iniciar sesión
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 rounded-lg text-base font-medium border border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors duration-200 flex items-center justify-center mt-2 shadow-sm"
                >
                  <FiUserPlus className="mr-3" /> Registro
                </Link>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition-colors duration-200"
              >
                <span className="flex items-center justify-center w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-full mr-3">
                  <FiLogOut className="text-red-600 dark:text-red-400 text-sm" />
                </span>
                Cerrar sesión
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;