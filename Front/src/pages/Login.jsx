import React, { useState } from "react";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // Usamos el hook useNavigate para redirigir
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext"; // Importamos el contexto

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // Usamos la función de login del contexto

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación básica de los campos
    if (!email || !password) {
      setError("Por favor, complete todos los campos.");
      return;
    }

    // Simulación de login
    try {
      // Aquí puedes agregar tu lógica de login real
      // Realizamos la petición de login usando fetch
      const response = await fetch("http://localhost:8080/api/users/login", {
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
        setSuccessMessage("Inicio de sesión exitoso.");
        setError(""); // Limpiar cualquier mensaje de error anterior

        // Usamos el contexto para cambiar el estado de login
        login();

        setTimeout(() => {
          navigate("/"); // Redirige a la página de inicio
        }, 800);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Credenciales incorrectas.");
        setSuccessMessage(""); // Limpiar el mensaje de éxito si ocurre un error
      }
    } catch (err) {
      setError(err.message || "Error de red.");
      setSuccessMessage(""); // Limpiar el mensaje de éxito si ocurre un error
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword); // Alternar entre mostrar y ocultar la contraseña
  };

  return (
    <div className="bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 flex justify-center items-center" style={{ height: "calc(100vh - 70px)" }}>
      <div className="w-[400px] lg:max-w-md sm:max-w-full mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl sm:text-3xl font-semibold text-center text-gray-900 mb-6">
          Bienvenido de nuevo
        </h2>

        {error && <p className="text-red-500 text-xs sm:text-sm mb-4 text-center">{error}</p>}
        {successMessage && <p className="text-green-500 text-xs sm:text-sm mb-4 text-center">{successMessage}</p>}

        <form onSubmit={handleSubmit}>
          {/* Campo de correo electrónico */}
          <div className="mb-6">
            <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700">
              Correo Electrónico
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                placeholder="Ingrese su email"
                className="w-full mt-1 p-2 sm:p-3 pl-8 sm:pl-10 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                required
              />
              <FaEnvelope className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
            </div>
          </div>

          {/* Campo de contraseña */}
          <div className="mb-6">
            <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"} // Si `showPassword` es true, muestra la contraseña en texto
                id="password"
                placeholder="Ingrese su contraseña"
                className="w-full mt-1 p-2 sm:p-3 pl-8 sm:pl-10 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                required
              />
              <FaLock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <div
                onClick={togglePasswordVisibility}
                className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 cursor-pointer"
              >
                {showPassword ? <FaEyeSlash className="text-gray-500" /> : <FaEye className="text-gray-500" />}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full p-3 sm:p-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
          >
            Iniciar Sesión
          </button>

          <div className="mt-4 sm:mt-3 text-center">
            <p className="text-xs sm:text-sm text-gray-600">
              ¿No tienes cuenta?{" "}
              <a href="/register" className="text-blue-600 hover:underline">
                Regístrate
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
