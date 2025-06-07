import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { ThemeContext } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { FiBook, FiSearch, FiChevronLeft, FiChevronRight, FiAlertTriangle } from "react-icons/fi";

const Busqueda = ({
  searchTerm,
  onSearchChange,
  booksPerPage,
  currentPage,
  setCurrentPage,
  selectedCategory,
  onCategoryChange,
  categories
}) => {
  const { theme } = useContext(ThemeContext);
  const [books, setBooks] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      if (!searchTerm && !selectedCategory) {
        setBooks([]);
        setTotalPages(1);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        let url = "";
        if (searchTerm) {
          url = `https://openlibrary.org/search.json?q=${encodeURIComponent(searchTerm)}&limit=${booksPerPage}&offset=${(currentPage - 1) * booksPerPage}`;
        } else if (selectedCategory) {
          url = `https://openlibrary.org/subjects/${selectedCategory}.json?limit=${booksPerPage}&offset=${(currentPage - 1) * booksPerPage}`;
        }

        const response = await axios.get(url).catch(error => {
          // Si hay error pero la respuesta contiene datos, la procesamos
          if (error.response?.data) {
            return error.response;
          }
          throw error;
        });

        const works = response.data.works || response.data.docs || [];
        setBooks(works);
        
        // Solo mostramos error si NO hay libros y hay un error real
        if (works.length === 0 && response.status !== 200) {
          setError("No se encontraron resultados. Intenta con otro término.");
        }

        const numFound = response.data.numFound || (works.length * 10);
        setTotalPages(Math.ceil(numFound / booksPerPage));

      } catch (error) {
        console.error("Error fetching books:", error);
        // Solo mostramos error si no hay libros
        if (books.length === 0) {
          setError("Error al cargar los libros. Por favor intenta nuevamente.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    const debounceFetch = setTimeout(fetchBooks, 500);
    return () => clearTimeout(debounceFetch);
  }, [currentPage, selectedCategory, searchTerm, booksPerPage]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  useEffect(() => {
    if (showLoginAlert) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [showLoginAlert]);

  const handleBookClick = (book) => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      setShowLoginAlert(true);
      setTimeout(() => {
        setShowLoginAlert(false);
        navigate("/login");
      }, 3000);
      return;
    }
    
    const olid = book.cover_edition_key || book.edition_key?.[0] || book.key?.split("/").pop();
    if (olid) {
      navigate(`/book/${olid}`);
    }
  };

  const hasActiveSearch = searchTerm || selectedCategory;
  const hasResults = books.length > 0;
  const showNoResults = hasActiveSearch && !isLoading && !hasResults;

  return (
    <div className={`mb-6 ${theme === "dark" ? "dark:bg-gray-900" : ""}`}>
      {/* Alertas */}
      {showLoginAlert && (
        <div className="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-md shadow-md animate-fade-in">
          <div className="flex items-center">
            <FiAlertTriangle className="mr-2 text-xl" />
            <p>Debes iniciar sesión para ver los detalles del libro. Redirigiendo...</p>
          </div>
        </div>
      )}
      
      {/* {error && (
        <div className={`mb-6 p-4 rounded-md shadow-md ${
          error.includes("No se encontraron") 
            ? "bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700"
            : "bg-red-100 border-l-4 border-red-500 text-red-700"
        }`}>
          <div className="flex items-center">
            <FiAlertTriangle className="mr-2 text-xl" />
            <p>{error}</p>
          </div>
        </div>
      )} */}

      {/* Input de búsqueda */}
      <div className="flex justify-center mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Buscar libros por título o autor..."
          className={`px-4 py-3 border rounded-lg w-full max-w-2xl ${
            theme === "dark"
              ? "bg-gray-700 text-white border-gray-600 focus:ring-gray-500 focus:border-gray-500"
              : "bg-white text-gray-700 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          } transition-all duration-200 shadow-sm`}
        />
      </div>

      {/* Select de categoría para móviles y botones para desktop */}
      <div className="mb-8">
        {/* Select para móviles */}
        <div className="block md:hidden w-full max-w-md mx-auto mb-4">
          <select
            value={selectedCategory || ""}
            onChange={(e) => {
              onCategoryChange(e.target.value);
              setCurrentPage(1);
            }}
            className={`w-full px-4 py-2 rounded-lg ${
              theme === "dark"
                ? "bg-gray-700 text-white border-gray-600"
                : "bg-white text-gray-700 border-gray-300"
            } border`}
          >
            <option value="">Selecciona una categoría</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Botones de categoría para desktop */}
        <div className="hidden md:flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                onCategoryChange(category.id);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                selectedCategory === category.id
                  ? "bg-indigo-600 text-white"
                  : theme === "dark"
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )}

      {/* Contenido de resultados (solo se muestra con búsqueda activa) */}
      {hasActiveSearch && (
        <>
          {/* Grid de libros - modificado para pantallas pequeñas */}
          {!isLoading && hasResults && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-4 sm:gap-6">
              {books.map((book) => (
                <div
                  key={book.key}
                  className={`group relative rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl ${
                    theme === "dark" ? "bg-gray-800" : "bg-white"
                  }`}
                  onClick={() => handleBookClick(book)}
                >
                  <div className="aspect-[2/3] bg-gray-200 relative">
                    {book.cover_id || book.cover_i ? (
                      <img
                        src={`https://covers.openlibrary.org/b/id/${book.cover_id || book.cover_i}-M.jpg`}
                        alt={book.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col justify-center items-center p-4 text-center">
                        <FiBook className="text-4xl text-gray-400 mb-2" />
                        <span className="text-gray-500 text-sm">Portada no disponible</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3
                      className={`font-semibold text-sm sm:text-lg mb-1 line-clamp-2 ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {book.title}
                    </h3>
                    <p
                      className={`text-xs sm:text-sm ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      } line-clamp-1`}
                    >
                      {book.authors?.map((a) => a.name).join(", ") ||
                        book.author_name?.join(", ") ||
                        "Autor desconocido"}
                    </p>
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer">
                    <span className="text-white font-medium bg-black bg-opacity-70 px-2 py-1 rounded-full text-xs sm:text-sm">
                      Ver detalles
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Mensaje de no resultados */}
          {showNoResults && (
            <div className="text-center py-12">
              <FiSearch className="mx-auto text-4xl text-gray-400 mb-4" />
              <h3 className="text-xl font-medium mb-2">No se encontraron resultados</h3>
              <p className="text-gray-500">
                Intenta con otro término de búsqueda o categoría
              </p>
            </div>
          )}

          {/* Paginación (solo mostrar si hay búsqueda activa y resultados) */}
          {hasActiveSearch && hasResults && totalPages > 1 && !isLoading && (
            <div className="flex justify-center mt-8 sm:mt-12">
              <nav className="flex items-center space-x-1 sm:space-x-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-1 sm:p-2 rounded-md ${
                    currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                  } ${
                    theme === "dark"
                      ? "bg-gray-700 hover:bg-gray-600"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  <FiChevronLeft className="text-lg sm:text-xl" />
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-md flex items-center justify-center text-sm sm:text-base ${
                        currentPage === pageNum
                          ? "bg-indigo-600 text-white"
                          : theme === "dark"
                          ? "bg-gray-700 hover:bg-gray-600"
                          : "bg-gray-200 hover:bg-gray-300"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-1 sm:p-2 rounded-md ${
                    currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
                  } ${
                    theme === "dark"
                      ? "bg-gray-700 hover:bg-gray-600"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  <FiChevronRight className="text-lg sm:text-xl" />
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Busqueda;