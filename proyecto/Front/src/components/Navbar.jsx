import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FaHome, FaComment, FaUser, FaQrcode } from "react-icons/fa";
import { FiLogIn, FiUserPlus, FiLogOut } from "react-icons/fi";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

const Navbar = ({ hideOnChat = false }) => {
  const { isLoggedIn, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      {/* MOBILE TOP BAR */}
      <nav
        className={`sticky top-0 z-50 bg-white dark:bg-gray-900 transition-all duration-300 md:hidden shadow ${
          hideOnChat ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <Card className="flex items-center justify-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl">📚</span>
            <span className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
              LibroRedSocial
            </span>
          </Link>
        </Card>
      </nav>

      {/* DESKTOP TOP BAR */}
      <nav className="hidden md:block sticky top-0 z-50 bg-white dark:bg-gray-900 shadow">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl">📚</span>
              <span className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
                LibroRedSocial
              </span>
            </Link>

            {/* Navigation */}
            <div className="flex items-center space-x-3">
              {/* Inicio */}
              <Link to="/" className="group flex items-center space-x-2 px-3 py-2 rounded-lg transition">
                <span className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/60 transition">
                  <FaHome className="text-blue-600 dark:text-blue-400 text-sm" />
                </span>
                <span className="text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 text-sm">
                  Inicio
                </span>
              </Link>

              {/* Mensajes */}
              {isLoggedIn && (
                <Link to="/messages" className="group flex items-center space-x-2 px-3 py-2 rounded-lg transition">
                  <span className="w-8 h-8 flex items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/40 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/60 transition">
                    <FaComment className="text-purple-600 dark:text-purple-400 text-sm" />
                  </span>
                  <span className="text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 text-sm">
                    Mensajes
                  </span>
                </Link>
              )}

              {/* QR */}
              <Link to="/qr" className="group flex items-center space-x-2 px-3 py-2 rounded-lg transition">
                <span className="w-8 h-8 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40 group-hover:bg-green-200 dark:group-hover:bg-green-800/60 transition">
                  <FaQrcode className="text-green-600 dark:text-green-400 text-sm" />
                </span>
                <span className="text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400 text-sm">
                  QR
                </span>
              </Link>

              {/* Perfil */}
              {isLoggedIn && (
                <Link to="/profile" className="group flex items-center space-x-2 px-3 py-2 rounded-lg transition">
                  <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 group-hover:bg-gray-300 dark:group-hover:bg-gray-600 transition">
                    <FaUser className="text-gray-600 dark:text-gray-300 text-sm" />
                  </span>
                  <span className="text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 text-sm">
                    Perfil
                  </span>
                </Link>
              )}

              {/* Login / Registro / Logout */}
              {!isLoggedIn && (
                <>
                  <Button asChild  className="flex items-center  bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md">
                    <Link to="/login">
                      <FiLogIn className="mr-2 text-sm" /> Iniciar sesión
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/register" className="flex items-center border border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 shadow-sm hover:shadow-md">
                      <FiUserPlus className="mr-2 text-sm" /> Registro
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* MOBILE BOTTOM NAV */}
      <div
        className={`fixed bottom-0 w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-2 md:hidden z-50 transition-all duration-300 ${
          hideOnChat ? "translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="flex justify-around items-center">
          {/* Inicio */}
          <Link
            to="/"
            className="flex flex-col items-center justify-center p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-1">
              <FaHome className="text-blue-600 dark:text-blue-400 text-lg" />
            </div>
            <span className="text-xs">Inicio</span>
          </Link>

          {/* Mensajes */}
          {isLoggedIn && (
            <Link
              to="/messages"
              className="flex flex-col items-center justify-center p-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
            >
              <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-1">
                <FaComment className="text-purple-600 dark:text-purple-400 text-lg" />
              </div>
              <span className="text-xs">Mensajes</span>
            </Link>
          )}

          {/* QR */}
          <Link
            to="/qr"
            className="flex flex-col items-center justify-center p-2 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400"
          >
            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-1">
              <FaQrcode className="text-green-600 dark:text-green-400 text-lg" />
            </div>
            <span className="text-xs">QR</span>
          </Link>

          {/* Perfil / Login */}
          {isLoggedIn ? (
            <Link
              to="/profile"
              className="flex flex-col items-center justify-center p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-1">
                <FaUser className="text-gray-600 dark:text-gray-300 text-lg" />
              </div>
              <span className="text-xs">Perfil</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="flex flex-col items-center justify-center p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-1">
                <FiLogIn className="text-blue-600 dark:text-blue-400 text-lg" />
              </div>
              <span className="text-xs">Entrar</span>
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
