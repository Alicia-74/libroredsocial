import React, { useState } from "react";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación básica de los campos
    if (!username || !email || !password) {
      setError("Por favor, complete todos los campos.");
      return;
    }

    // Realizamos la petición de registro usando fetch
    try {
      const response = await fetch("http://localhost:8080/api/users/register", {
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
        setSuccessMessage("Usuario registrado con éxito.");
        setError(""); // Limpiar cualquier mensaje de error anterior

        // Limpiar los campos de entrada después del registro
        setUsername("");
        setEmail("");
        setPassword("");

        // Redirigir después de 2 segundos
        setTimeout(() => {
          navigate("/login"); // Redirige a la página de login
        }, 2000);
      } else {
        const errorData = await response.json();
        // Verificamos si el error es relacionado al email
        if (errorData.message && errorData.message.includes("correo")) {
          setError("El correo electrónico ya está registrado.");
        } else {
          setError(errorData.message || "Hubo un error al registrar el usuario.");
        }
        setSuccessMessage(""); // Limpiar el mensaje de éxito si ocurre un error
      }
    } catch (err) {
      setError(err.message || "Error de red.");
      setSuccessMessage(""); // Limpiar el mensaje de éxito si ocurre un error
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div
      className="bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 flex justify-center items-center"
      style={{ height: "calc(100vh - 70px)" }}
    >
      <div className="w-full max-w-sm sm:max-w-md px-4 sm:px-8 py-4 sm:py-6 bg-white rounded-2xl shadow-lg">
        <h2 className="text-2xl sm:text-3xl font-semibold text-center text-gray-900 mb-6">
          Crear Cuenta
        </h2>

        {error && <p className="text-red-500 text-xs sm:text-sm mb-4 text-center">{error}</p>}
        {successMessage && (
          <p className="text-green-500 text-xs sm:text-sm mb-4 text-center">{successMessage}</p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="username" className="block text-xs sm:text-sm font-medium text-gray-700">
              Nombre de Usuario
            </label>
            <div className="relative">
              <input
                type="text"
                id="username"
                placeholder="Ingrese su nombre de usuario"
                className="w-full mt-1 p-2 sm:p-3 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                onChange={(e) => setUsername(e.target.value)}
                value={username}
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700">
              Correo Electrónico
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                placeholder="Ingrese su correo electrónico"
                className="w-full mt-1 p-2 sm:p-3 pl-8 sm:pl-10 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                required
              />
              <FaEnvelope className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
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
            Registrarse
          </button>

          <div className="mt-4 sm:mt-3 text-center">
            <p className="text-xs sm:text-sm text-gray-600">
              ¿Ya tienes cuenta?{" "}
              <a href="/login" className="text-blue-500 hover:text-blue-700">
                Inicia sesión
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
