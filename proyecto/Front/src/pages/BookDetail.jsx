import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const BookDetail = () => {
  const { olid } = useParams(); // OpenLibrary ID
  const [book, setBook] = useState(null);
  const [description, setDescription] = useState("");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      setUserId(decoded.sub); // Asegúrate de usar el campo correcto
    }

    fetch(`http://localhost:8080/api/external/book/${olid}`,{
        headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setBook(data);
        setDescription(data.description?.value || data.description || "Sin descripción.");
      })
      .catch(err => console.error("Error cargando libro:", err));
  }, [olid]);

  const handleAdd = async (type) => {
    const token = sessionStorage.getItem("token");
    const endpoint = `http://localhost:8080/api/books/${type}/${userId}/${olid}`;
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      });

      const message = await response.text();
      alert(message);
    } catch (error) {
      console.error("Error al añadir:", error);
    }
  };

  if (!book) return <div>Cargando libro...</div>;

  return (
    <div className="flex p-8 space-x-8 bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
      <img
        src={`http://localhost:8080/api/external/book/${olid}`}
        alt={book.title}
        className="w-64 h-auto object-contain shadow-lg"
      />

      <div className="flex-1">
        <h1 className="text-3xl font-bold mb-4">{book.title}</h1>
        <p className="mb-6">{description}</p>

        <div className="space-x-4">
          <button
            onClick={() => handleAdd("read")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Añadir a Leídos
          </button>
          <button
            onClick={() => handleAdd("fav")}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Añadir a Favoritos
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
