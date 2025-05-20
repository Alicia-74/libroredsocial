import React, { useState, useEffect, useContext } from "react";
import Busqueda from "../components/Busqueda";
import BusquedaUsuarios from "../components/BusquedaUsuario";
import axios from "axios";
import { debounce } from "lodash";
import { ThemeContext } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { FiBook,FiAlertTriangle } from "react-icons/fi";

const Home = () => {
  const { theme } = useContext(ThemeContext);
  const [books, setBooks] = useState([]);
  const [defaultBooks, setDefaultBooks] = useState([]); // Nuevo estado para libros por defecto
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const booksPerPage = 10;
  const navigate = useNavigate();

  const categories = [
    { id: "fantasy", name: "Fantasía" },
    { id: "science", name: "Ciencia" },
    { id: "history", name: "Historia" },
    { id: "art", name: "Arte" },
    { id: "biography", name: "Biografías" },
    { id: "computers", name: "Tecnología" },
    { id: "romance", name: "Romance" }
  ];

  const hasActiveSearch = searchTerm || selectedCategory; // Determina si hay búsqueda activa

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setSelectedCategory("");
    setCurrentPage(1);
  };

  // Efecto para cargar libros por defecto (solo una vez al montar el componente)
  useEffect(() => {
    const fetchDefaultBooks = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `https://openlibrary.org/subjects/fantasy.json?limit=${booksPerPage}`
        );
        setDefaultBooks(response.data.works || []);
      } catch (error) {
        console.error("Error fetching default books:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDefaultBooks();
  }, []);

  // Efecto para búsquedas activas
  useEffect(() => {
    const fetchBooks = debounce(() => {
      if (!hasActiveSearch) return; // No hacer nada si no hay búsqueda activa

      setIsLoading(true);
      setError(null);
      
      let url = "";
      if (searchTerm) {
        url = `https://openlibrary.org/search.json?q=${searchTerm}&limit=${booksPerPage}&offset=${(currentPage - 1) * booksPerPage}`;
      } else if (selectedCategory) {
        url = `https://openlibrary.org/subjects/${selectedCategory}.json?limit=${booksPerPage}&offset=${(currentPage - 1) * booksPerPage}`;
      }

      axios.get(url)
        .then((response) => {
          const works = response.data.works || [];
          setBooks(works);
          const numFound = response.data.numFound || (works.length * 10);
          setTotalPages(Math.ceil(numFound / booksPerPage));
        })
        .catch((error) => {
          console.error("Error fetching books:", error);
          setError("Error al cargar los libros. Por favor intenta nuevamente.");
        })
        .finally(() => setIsLoading(false));
    }, 500);

    fetchBooks();
  
    return () => fetchBooks.cancel();
  }, [currentPage, selectedCategory, searchTerm, hasActiveSearch]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  useEffect(() => {
    if (showLoginAlert) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [showLoginAlert]);

  return (
    <div className={`min-h-screen py-8 transition-colors duration-300 ${theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Alertas */}
        {showLoginAlert && (
          <div className="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-md shadow-md animate-fade-in">
            <div className="flex items-center">
              <FiAlertTriangle className="mr-2 text-xl" />
              <p>Debes iniciar sesión para ver los detalles del libro. Redirigiendo...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md shadow-md">
            <div className="flex items-center">
              <FiAlertTriangle className="mr-2 text-xl" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="mb-12 text-center">
          <div className="flex justify-center mb-6">
            <FiBook className="text-4xl text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold mb-4">
            {searchTerm 
              ? `Resultados para "${searchTerm}"` 
              : selectedCategory 
                ? `${categories.find(c => c.id === selectedCategory)?.name || selectedCategory}` 
                : "Explora Nuestra Biblioteca"}
          </h1>
          <p className="text-lg opacity-90">
            {searchTerm || selectedCategory 
              ? "Encuentra tu próximo libro favorito" 
              : "Descubre miles de libros en diferentes categorías"}
          </p>
        </header>

        {/* Busqueda de Usuarios */}
        <div className="mb-10">
          <BusquedaUsuarios />
        </div>
        
        {/* Componente de búsqueda */}
        <div className="max-w-3xl mx-auto mb-12">
          <Busqueda
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            booksPerPage={booksPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            categories={categories}
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}

        {/* Contenido condicional */}
        {!isLoading && (
          <>
            {/* Mostrar resultados de búsqueda si hay búsqueda activa */}
            {hasActiveSearch ? (
              <>
                {/* Grid de libros de búsqueda */}
                {books.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {books.map((book) => (
                      <div
                        key={book.key}
                        className={`group relative rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}
                        onClick={() => {
                          const token = sessionStorage.getItem("token");
                          if (!token) {
                            setShowLoginAlert(true);
                            setTimeout(() => {
                              setShowLoginAlert(false);
                              navigate("/login");
                            }, 3100);
                            return;
                          }
                          const olid = book.cover_edition_key || book.edition_key?.[0] || book.key?.split("/").pop();
                          if (olid) {
                            navigate(`/book/${olid}`);
                          }
                        }}
                      >
                        <div className="aspect-[2/3] bg-gray-200 relative">
                          {book.cover_id || book.cover_i ? (
                            <img
                              src={`https://covers.openlibrary.org/b/id/${book.cover_id || book.cover_i}-L.jpg`}
                              alt={book.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col justify-center items-center p-4 text-center">
                              <FiBook className="text-4xl text-gray-400 mb-2" />
                              <span className="text-gray-500">Portada no disponible</span>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className={`font-semibold text-lg mb-1 line-clamp-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                            {book.title}
                          </h3>
                          <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                            {book.authors?.map(a => a.name).join(", ") || book.author_name?.join(", ") || "Autor desconocido"}
                          </p>
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer">
                          <span className="text-white font-medium bg-black bg-opacity-70 px-3 py-1 rounded-full text-sm">
                            Ver detalles
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              /* Mostrar libros por defecto cuando no hay búsqueda activa */
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                  {defaultBooks.map((book) => (
                    <div
                      key={book.key}
                      className={`group relative rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}
                      onClick={() => {
                        const token = sessionStorage.getItem("token");
                        if (!token) {
                          setShowLoginAlert(true);
                          setTimeout(() => {
                            setShowLoginAlert(false);
                            navigate("/login");
                          }, 3100);
                          return;
                        }
                        const olid = book.cover_edition_key || book.edition_key?.[0] || book.key?.split("/").pop();
                        if (olid) {
                          navigate(`/book/${olid}`);
                        }
                      }}
                    >
                      <div className="aspect-[2/3] bg-gray-200 relative">
                        {book.cover_id || book.cover_i ? (
                          <img
                            src={`https://covers.openlibrary.org/b/id/${book.cover_id || book.cover_i}-L.jpg`}
                            alt={book.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col justify-center items-center p-4 text-center">
                            <FiBook className="text-4xl text-gray-400 mb-2" />
                            <span className="text-gray-500">Portada no disponible</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className={`font-semibold text-lg mb-1 line-clamp-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                          {book.title}
                        </h3>
                        <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                          {book.authors?.map(a => a.name).join(", ") || book.author_name?.join(", ") || "Autor desconocido"}
                        </p>
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer">
                        <span className="text-white font-medium bg-black bg-opacity-70 px-3 py-1 rounded-full text-sm">
                          Ver detalles
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;