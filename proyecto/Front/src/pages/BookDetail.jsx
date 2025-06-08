import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { ThemeContext } from "../context/ThemeContext";


const BookDetail = () => {
  const { olid } = useParams();
  const [book, setBook] = useState(null);
  const [description, setDescription] = useState("");
  const [userId, setUserId] = useState(null);
  const [alert, setAlert] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      setUserId(decoded.sub);
    }

    setIsLoading(true);
    fetch(`${API_URL}/api/books/external/book/${olid}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setBook(data);
        setDescription(
          data.description?.value || data.description || "No hay descripción disponible."
        );
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error cargando libro:", err);
        setIsLoading(false);
      });
  }, [olid]);

  const handleAdd = async (type) => {
    const token = sessionStorage.getItem("token");
    const endpoint = `${API_URL}/api/books/${type}/${userId}/${olid}`;
    
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const message = await response.text();
      
      // Mensajes personalizados según el tipo
      const successMessage = type === "read" 
        ? "Libro añadido a la lista de leídos" 
        : "Libro añadido a la lista de favoritos";
      
      setAlert({ type: "success", message: successMessage });

      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      console.error("Error al añadir:", error);
      const errorMessage = type === "read"
        ? "Error al añadir a leídos"
        : "Error al añadir a favoritos";
      
      setAlert({
        type: "error",
        message: errorMessage,
      });
      setTimeout(() => setAlert(null), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-6 max-w-md">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            No se pudo cargar el libro
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Lo sentimos, ha ocurrido un error al cargar la información del libro.
          </p>
        </div>
      </div>
    );
  }

  const handleBack = () => navigate("/");

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Alertas */}
      {alert && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transition-all duration-300 transform ${
            alert.type === "success"
              ? "bg-green-100 text-green-800 border border-green-200"
              : "bg-red-100 text-red-800 border border-red-200"
          }`}
        >

          <div className="flex items-center">
            {alert.type === "success" ? (
              <svg
                className="w-5 h-5 mr-2 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            ) : (
              <svg
                className="w-5 h-5 mr-2 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            )}
            <span>{alert.message}</span>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-12">
        <button
            onClick={handleBack}
            className={`flex items-center mb-5 space-x-2 ${theme === "light" ? "text-gray-700" : "text-gray-300"} hover:text-blue-500 transition-colors`}
            >
            <FaArrowLeft className="text-lg" />
            <span className="hidden sm:inline">Volver</span>
          </button>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Portada del libro */}
            <div className="lg:w-1/3 p-6 flex justify-center bg-gray-100 dark:bg-gray-700">
              <img
                src={`${API_URL}/api/books/external/book/${olid}-L.jpg`}
                alt={book.title}
                className="w-full max-w-xs h-auto object-contain rounded-lg shadow-md transition-transform duration-300 hover:scale-105"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/300x450?text=No+Image";
                }}
              />
            </div>

            {/* Detalles del libro */}
            <div className="lg:w-2/3 p-8">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                {book.title}
              </h1>
              
              <div className="flex items-center mb-6">
                <span className="text-gray-600 dark:text-gray-300 mr-2">por</span>
                <h2 className="text-xl font-medium text-gray-700 dark:text-gray-200">
                  {book.author || "Autor desconocido"}
                </h2>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                  Descripción
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {description}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <button
                  onClick={() => handleAdd("read")}
                  className="flex-1 flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition-all duration-300"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  Añadir a Leídos
                </button>
                <button
                  onClick={() => handleAdd("fav")}
                  className="flex-1 flex items-center justify-center px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg shadow-md transition-all duration-300"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    ></path>
                  </svg>
                  Añadir a Favoritos
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;