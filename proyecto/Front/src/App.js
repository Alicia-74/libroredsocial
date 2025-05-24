import React, { useState, useContext, useEffect } from 'react'; // Importa useContext y useEffect
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext"; // Importa AuthContext
import { ThemeProvider } from "./context/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Navbar from "./components/Navbar";
import "./tailwind.css";
import PerfilUsuario from "./pages/PerfilUsuario";
import BookDetail from "./pages/BookDetail";
import ChatComponent from './components/ChatComponent';


function App() {
  const [hideNavbar, setHideNavbar] = useState(false);

  // Asegúrate de que AuthProvider envuelva ThemeProvider para acceder a AuthContext
  return (
    <AuthProvider>
      <AppContent setHideNavbar={setHideNavbar} hideNavbar={hideNavbar} />
    </AuthProvider>
  );
}

// Nuevo componente para usar useContext dentro del Router
function AppContent({ setHideNavbar, hideNavbar }) {
  // Obtén el userId del AuthContext
  const { user } = useContext(AuthContext);
  // Usa el ID del usuario si está logueado, de lo contrario null o undefined
  const loggedInUserId = user ? user.id : null;

  return (
    <ThemeProvider userId={loggedInUserId}> {/* Pasa el userId al ThemeProvider */}
      <Router>
        <Navbar hideOnChat={hideNavbar} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/perfilUsuario/:id" element={<PerfilUsuario />} />
          <Route path="/book/:olid" element={<BookDetail />} />
          <Route path="/messages" element={<ChatComponent currentUserId={loggedInUserId} onChatOpen={() => setHideNavbar(true)} onChatClose={() => setHideNavbar(false)}/>}/>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;