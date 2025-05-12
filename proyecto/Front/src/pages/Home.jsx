import React, { useState, useEffect, useContext } from "react";
import Busqueda from "../components/Busqueda"; // Importar Busqueda
import BusquedaUsuarios from "../components/BusquedaUsuario"; // Importar BusquedaUsuarios
import axios from "axios";
import { debounce } from "lodash"; // Importar debounce para optimizar la búsqueda
import { ThemeContext } from "../context/ThemeContext"; 
import { useNavigate } from "react-router-dom";


const Home = () => {
  const { theme } = useContext(ThemeContext); // Accedemos al tema actual
  const [books, setBooks] = useState([]); // Estado para los libros
  const [currentPage, setCurrentPage] = useState(1); // Página actual
  const [totalPages, setTotalPages] = useState(1); // Total de páginas
  const [selectedCategory, setSelectedCategory] = useState(""); // Categoría seleccionada
  const [searchTerm, setSearchTerm] = useState(""); // Estado para el término de búsqueda
  const [showLoginAlert, setShowLoginAlert] = useState(false); // Mostrar alerta si no hay token
  const booksPerPage = 10; // Libros por página
  const navigate = useNavigate();


  const categories = ["fantasy", "science", "history", "art", "biography", "computers", "romance"];

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSearchTerm(""); // Limpiar búsqueda cuando se selecciona una categoría
    setCurrentPage(1); // Resetear a la primera página
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setSelectedCategory(""); // Limpiar categoría cuando se ingresa un término de búsqueda
    setCurrentPage(1); // Resetear a la primera página
  };

  // useEffect para cargar los libros según el término de búsqueda o la categoría seleccionada
  useEffect(() => {
    const fetchBooks = debounce(() => {
    let url = "";

    // Si hay un término de búsqueda
    if (searchTerm) {
      url = `https://openlibrary.org/search.json?q=${searchTerm}&limit=${booksPerPage}&offset=${(currentPage - 1) * booksPerPage}`;
    }
    // Si hay una categoría seleccionada
    else if (selectedCategory) {
      url = `https://openlibrary.org/subjects/${selectedCategory}.json?limit=${booksPerPage}&offset=${(currentPage - 1) * booksPerPage}`;
    }
    // Si no hay término de búsqueda ni categoría, mostrar libros por defecto
    else {
      url = `https://openlibrary.org/subjects/fantasy.json?limit=${booksPerPage}&offset=${(currentPage - 1) * booksPerPage}`;
    }

    axios.get(url)
      .then((response) => {
        // Asegúrate de que `response.data.works` existe antes de usarlo
        const works = response.data.works || [];
        setBooks(works); // Guardamos los libros en el estado
        const numFound = response.data.numFound || (works.length * 10); // Para hacer un fallback si `numFound` no existe
        setTotalPages(Math.ceil(numFound / booksPerPage)); // Calculamos el total de páginas correctamente
      })
      .catch((error) => console.error("Error fetching books:", error));
    }, 500); // Espera 500ms después de dejar de escribir

    fetchBooks();
  
    return () => fetchBooks.cancel(); // Cancela si el efecto vuelve a ejecutarse
  }, [currentPage, selectedCategory, searchTerm]); // Se ejecuta cuando cambia la página actual, categoría o término de búsqueda

  // useEffect para desplazarse hacia arriba después de cambiar la página
  useEffect(() => {
    window.scrollTo(0, 0); // Esto hará que la página se desplace hacia arriba
  }, [currentPage]); // Se ejecuta cada vez que cambie la página


 // useEffect para desplazarse hacia arriba cuando la alerta se activa
  useEffect(() => {
    if (showLoginAlert) {
      window.scrollTo(0, 0); // Esto hará que la página se desplace hacia arriba cuando se muestre la alerta
    }
  }, [showLoginAlert]); // Se ejecuta cada vez que cambia la visibilidad de la alerta



  return (
    <div className={`bg-gray-100 min-h-screen py-10 ${theme === "dark" ? "dark:bg-gray-900 dark:text-white" : ""}`}>
      <div className="container mx-auto px-4">
        {/* Alerta visual si no hay login */}
        {showLoginAlert && (
          <div className="mb-8 p-4 text-yellow-900 bg-yellow-100 border border-yellow-300 rounded-md text-center shadow-md transition duration-500">
            ⚠️ Debes iniciar sesión para ver los detalles del libro. Redirigiendo...
          </div>
        )}
        
        {/* Busqueda de Usuarios */}
        <div>
            <BusquedaUsuarios /> {/* Llamamos al componente BusquedaUsuarios */}
        </div>
        
        {/* El h2 muestra dinámicamente el término de búsqueda */}
        <h2 className={`text-4xl font-bold mb-12 text-center ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
          {searchTerm ? `Resultados de búsqueda para "${searchTerm}"` : selectedCategory ? `Libros sobre ${selectedCategory}` : "Buscar Libros"}
        </h2>


        {/* Componente de búsqueda con ajuste de tamaño en pantallas pequeñas */}
        <div className="sm:w-full md:w-auto">
          <Busqueda
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            booksPerPage={booksPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />
        </div>

       {/* Render libros ya cargados */}
       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          {books.map((book) => (
            <div
              key={book.key}
              className={`bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 ${theme === "dark" ? "dark:bg-gray-800" : ""}`}
              onClick={() => {
                const token = sessionStorage.getItem("token");

                // Si no hay token, mostramos la alerta y redirigimos
                if (!token) {
                  setShowLoginAlert(true);
                  setTimeout(() => {
                    setShowLoginAlert(false);
                    navigate("/login");
                  }, 3100); // 3 segundos
                  return;
                }

                // Si está logueado, navegamos normalmente
               const olid = book.cover_edition_key || book.edition_key?.[0] || book.key?.split("/").pop();
                  if (olid) {
                  navigate(`/book/${olid}`);
                } else {
                  console.error("No se encontró un identificador válido para este libro.");
                }
              }}          
            >
              <div className="w-full h-72 mb-4 flex justify-center items-center">
                {book.cover_id || book.cover_i ? (
                  <img
                    src={`https://covers.openlibrary.org/b/id/${book.cover_id || book.cover_i}-L.jpg`}
                    alt={book.title}
                    className="object-contain w-full h-full rounded-md"
                  />
                ) : (
                  <div className="bg-gray-300 w-full h-full flex justify-center items-center text-gray-600 text-lg">
                    No disponible
                  </div>
                )}
              </div>
              <h3 className={`text-xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                {book.title}
              </h3>
              <p className={`text-md ${theme === "dark" ? "text-gray-300" : "text-gray-600"} mt-2`}>
                {book.authors?.map(a => a.name).join(", ") || book.author_name?.join(", ") || "Autor desconocido"}
              </p>
            </div>
          ))}
        </div>

        {/* Paginación (visible en todas las pantallas) */}
        {totalPages > 1 && (
          <div className="flex mt-12 justify-center items-center space-x-4">
            {/* Botón "Anterior" */}
            {currentPage > 1 && (
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                className={`px-6 py-3 rounded-lg shadow-lg ${theme === "dark" ? "bg-gray-800 text-white hover:bg-gray-700" : "bg-gray-300 text-gray-900 hover:bg-gray-200"}`}
              >
                Anterior
              </button>
            )}

            {/* Indicador de página */}
            <span className={`text-xl font-medium ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
              Página {currentPage} de {totalPages}
            </span>

            {/* Botón "Siguiente" */}
            {currentPage < totalPages && (
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                className={`px-6 py-3 rounded-lg shadow-lg ${theme === "dark" ? "bg-gray-800 text-white hover:bg-gray-700" : "bg-gray-300 text-gray-900 hover:bg-gray-200"}`}
              >
                Siguiente
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
