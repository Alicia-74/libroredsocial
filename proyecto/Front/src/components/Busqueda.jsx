import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { ThemeContext } from "../context/ThemeContext"; // Import ThemeContext
import { useNavigate } from "react-router-dom"; // Import useNavigate para la navegación

const Busqueda = ({
  searchTerm,
  onSearchChange,
  booksPerPage,
  currentPage,
  setCurrentPage,
  selectedCategory,
  onCategoryChange
}) => {
  const { theme } = useContext(ThemeContext); // Access the theme from context
  const [books, setBooks] = useState([]); // Estado para los libros
  const [totalPages, setTotalPages] = useState(1); // Total de páginas
  const [totalItems, setTotalItems] = useState(0); // Total de elementos encontrados
  const [showLoginAlert, setShowLoginAlert] = useState(false); // For login alert
  const navigate = useNavigate();


  const categories = ["fantasy", "science", "history", "art", "biography", "computers", "romance"];

  useEffect(() => {
    let query = searchTerm || selectedCategory; // Priorizar búsqueda sobre categoría
    if (!query) return; // No hacer petición si no hay término o categoría

    axios
      .get(
        `https://openlibrary.org/search.json?title=${query}&limit=100`
      )
      .then((response) => {
        setBooks(response.data.docs || []);
        const numFound = response.data.numFound || (response.data.works ? response.data.works.length * 10 : 0);
        setTotalItems(numFound);
        setTotalPages(Math.ceil(numFound / booksPerPage)); // Calculamos el total de páginas
      })
      .catch((error) => console.error("Error searching books:", error));
  }, [searchTerm, currentPage, selectedCategory]); // Se ejecuta cuando cambia el término de búsqueda, la página actual o la categoría seleccionada

  
  useEffect(() => {
    // Cuando se muestre la alerta, desplazamos la página hacia la parte superior
    if (showLoginAlert) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [showLoginAlert]); // Este useEffect se activa cuando showLoginAlert cambia

  const handleBookClick = (book) => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      setShowLoginAlert(true);
      setTimeout(() => {
        setShowLoginAlert(false);
        navigate("/login"); // Redirigir al login después de 3 segundos
      }, 3000); // 3 segundos de espera
      return;
    }
  };
  
  return (
    <div className={`mb-6 ${theme === "dark" ? "dark:bg-gray-900 dark:text-white" : ""}`}>
     {/* Login Alert */}
      {showLoginAlert && (
        <div className="mb-8 p-4 text-yellow-900 bg-yellow-100 border border-yellow-300 rounded-md text-center shadow-md transition duration-500">
          ⚠️ Debes iniciar sesión para ver los detalles del libro. Redirigiendo...
        </div>
      )}
     
      {/* Buscador */}
      <div className="flex justify-center mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Buscar libros..."
          className={`px-4 py-2 border rounded-md w-full sm:w-full md:w-[500px] lg:w-[600px] ${
            theme === "dark"
              ? "bg-gray-700 text-white border-gray-600 focus:ring-gray-500"
              : "bg-white text-gray-700 border-gray-300 focus:ring-blue-500"
          } transition-all duration-200`}
        />
      </div>

      {/* Botones de categoría (solo en pantallas medianas y grandes) */}
      <div className="hidden md:flex justify-center mb-7 space-x-4">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`px-4 py-2 rounded-lg ${
              selectedCategory === category
                ? theme === "dark"
                  ? "bg-gray-800 text-white"
                  : "bg-gray-600 text-white"
                : theme === "dark"
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            } transition duration-300`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Select para pantallas pequeñas */}
      <div className="sm:block md:hidden w-full mt-4 mb-4">
        <div className={`bg-white shadow-md rounded-lg p-4 ${theme === "dark" ? "dark:bg-gray-800" : ""}`}>
          <label htmlFor="category-small" className={`block text-lg font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-900"} mb-2`}>
            Categoría
          </label>
          <select
            id="category-small"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className={`w-full py-2 px-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all duration-200 ${
              theme === "dark"
                ? "bg-gray-700 text-white border-gray-600"
                : "bg-white text-gray-700 border-gray-300"
            }`}
          >
            <option value="">Seleccionar categoría</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de libros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
        {books.map((book) => (
          <div
            key={book.key}
            onClick={() => handleBookClick(book)} // Call handleBookClick on book click
            className={`cursor-pointer bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 ${
              theme === "dark" ? "dark:bg-gray-800" : ""
            }`}
          >

            {/* Imagen del libro */}
            <div className="w-full h-72 mb-4 flex justify-center items-center">
              {book.cover_i ? (
                <img
                  src={`https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`}
                  alt={book.title}
                  className="object-contain w-full h-full rounded-md"
                />
              ) : (
                <div className="bg-gray-300 w-full h-full flex justify-center items-center text-gray-600 text-lg">
                  No disponible
                </div>
              )}
            </div>
            {/* Título del libro */}
            <h3 className={`text-xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{book.title}</h3>
            {/* Autor(es) del libro */}
            <p className={`text-md ${theme === "dark" ? "text-gray-300" : "text-gray-600"} mt-2`}>
              {book.author_name?.join(", ") || "Autor desconocido"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Busqueda;
