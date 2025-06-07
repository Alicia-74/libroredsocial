import { useEffect, useState } from 'react';
import { useNotifications } from './ContextNotification';

/**
 * Componente que muestra notificaciones in-app como toasts
 * - Se auto-ocultan después de un tiempo
 * - Soporta múltiples notificaciones
 * - Animaciones de entrada/salida
 */
export default function NotificationToasts() {
  const { notifications, removeNotification } = useNotifications();
  const [visibleNotifications, setVisibleNotifications] = useState([]);

  // Sincroniza notificaciones visibles
  useEffect(() => {
    setVisibleNotifications(notifications);
  }, [notifications]);

  // Auto-oculta notificaciones después de 5 segundos
  useEffect(() => {
    const timers = visibleNotifications.map(notif => {
      return setTimeout(() => {
        removeNotification(notif.id);
      }, 5000);
    });

    return () => timers.forEach(timer => clearTimeout(timer));
  }, [visibleNotifications, removeNotification]);

  if (visibleNotifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 w-80">
      {visibleNotifications.map((notif) => (
        <ToastNotification
          key={notif.id}
          notification={notif}
          onClose={() => removeNotification(notif.id)}
        />
      ))}
    </div>
  );
}

// Componente individual de Toast
function ToastNotification({ notification, onClose }) {
  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border-l-4 border-blue-500 flex items-start"
      role="alert"
    >
      <img 
        src={notification.senderAvatar} 
        alt={notification.senderName}
        className="w-10 h-10 rounded-full mr-3"
      />
      <div className="flex-1">
        <h3 className="font-medium text-gray-900 dark:text-white">
          {notification.senderName}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {notification.content}
        </p>
      </div>
      <button 
        onClick={onClose}
        className="ml-2 text-gray-400 hover:text-gray-500"
        aria-label="Cerrar"
      >
        &times;
      </button>
    </div>
  );
}