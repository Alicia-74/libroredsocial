import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useNotifications } from './ContextNotification';

/**
 * Componente que escucha notificaciones por WebSocket y:
 * 1. Muestra notificaciones nativas del navegador
 * 2. Almacena notificaciones en el contexto para mostrarlas in-app
 */
export default function NotificationListener({ currentUserId }) {
  const stompClientRef = useRef(null);
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (!currentUserId) return; // Solo conectamos si hay usuario

    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      reconnectDelay: 5000, // Reconexión cada 5 segundos si falla
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        console.log("✅ Conectado al servidor WebSocket");

        // Suscripción a cola personalizada del usuario
        client.subscribe(`/user/queue/notifications`, (message) => {
          const notificationData = parseNotification(message);
          handleIncomingNotification(notificationData);
        });
      },

      onDisconnect: () => {
        console.log("🔌 Desconectado del servidor WebSocket");
      },

      onStompError: (frame) => {
        console.error("❌ Error STOMP:", frame.headers['message']);
      }
    });

    stompClientRef.current = client;
    client.activate();

    return () => client.deactivate();
  }, [currentUserId, addNotification]);

  // Parsea y valida la notificación entrante
  const parseNotification = (message) => {
    try {
      const payload = JSON.parse(message.body);
      
      // Validación básica de campos requeridos
      if (!payload.senderId || !payload.content) {
        throw new Error("Notificación inválida: faltan campos requeridos");
      }

      return {
        id: `notif-${Date.now()}`,
        type: payload.type || 'message',
        senderId: payload.senderId,
        senderName: payload.senderName || 'Usuario',
        senderAvatar: payload.senderAvatar || '/default-avatar.png',
        content: payload.content,
        link: payload.link || '/messages',
        metadata: payload.metadata || {}
      };
    } catch (error) {
      console.error("Error al parsear notificación:", error);
      return null;
    }
  };

  // Maneja una notificación entrante
  const handleIncomingNotification = (notificationData) => {
    if (!notificationData) return;

    // 1. Almacena en contexto para UI in-app
    addNotification(notificationData);

    // 2. Muestra notificación nativa (incluso en primer plano)
    showNativeNotification(notificationData);
  };

  // Muestra notificación del sistema optimizada
  const showNativeNotification = (notification) => {
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    // Usamos setTimeout para evitar bloqueo del navegador
    setTimeout(() => {
      try {
        const notif = new Notification(
          `Nuevo mensaje de ${notification.senderName}`,
          {
            body: notification.content,
            icon: notification.senderAvatar,
            image: notification.senderAvatar,
            badge: '/notification-badge.png',
            vibrate: [200, 100, 200],
            tag: notification.id, // Para evitar duplicados
            data: { url: notification.link }
          }
        );

        // Manejo de clic en la notificación
        notif.onclick = () => {
          window.focus();
          window.location.href = notification.link;
          notif.close();
        };

        // Cierre automático después de 10 segundos
        setTimeout(() => notif.close(), 10000);
      } catch (error) {
        console.error("Error al mostrar notificación:", error);
      }
    }, 100); // Pequeño delay para evitar bloqueos
  };

  return null; // Componente no renderiza nada
}