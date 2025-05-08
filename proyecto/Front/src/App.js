import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Navbar from "./components/Navbar";
import "./tailwind.css";
import PerfilUsuario from "./pages/PerfilUsuario";
import BookDetail from "./pages/BookDetail"; // Importar el componente de detalle del libro

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} /> {/* Tu perfil */}
            <Route path="/perfilUsuario/:id" element={<PerfilUsuario />} /> {/* Perfil de otro usuario */}
            <Route path="/book/:olid" element={<BookDetail />} /> {/* Detalle del libro */}
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
