import React, { createContext, useContext, useState } from "react";

/**
 * Contexto para manejar notificaciones globales
 * Proporciona:
 * - Lista de notificaciones
 * - Funciones para añadir/eliminar notificaciones
 */
const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  // Añade una notificación con estructura definida
  const addNotification = (notification) => {
    setNotifications((prev) => [
      ...prev,
      {
        id: Date.now(), // ID único
        timestamp: new Date(), // Fecha/hora
        ...notification // Datos específicos
      }
    ]);
  };

  // Elimina una notificación por ID
  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Limpia todas las notificaciones
  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

// Hook personalizado para fácil acceso al contexto
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications debe usarse dentro de NotificationProvider");
  }
  return context;
}