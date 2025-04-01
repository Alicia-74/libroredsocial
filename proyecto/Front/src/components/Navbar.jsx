import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Importamos useNavigate
import { AuthContext } from "../context/AuthContext"; // Importamos el contexto de autenticación
import { ThemeContext } from "../context/ThemeContext"; // Importamos el contexto de tema
import { FaBars, FaTimes } from "react-icons/fa"; // Iconos de hamburguesa y cruz

const Navbar = () => {
  const { isLoggedIn, logout } = useContext(AuthContext); // Consumimos el contexto de autenticación
  const { theme, toggleTheme } = useContext(ThemeContext); // Consumimos el contexto de tema
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate(); // Inicializamos el hook useNavigate

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = () => {
    logout(); // Llamamos a logout para limpiar el estado de autenticación
    navigate("/"); // Redirigimos al inicio después de hacer logout
  };

  return (
    <nav className={`p-4 ${theme === "light" ? "bg-white" : "bg-gray-800"} text-gray-700 dark:text-white`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <h1 className="text-2xl font-semibold flex items-center space-x-2 text-blue-600">
          <span role="img" aria-label="book">📚</span>
          <span>LibroRedSocial</span>
        </h1>

        {/* Menú hamburguesa para pantallas pequeñas */}
        <div className="md:hidden">
          <button onClick={toggleMenu}>
            {menuOpen ? (
              <FaTimes className={theme === "light" ? "text-gray-600" : "text-gray-300"} />
            ) : (
              <FaBars className={theme === "light" ? "text-gray-600" : "text-gray-300"} />
            )}
          </button>
        </div>

        {/* Menú de navegación para pantallas grandes */}
        <div className="hidden md:flex space-x-6">
          <Link to="/" className="text-lg font-medium hover:text-blue-600 transition-all duration-300">
            Inicio
          </Link>

          {isLoggedIn && (
            <Link to="/profile" className="text-lg font-medium hover:text-blue-600 transition-all duration-300">
              Perfil
            </Link>
          )}

          {!isLoggedIn ? (
            <>
              <Link to="/login" className="text-lg font-medium hover:text-blue-600 transition-all duration-300">
                Iniciar sesión
              </Link>
              <Link to="/register" className="text-lg font-medium hover:text-blue-600 transition-all duration-300">
                Registro
              </Link>
            </>
          ) : (
            <button
              onClick={handleLogout} // Usamos handleLogout para gestionar el logout y redirigir
              className="text-lg font-medium hover:text-blue-600 transition-all duration-300"
            >
              Cerrar sesión
            </button>
          )}
        </div>
      </div>

      {/* Menú desplegable para pantallas pequeñas */}
      {menuOpen && (
        <div className={`md:hidden ${theme === "light" ? "bg-gray-800" : "bg-gray-900"} text-white p-4 space-y-4`}>
          <Link to="/" className="block text-lg font-medium">Inicio</Link>
          {isLoggedIn && <Link to="/profile" className="block text-lg font-medium">Perfil</Link>}
          {!isLoggedIn ? (
            <>
              <Link to="/login" className="block text-lg font-medium">Iniciar sesión</Link>
              <Link to="/register" className="block text-lg font-medium">Registro</Link>
            </>
          ) : (
            <button onClick={handleLogout} className="block text-lg font-medium">Cerrar sesión</button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
