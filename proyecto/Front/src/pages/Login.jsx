import React, { useState, useContext } from "react";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const API_URL = process.env.REACT_APP_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    if (!email || !password) {
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

    
  // const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
  // if (!passwordRegex.test(password)) {
  //     setError("Por favor, ingrese una contraseña válida.");
  //     setIsLoading(false);
  //     return;
  //   }



    try {
      const response = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.token;

        if (token && typeof token === "string") {
          sessionStorage.setItem("token", token);
          login(token);

          setSuccessMessage("Inicio de sesión exitoso. Redirigiendo...");
          
          setTimeout(() => {
            navigate("/profile");
          }, 800);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Credenciales incorrectas.");
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
    <div className="flex flex-col"  style={{ height: "calc(100vh - 64px)" }}>
      <div className="flex-grow flex  justify-center bg-gradient-to-br from-blue-50 to-indigo-100 pt-10 p-4 md:p-10">
        <div className="w-full max-w-xs sm:max-w-md bg-white rounded-xl shadow-lg overflow-hidden  h-[420px] md:h-[420px]">
          {/* Header con gradiente */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-3 md:p-5 text-center">
            <div className="flex justify-center mb-3">
              <div className="bg-white/20 p-2 rounded-full">
                <FaUser className="text-white text-xl" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-white">Iniciar Sesión</h2>
            <p className="text-blue-100 text-xs mt-1">Ingresa tus credenciales para continuar</p>
          </div>

          {/* Contenido ajustado */}
          <div className="p-5 space-y-4">
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
                  "Iniciar Sesión"
                )}
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-2 bg-white text-xs text-gray-500">
                  ¿No tienes una cuenta?
                </span>
              </div>
            </div>

            <a
              href="/register"
              className="block w-full py-2 px-4 text-xs text-center border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
            >
              Regístrate
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;