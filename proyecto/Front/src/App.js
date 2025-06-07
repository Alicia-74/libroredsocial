// App.js (o donde esté tu estructura principal)
import React, { useState, useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import NotificationListener from './components/NotificationListener';
import { NotificationProvider } from './components/ContextNotification';
import NotificationToasts from './components/ToastsNotification';
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import PerfilUsuario from "./pages/PerfilUsuario";
import BookDetail from "./pages/BookDetail";
import ChatComponent from './components/ChatComponent';
import QR from './components/QR';


/**
 * Componente principal de la aplicación
 * - Provee todos los contextos necesarios
 * - Configura el enrutamiento
 * - Maneja la lógica de navegación
 */
function App() {

  
  const [hideNavbar, setHideNavbar] = useState(false);

  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent setHideNavbar={setHideNavbar} hideNavbar={hideNavbar} />
      </NotificationProvider>
    </AuthProvider>
  );
}

/**
 * Contenido principal de la aplicación
 * - Accede al contexto de autenticación
 * - Configura el tema según el usuario
 * - Renderiza la estructura de rutas
 */
function AppContent({ setHideNavbar, hideNavbar }) {
  const { user } = useContext(AuthContext);
  const loggedInUserId = user?.id || null;

   const [isMobile, setIsMobile] = useState(false); 
 
 // Detectar si es móvil (<= 768px)
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    };
    checkScreenSize(); // Verificar al cargar
    window.addEventListener('resize', checkScreenSize); // Escuchar cambios
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []); 

  return (
    <ThemeProvider userId={loggedInUserId}>
      <Router>
        
        {/* Navbar */}
        <Navbar hideOnChat={isMobile && hideNavbar} isMobile={isMobile} />

        {/* Sistema de notificaciones */}
        <NotificationListener currentUserId={loggedInUserId} />
        <NotificationToasts />

        

        {/* Rutas principales */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/perfilUsuario/:id" element={<PerfilUsuario />} />
          <Route path="/book/:olid" element={<BookDetail />} />
          <Route
            path="/messages"
            element={
              <ChatComponent
                currentUserId={loggedInUserId}
                onChatOpen={() => setHideNavbar(true)}
                onChatClose={() => setHideNavbar(false)}
              />
            }
          />
          <Route path="/qr" element={<QR />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
