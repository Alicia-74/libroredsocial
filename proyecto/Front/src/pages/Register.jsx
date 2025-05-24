import React, { useState } from "react";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    if (!username || !email || !password) {
      setError("Por favor, complete todos los campos.");
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    if (!emailRegex.test(email)) {
      setError("Por favor, ingrese un correo electrónico válido.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/v1/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      if (response.ok) {
        setSuccessMessage("Registro exitoso. Redirigiendo...");
        setUsername("");
        setEmail("");
        setPassword("");
        
        setTimeout(() => {
          navigate("/login");
        }, 800);
      } else {
        const errorData = await response.json();
        setError(errorData.message.includes("correo") 
          ? "El correo electrónico ya está registrado" 
          : errorData.message || "Error al registrar usuario");
      }
    } catch (err) {
      setError(err.message || "Error de conexión con el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 90px)" }}>
      <div className="flex-grow flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-12 pb-20">
        <div className="w-full max-w-md md:max-w-lg bg-white rounded-xl shadow-lg overflow-hidden" style={{ minHeight: "200px" }}>
          {/* Header con gradiente */}
          {/* Header con gradiente más compacto */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 text-center">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-1.5 rounded-full ml-14 mr-7 md:p-2 md:ml-[90px] md:mr-7 lg:p-2">
                <FaUser className="text-white text-lg lg:text-xl" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Crear Cuenta</h2>
                <p className="text-blue-100 text-xs">Completa tus datos para registrarte</p>
              </div>
            </div>
          </div>
          

          {/* Contenido ajustado */}
          <div className="p-3 space-y-4">
            {error && (
              <div className="p-2 bg-red-50 border-l-4 border-red-500 text-red-700 rounded text-xs">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="p-2 bg-green-50 border-l-4 border-green-500 text-green-700 rounded text-xs">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-xs font-medium text-gray-700 mb-1">
                  Nombre de Usuario
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="text"
                    id="username"
                    placeholder="Tu nombre de usuario"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                    onChange={(e) => setUsername(e.target.value)}
                    value={username}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="email"
                    id="email"
                    placeholder="ejemplo@correo.com"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="••••••••"
                    className="w-full pl-9 pr-8 py-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="text-gray-400 text-sm" />
                    ) : (
                      <FaEye className="text-gray-400 text-sm" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-2 px-4 text-xs rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors ${
                  isLoading ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando...
                  </span>
                ) : (
                  "Registrarse"
                )}
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-2 bg-white text-xs text-gray-500">
                  ¿Ya tienes una cuenta?
                </span>
              </div>
            </div>

            <a
              href="/login"
              className="block w-full py-2 px-4 text-xs text-center border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
            >
              Iniciar Sesión
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;