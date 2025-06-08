import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';
import { FaPaperPlane, FaUserCircle, FaArrowLeft, FaSearch } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext'; // Asumo que tienes un ThemeContext
import { jwtDecode } from 'jwt-decode'; // Para decodificar el token JWT
import { useLocation } from 'react-router-dom'; // Para obtener el estado de la ubicación

//definición de temas:
const themes = {
  light: {
    colors: {
      primary: 'bg-white',
      secondary: 'bg-gray-100',
      border: 'border-gray-200',
      text: 'text-gray-900',
      input: 'bg-white border border-gray-300',
      icon: 'text-gray-500',
      selectedUser: 'bg-blue-50',
      message: {
        own: 'bg-blue-500 text-white',
        other: 'bg-gray-200 text-gray-900',
      },
      emptyState: 'text-gray-600'
    },
  },
  dark: {
    colors: {
      primary: 'bg-gray-900',
      secondary: 'bg-gray-800',
      border: 'border-gray-700',
      text: 'text-gray-100',
      input: 'bg-gray-700 border border-gray-600',
      icon: 'text-gray-400',
      selectedUser: 'bg-gray-700',
      message: {
        own: 'bg-blue-600 text-white',
        other: 'bg-gray-700 text-gray-100',
      },
      emptyState: 'text-gray-400'
    },
  },
};

// Altura del navbar inferior, ajusta si es necesario (ej: 56px para h-14, 64px para h-16)
const NAVBAR_HEIGHT = 56; 
const API_URL = process.env.REACT_APP_API_URL;


const ChatComponent = ({
  accentColor = 'blue', // Color de acento para algunos elementos (puedes usarlo con Tailwind)
  apiBaseUrl = `${API_URL}/api`, // URL base de tu API REST
  websocketUrl = `${API_URL}/ws`, // URL base para la conexión WebSocket
  onChatOpen, // Callback cuando se abre un chat individual
  onChatClose // Callback cuando se cierra un chat individual (vuelve a la lista)
}) => {
  const { theme } = useTheme(); // Obtiene el tema actual (light/dark)
  const [currentUserId, setCurrentUserId] = useState(null); // ID del usuario logueado
  const [isCurrentUserIdLoaded, setIsCurrentUserIdLoaded] = useState(false); // Bandera para saber si el ID ya se cargó

  // Referencias para el cliente STOMP y para el scroll de mensajes
  const stompClientRef = useRef(null); // Para la instancia del cliente STOMP WebSocket
  const messagesEndRef = useRef(null); // Para hacer scroll automático al final de los mensajes

  // Estados principales del componente
  const [messages, setMessages] = useState([]); // Almacena la lista de mensajes en el chat activo
  const [newMessage, setNewMessage] = useState(''); // Contenido del nuevo mensaje a enviar
  const [chatUsers, setChatUsers] = useState([]); // Lista de usuarios con los que el actual puede chatear
  const [selectedUser, setSelectedUser] = useState(null); // El usuario con el que se está chateando actualmente
  const [searchTerm, setSearchTerm] = useState(''); // Término de búsqueda para filtrar usuarios en la lista de chats
  const [showChatList, setShowChatList] = useState(true); // Controla la visibilidad de la lista de chats (responsive)
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // Estado de la conexión WebSocket (connected, disconnected, error)
  const [isLoading, setIsLoading] = useState(false); // Para mostrar un spinner mientras se cargan los usuarios
  const location = useLocation(); // Hook de React Router para acceder a la URL y su estado
  const { state } = location; // Por si necesitas pasar algún estado al componente via navegación

  // Estados para notificaciones de mensajes no leídos
  // unreadMessages: Objeto para indicar si un usuario tiene mensajes no leídos (booleano)
  const [unreadMessages, setUnreadMessages] = useState({}); 
  // unreadCounts: Objeto para almacenar el conteo exacto de mensajes no leídos por cada usuario
  const [unreadCounts, setUnreadCounts] = useState({});   
  const [inputFocused, setInputFocused] = useState(false);

  
  // Obtiene la configuración de colores del tema actual
  const currentTheme = themes[theme];
  // Clases CSS para el botón de enviar mensaje, cambia según el tema
  const buttonClasses = `ml-3 w-10 h-10 flex items-center justify-center rounded-full text-white
                          ${theme === 'light' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'}   
                          transition-colors disabled:opacity-50`;

  // --- useEffect para obtener el ID del usuario actual desde el token JWT ---
  // Se ejecuta una vez al montar el componente para obtener el ID del usuario logueado.
  // Esto es crucial para suscribirse a los topics de WebSocket específicos del usuario.
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUserId(decoded.sub); // 'sub' suele contener el ID del usuario en JWT
        setIsCurrentUserIdLoaded(true); // Marca que el ID ya está cargado
      } catch (error) {
        console.error('Error al decodificar el token:', error);
      }
    }
  }, []); // El array vacío asegura que se ejecuta solo una vez al montar

  // --- Función para desplazarse al final de los mensajes ---
  // Usa useCallback para memoizar la función y evitar re-creaciones innecesarias,
  // lo que es bueno para el rendimiento si se pasa como dependencia a otros hooks.
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, []);

  // --- Función para obtener la lista de usuarios con los que el usuario actual puede chatear ---
  // Actualmente, obtiene "seguidos" y "seguidores" para crear la lista de chat.
  const fetchChatUsers = useCallback(async () => {
    // Si el ID del usuario no está cargado o no existe, no se hace la petición.
    if (!isCurrentUserIdLoaded || !currentUserId) {
      setChatUsers([]); // Limpia la lista de usuarios si no hay ID
      return;
    }

    setIsLoading(true); // Activa el estado de carga
    try {
      const token = sessionStorage.getItem('token');
      if (!token) { // Si no hay token, no se pueden obtener los usuarios
        setChatUsers([]);
        return;
      }

      // Hace dos peticiones HTTP en paralelo para obtener seguidos y seguidores
      const [followingResponse, followersResponse] = await Promise.all([
        axios.get(`${apiBaseUrl}/follow/${currentUserId}/following`, {
          headers: {   
            'Authorization': `Bearer ${token}`, // Envía el token para autorización
            'Content-Type': 'application/json'
          }
        }),
        axios.get(`${apiBaseUrl}/follow/${currentUserId}/followers`, {
          headers: {   
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      // Combina las listas de seguidos y seguidores
      const combinedUsers = [...(Array.isArray(followingResponse.data) ? followingResponse.data : []),
                             ...(Array.isArray(followersResponse.data) ? followersResponse.data : [])];
      
      // Elimina usuarios duplicados usando un Map para mantener la unicidad por ID
      const uniqueUsers = Array.from(new Map(combinedUsers.filter(user => user && user.id).map(user => [user.id, user])).values());
      setChatUsers(Array.from(uniqueUsers)); // Actualiza el estado con la lista de usuarios únicos
      fetchInitialUnreadCounts(uniqueUsers);// Llama a la función para obtener conteos iniciales de mensajes no leídos
    } catch (error) {
      console.error('Error al cargar usuarios de chat:', error);
      setChatUsers([]); // En caso de error, la lista de usuarios se vacía
    } finally {
      setIsLoading(false); // Desactiva el estado de carga
    }
  }, [currentUserId, isCurrentUserIdLoaded, apiBaseUrl]); // Dependencias: se re-crea si cambian estos valores

  // --- Función para obtener el historial de mensajes entre dos usuarios ---
  const fetchMessagesHistory = useCallback(async (user1Id, user2Id) => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) throw new Error('No hay token JWT'); // Si no hay token, lanza un error

      const response = await axios.get(
        `${apiBaseUrl}/messages/conversation/${user1Id}/${user2Id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setMessages(response.data); // Actualiza los mensajes con el historial
      scrollToBottom(); // Desplaza al final para ver los últimos mensajes
    } catch (error) {
      console.error('Error al cargar mensajes:', error);
      setMessages([]); // En caso de error, se vacían los mensajes
    }
  }, [apiBaseUrl, scrollToBottom]); // Dependencias: se re-crea si cambian estos valores

  // --- Función para marcar mensajes como leídos en el backend y actualizar el estado local ---
  const markMessagesAsRead = useCallback(async (senderId, receiverId) => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) return; // Si no hay token, no se puede hacer la petición

      // Petición POST al backend para marcar la conversación como leída
      await axios.post(`${apiBaseUrl}/messages/mark-as-read`, null, {
        params: {
          senderId: senderId,
          receiverId: receiverId
        },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Actualizar estado local: marcar los mensajes de ese chat como 'read'
      setMessages(prev => 
        prev.map(msg => 
          msg.senderId === senderId && msg.receiverId === receiverId && msg.status !== 'read' 
            ? { ...msg, status: 'read' } // Cambia el estado a 'read'
            : msg
        )
      );

      // Eliminar el indicador de unreadMessages para el senderId (visual)
      setUnreadMessages(prev => {
        const updated = { ...prev };
        delete updated[senderId]; // Quita la bandera de no leído para este usuario
        return updated;
      });

      // Poner el conteo de no leídos a 0 para el senderId (numérico)
      setUnreadCounts(prev => ({
        ...prev,
        [senderId]: 0 // Restablece el conteo a 0 para el usuario
      }));

    } catch (error) {
      console.error('Error marcando mensajes como leídos:', error);
    }
  }, [apiBaseUrl]); // Dependencias: se re-crea si cambian estos valores

  // --- Función para obtener los conteos iniciales de mensajes no leídos (HTTP) ---
  // Se usa para cargar los conteos al inicio, antes de que las actualizaciones por WebSocket lleguen.
  const fetchInitialUnreadCounts = useCallback(async (users) => {
    const usersToCheck = users || chatUsers;
     console.log('DEBUG: fetchInitialUnreadCounts called', { currentUserId, chatUsersLength: chatUsers.length });
    
    if (!currentUserId || !usersToCheck.length) return;

    try {
      const token = sessionStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${apiBaseUrl}/messages/unread-counts-by-sender/${currentUserId}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('DEBUG: unread-counts response', response.data);


      if (response.data) {
        // Convertir keys de string a number (ya que el backend puede devolverlas como strings)
        const counts = {};
        Object.keys(response.data).forEach(key => {
           counts[Number(key)] = response.data[key];
        });

        setUnreadCounts(counts);

        console.log('Conteos iniciales de mensajes no leídos:', counts);
        
        // Actualizar las banderas booleanas
        const flags = {};
        Object.keys(counts).forEach(senderId => {
          flags[senderId] = counts[senderId] > 0;
        });
        setUnreadMessages(flags);
      }
    } catch (error) {
      console.error("Error fetching initial unread messages:", error);
    }
  }, [currentUserId, apiBaseUrl]);

  // --- useEffect para cargar los usuarios de chat cuando el ID del usuario actual está cargado ---
  useEffect(() => {
    if (isCurrentUserIdLoaded) {
      fetchChatUsers(); // Llama a la función para cargar usuarios
    }
  }, [isCurrentUserIdLoaded, fetchChatUsers]); // Se re-ejecuta si cambian estas dependencias

  // --- useEffect para configurar la conexión WebSocket y sus suscripciones ---
  // Este es el corazón de la funcionalidad de tiempo real.
  useEffect(() => {
    // Si el ID del usuario no está cargado o no existe, no se conecta el WebSocket.
    if (!isCurrentUserIdLoaded || currentUserId === null) {
        // También asegura que si el usuario se desloguea, la conexión se desactive.
        if (stompClientRef.current && stompClientRef.current.connected) {
            stompClientRef.current.deactivate();
        }
        return;
    }

    // Crea una nueva instancia del cliente STOMP
    const client = new Client({
        webSocketFactory: () => new SockJS(websocketUrl), // Usa SockJS para compatibilidad de navegadores
        reconnectDelay: 5000, // Reintenta la conexión cada 5 segundos si se pierde
        heartbeatIncoming: 4000, // Intervalo para latidos entrantes
        heartbeatOutgoing: 4000, // Intervalo para latidos salientes
        debug: (str) => console.log('[ChatComponent WebSocket]', str), // Para ver logs de la conexión

        // Callback cuando la conexión WebSocket se establece correctamente
        onConnect: () => {
            setConnectionStatus('connected'); // Actualiza el estado de la conexión
            stompClientRef.current = client; // Guarda la instancia del cliente STOMP

            // --- Suscripción 1: Para recibir mensajes nuevos dirigidos a este usuario ---
            client.subscribe(`/user/${currentUserId}/queue/messages`, (message) => {
                const receivedMessage = JSON.parse(message.body); // Parsea el mensaje JSON

                console.log('Mensaje de chat recibido:', receivedMessage);

                // Si el mensaje es para el usuario actual (yo soy el receptor)
                if (receivedMessage.receiverId === currentUserId) {
                    // Actualizar el conteo de no leídos para el remitente (quien me envió el mensaje)
                    setUnreadCounts(prev => ({
                        ...prev,
                        [receivedMessage.senderId]: (prev[receivedMessage.senderId] || 0) + 1 // Incrementa el conteo
                    }));
                    setUnreadMessages(prev => ({
                        ...prev,
                        [receivedMessage.senderId]: true // Marca que este remitente tiene mensajes no leídos
                    }));
                }

                // Si el mensaje es del chat actualmente seleccionado (el que tengo abierto)
                if (selectedUser && selectedUser.id === receivedMessage.senderId) {
                    setMessages(prev => {
                        // Filtra mensajes temporales (si usas optimismo UI) para evitar duplicados
                        const filtered = prev.filter(m => !m.isTemp || m.tempId !== receivedMessage.tempId);
                        return [...filtered, { ...receivedMessage, status: 'read' }]; // Añade el mensaje y asume que se lee
                    });
                    // Si estás en el chat con ese usuario, marca los mensajes como leídos en el backend
                    markMessagesAsRead(receivedMessage.senderId, currentUserId);
                } else {
                    // Si no es el chat seleccionado, simplemente agregarlo (para cuando se abra)
                    setMessages(prev => {
                        const filtered = prev.filter(m => !m.isTemp || m.tempId !== receivedMessage.tempId);
                        return [...filtered, receivedMessage];
                    });
                }
                scrollToBottom(); // Desplaza al final para ver el nuevo mensaje
            });

            // --- Suscripción 2: Para recibir actualizaciones de conteo no leído (desde el backend) ---
            client.subscribe(`/user/${currentUserId}/queue/unread-count`, (message) => {
                const data = JSON.parse(message.body);
                // Si es un objeto con varios conteos (lo normal)
                if (typeof data === 'object' && !Array.isArray(data)) {
                    setUnreadCounts(data);
                    const flags = {};
                    Object.keys(data).forEach(senderId => {
                        flags[senderId] = data[senderId] > 0;
                    });
                    setUnreadMessages(flags);
                }
                // Si es un solo conteo (por compatibilidad)
                else if (data.senderId && data.unreadCount !== undefined) {
                    setUnreadCounts(prev => ({
                        ...prev,
                        [data.senderId]: data.unreadCount
                    }));
                    setUnreadMessages(prev => ({
                        ...prev,
                        [data.senderId]: data.unreadCount > 0
                    }));
                }
            });

            // --- ¡NUEVA Suscripción 3! Para recibir notificaciones de estado de tus propios mensajes ---
            client.subscribe(`/user/${currentUserId}/queue/message-status-update`, (message) => {
                const data = JSON.parse(message.body);
                console.log('Actualización de estado de mensaje recibida:', data);

                if (data.type === 'readConfirmation' && data.readerId) {
                    const readerId = data.readerId; // El ID del usuario que leyó tus mensajes (es decir, el otro usuario en el chat)
                    const senderOfReadMessages = data.senderOfReadMessages || currentUserId; // El ID de quien envió los mensajes que fueron leídos (debería ser tú)

                    setMessages(prevMessages =>
                        prevMessages.map(msg => {
                            // Si el mensaje lo enviaste tú (currentUserId)
                            // Y el receptor de ese mensaje fue el 'readerId' (el otro usuario que lo leyó)
                            // Y el estado del mensaje no es 'read' (para evitar actualizaciones redundantes)
                            if (msg.senderId === Number(senderOfReadMessages) && msg.receiverId === Number(readerId) && msg.status !== 'read') {
                                console.log(`Marcando mensaje propio como leído: ${msg.content}`);
                                return { ...msg, status: 'read' };
                            }
                            return msg;
                        })
                    );
                }
            });

            // Cargar historial de mensajes si hay un usuario seleccionado al conectar
            // (Esto es útil si la página se recarga mientras un chat estaba abierto)
            if (selectedUser) {
                fetchMessagesHistory(currentUserId, selectedUser.id);
            }
        }, // Cierra el `onConnect` callback aquí.
        // Callback cuando la conexión WebSocket se desconecta
        onDisconnect: () => {
            setConnectionStatus('disconnected');
            console.log('ChatComponent WebSocket desconectado.');
        },
        // Callback para errores STOMP
        onStompError: (frame) => {
            console.error('Error STOMP en ChatComponent:', frame);
            setConnectionStatus('error');
        }
    });

    
    client.activate(); // Activa la conexión WebSocket

    // Función de limpieza: se ejecuta cuando el componente se desmonta o las dependencias cambian.
    // Asegura que la conexión WebSocket se cierre correctamente.
    return () => {
        if (client.connected) {
            client.deactivate();
            console.log('ChatComponent WebSocket desactivado en limpieza.');
        }
    };
}, [currentUserId, isCurrentUserIdLoaded, selectedUser, websocketUrl, fetchMessagesHistory, scrollToBottom, markMessagesAsRead]); // Dependencias para re-ejecutar el efecto
  // --- useEffect para manejar la selección de un usuario de chat ---
  // Se encarga de cargar el historial y marcar mensajes como leídos cuando se selecciona un chat.
    
  
  useEffect(() => {
    if (selectedUser && currentUserId) {
      // Marcar mensajes como leídos cuando se selecciona un usuario (enviará petición al backend)
      markMessagesAsRead(selectedUser.id, currentUserId);
      // Cargar historial de mensajes para el chat seleccionado
      fetchMessagesHistory(currentUserId, selectedUser.id);
    }
  }, [selectedUser, currentUserId, markMessagesAsRead, fetchMessagesHistory]); // Dependencias

  
  
  // --- useEffect para hacer scroll al final cada vez que los mensajes cambian ---
  useEffect(() => {
  const container = messagesEndRef.current?.parentNode;
  if (!container) return;

  // ¿Está el usuario cerca del fondo? (por ejemplo, a menos de 100px)
  const isNearBottom =
    container.scrollHeight - container.scrollTop - container.clientHeight < 100;

  if (isNearBottom || selectedUser) {
    scrollToBottom();
  }
  // Si NO está cerca del fondo, no hacemos scroll automático
}, [messages, selectedUser, scrollToBottom]);




  // --- useEffect para cargar los conteos iniciales de no leídos de la lista de chats ---
  // Se ejecuta cuando el ID del usuario está cargado y la lista de chatUsers se ha poblado.
  useEffect(() => {
    if (isCurrentUserIdLoaded && chatUsers.length > 0) {
      console.log('DEBUG: useEffect for fetchInitialUnreadCounts', { isCurrentUserIdLoaded, chatUsersLength: chatUsers.length });
      fetchInitialUnreadCounts();
      // IMPORTANTE: Se elimina el setInterval. Las actualizaciones ahora son vía WebSocket.
      // const interval = setInterval(fetchInitialUnreadCounts, 10000); 
      // return () => clearInterval(interval); 
    }
  }, [isCurrentUserIdLoaded, chatUsers, fetchInitialUnreadCounts]); // Dependencias

// --- Efecto combinado para todos los pollings ---
  useEffect(() => {
    if (!currentUserId || !isCurrentUserIdLoaded) return;

    // 1. Polling para historial de mensajes (solo si hay un chat abierto)
    const messagesInterval = selectedUser && setInterval(() => {
      fetchMessagesHistory(currentUserId, selectedUser.id);
    }, 2000);

    // 2. Polling para marcar como leído (solo si hay un chat abierto)
    const markAsReadInterval = selectedUser && setInterval(() => {
      markMessagesAsRead(selectedUser.id, currentUserId);
    }, 3000);

    // 3. Polling para notificaciones no leídas (siempre activo)
    // const unreadInterval = setInterval(() => {
    //   fetchInitialUnreadCounts();
    // }, 2000);

    return () => {
      messagesInterval && clearInterval(messagesInterval);
      markAsReadInterval && clearInterval(markAsReadInterval);
      // clearInterval(unreadInterval);
    };
  }, [
    currentUserId,
    isCurrentUserIdLoaded,
    selectedUser,
    fetchMessagesHistory,
    markMessagesAsRead,
    fetchInitialUnreadCounts
  ]);

  // --- Función para enviar un mensaje ---
  const sendMessage = () => {
    // Valida que haya mensaje, usuario seleccionado y que el usuario actual esté logueado
    if (!newMessage.trim() || !selectedUser || !currentUserId) return;

    // Crea un mensaje temporal para "optimismo UI" (se muestra antes de la confirmación del servidor)
    const tempId = Date.now();
    const tempMessage = {
      tempId,
      senderId: Number(currentUserId), // Asegura que sea un número si el ID viene como string
      receiverId: selectedUser.id,
      content: newMessage.trim(),
      sentAt: new Date().toISOString(), // Fecha actual
      isTemp: true, // Bandera para identificarlo como temporal
      status: 'sent' // Estado inicial 'sent'
    };

    setMessages(prev => [...prev, tempMessage]); // Añade el mensaje temporal a la lista
    setNewMessage(''); // Limpia el input del mensaje
    scrollToBottom(); // Desplaza al final

    // Si el cliente STOMP está activo, envía el mensaje via WebSocket
    if (stompClientRef.current?.active) {
      const messageToSend = {
        senderId: Number(currentUserId),
        receiverId: selectedUser.id,
        content: newMessage.trim(),
        tempId // Incluye el tempId para que el backend lo devuelva en la confirmación
      };

      stompClientRef.current.publish({
        destination: "/app/chat.sendMessage", // Destination para el controlador del backend
        body: JSON.stringify(messageToSend), // Cuerpo del mensaje en JSON
        headers: {
          'content-type': 'application/json'
        }
      });
    }
  };

  // --- Manejador para seleccionar un usuario de la lista de chats ---
  const handleSelectUser = (user) => {
    if (!user || !user.id) return;

    // Cuando seleccionas un chat, marcas sus mensajes como leídos
    markMessagesAsRead(user.id, currentUserId); // Esto envía la petición al backend

    // Y también actualizas los estados locales de conteo a cero para ese usuario
    setUnreadMessages(prev => {
      const updated = { ...prev };
      delete updated[user.id]; // Elimina la bandera de no leído
      return updated;
    });
    setUnreadCounts(prev => ({
      ...prev,
      [user.id]: 0 // Restablece el conteo a 0
    }));

    setSelectedUser(user); // Establece el usuario seleccionado
    setShowChatList(false); // Oculta la lista de chats y muestra el chat individual
    onChatOpen?.(); // Llama al callback si está definido
  };

  // --- Manejador para volver a la lista de chats (desde el chat individual en móvil) ---
  const handleBackToList = () => {
    setSelectedUser(null); // Deselecciona el usuario
    setShowChatList(true); // Muestra la lista de chats
    if (typeof onChatClose === 'function') {
      onChatClose(); // Llama al callback si está definido
    }
  };

  // Filtrado y ordenamiento de usuarios en la lista de chats
const filteredUsers = chatUsers
  .filter(user => user?.id && user?.username && 
         user.username.toLowerCase().includes(searchTerm.toLowerCase()))
  .map(user => {
    // 1. Filtra los mensajes de ESTA conversación (usando tus nombres de variables)
    const chatMessages = messages.filter(m => 
      (m.sender_id === user.id && m.receiver_id === currentUserId) || 
      (m.receiver_id === user.id && m.sender_id === currentUserId)
    );

    // 2. Encuentra el último mensaje (comparando fecha y hora con `sent_at`)
    const lastMessage = chatMessages.sort((a, b) => {
      return new Date(b.sent_at) - new Date(a.sent_at); // Orden descendente directo
    })[0]; // El primer elemento del array ya ordenado

    return {
      user,
      hasUnread: unreadCounts[user.id] > 0,
      lastMessageTime: lastMessage ? new Date(lastMessage.sent_at) : null
    };
  })
  .sort((a, b) => {
    // PRIORIDAD 1: Chats con mensajes no leídos (primero)
    if (a.hasUnread && !b.hasUnread) return -1;
    if (!a.hasUnread && b.hasUnread) return 1;

    // PRIORIDAD 2: Ordena por fecha y hora del último mensaje (más reciente primero)
    if (a.lastMessageTime && b.lastMessageTime) {
      return b.lastMessageTime.getTime() - a.lastMessageTime.getTime(); // Descendente
    }

    // PRIORIDAD 3: Si solo uno tiene mensajes
    if (a.lastMessageTime) return -1;
    if (b.lastMessageTime) return 1;

    return 0; // Mantener orden si no hay mensajes
  })
  .map(item => item.user);




  // --- Componente de burbuja de mensaje individual ---
  const MessageBubble = ({ message, currentActiveUserId }) => { 
    const isOwn = message.senderId === Number(currentActiveUserId); // Determina si el mensaje es del usuario actual
    // Estilos de la burbuja según si es propio o de otro usuario
    const messageStyle = isOwn ? currentTheme.colors.message.own : currentTheme.colors.message.other;
    // Formatea la hora del mensaje
    const sentAt = message.sentAt ? new Date(message.sentAt) : null;

    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} px-[8px] mb-[2px]`}>
        <div
          className={`max-w-[80%] min-w-[48px] p-[6px_7px_5px_9px] rounded-[7.5px] ${messageStyle} relative`}
          style={{
            wordBreak: 'break-word', // Rompe palabras largas para evitar desbordamiento
            overflowWrap: 'break-word' // Asegura que el texto se envuelva correctamente
          }}
        >
          <p className="whitespace-pre-wrap text-left pr-[54px] text-[14.2px] leading-[19px] mb-[2px]">
            {message.content}
          </p>
          <div className="absolute bottom-[5px] right-[7px] flex items-center h-[15px]">
            {sentAt && (
              <span className={`text-[11px] mr-[3px] ${isOwn ? 'text-white/80' : (theme === 'light' ? 'text-gray-500' : 'text-gray-300')}`}>
                {sentAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            {isOwn && (
              // Indicador de leído (✓✓)
              <span
                className={`text-[12px] font-bold tracking-tighter ${
                  message.status === 'read' // Si el mensaje está marcado como leído
                    ? 'text-lime-300'  // Color lima para leído
                    : theme === 'light'
                    ? 'text-gray-300'     
                    : 'text-gray-400'     
                }`}
              >
                ✓✓
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };



  // Lógica para las clases de altura condicional
  const mainContainerHeightClasses = selectedUser && !showChatList
    ? 'fixed inset-0 h-screen' // Ocupa toda la pantalla cuando hay chat seleccionado en móvil
    : 'h-[75vh] md:h-[89.1vh] lg:h-[89.1vh]'; // Altura normal con padding para el navbar

  // --- Renderizado del componente ChatComponent ---
  return (
    // Contenedor principal: ocupa el alto total disponible menos el navbar de abajo
    // En móvil, cuando hay un chat seleccionado, se convierte en un overlay fixed para toda la pantalla.
    <div className={`flex flex-col
        ${selectedUser && !showChatList && window.innerWidth >= 768 ? 'fixed inset-0 z-20 bg-white dark:bg-gray-900' : ''}
        ${currentTheme.colors.primary} ${currentTheme.colors.text}`}
      style={{
        height: selectedUser && !showChatList && window.innerWidth < 768 ? '100dvh' : undefined,
        minHeight: '100dvh'
      }}
    >


      {/* Este div flex-1 ahora es el que distribuye el espacio horizontalmente*/}
      <div className="flex flex-1 min-h-0">
        {/* Panel lateral - Lista de chats */}
        <div className={`w-full flex-col
                 ${showChatList ? 'flex' : 'hidden'}
                 md:w-80 lg:w-96 md:min-w-[280px] md:border-r ${currentTheme.colors.border} md:flex
                 relative flex flex-col min-h-0`}>

          {/* Cabecera del panel de chats (sticky) */}
          <div className={`sticky top-0 z-10 p-4 border-b ${currentTheme.colors.border} ${theme === 'light' ? 'bg-blue-500' : 'bg-blue-600'} text-white`}>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Mensajes</h2>
            </div>
          </div>
          
          {/* Barra de búsqueda de chats (sticky) */}
          <div className={`sticky top-[56px] z-10 p-3 border-b ${currentTheme.colors.border} ${currentTheme.colors.primary}`}>
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar chats..."
                className={`w-full p-2 pl-10 rounded-lg ${currentTheme.colors.input} ${currentTheme.colors.text}
                            placeholder-${theme === 'light' ? 'gray-500' : 'gray-400'}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${currentTheme.colors.icon}`} />
            </div>
          </div>
          
          {/* Lista de usuarios (con scroll) */}
          <div className="flex-1 overflow-y-auto">
          {isLoading ? ( // Muestra un spinner si está cargando
            <div className="h-full flex items-center justify-center ">
              <div 
                className={`animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 ${
                  theme === 'light' ? 'border-blue-500' : 'border-blue-400'
                }`}
              ></div>
            </div>
          ) : filteredUsers.length === 0 ? ( // Mensaje si no hay chats o la búsqueda no devuelve resultados
            <div className="h-full flex flex-col items-center justify-center p-4">
              <p className={currentTheme.colors.emptyState}>
                {searchTerm ? 'No se encontraron chats' : 'No tienes chats disponibles'}
              </p>
            </div>
          ) : ( // Muestra la lista de usuarios
            <ul className="h-full">
              {filteredUsers.map(user => (
                <li
                  key={user.id}
                  className={`relative flex items-center p-3 border-b ${currentTheme.colors.border} cursor-pointer transition-colors duration-200 ${
                    selectedUser?.id === user.id 
                      ? `${currentTheme.selectedUser} border-l-4 ${
                          theme === 'light' ? 'border-blue-500' : 'border-blue-400'
                        }`
                      : `hover:${theme === 'light' ? 'bg-gray-50' : 'bg-gray-800'}`
                  }`}
                  onClick={() => handleSelectUser(user)}
                >
                  {user.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt={user.username}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover mr-3"
                    />
                  ) : (
                    <FaUserCircle 
                      className={`w-10 h-10 sm:w-12 sm:h-12 ${currentTheme.colors.icon} mr-3`} 
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate text-sm sm:text-base">
                      {user.username}
                    </h4>
                    <p className={`text-xs ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'} truncate`}>
                      {messages.find(m => m.senderId === user.id || m.receiverId === user.id)?.content || 'Nuevo chat'}
                    </p>
                  </div>
                  
                  {/* Notificación de mensajes no leídos - Versión corregida */}
                  {((unreadCounts[user.id] || 0) > 0) && (
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 min-w-[20px] h-[20px] px-1 flex items-center justify-center bg-blue-500 text-white text-xs font-bold rounded-full">
                      {unreadCounts[user.id] > 99 ? '99+' : unreadCounts[user.id]}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
          </div>
        </div>

        {/* Área de chat principal */}
        <div className={`flex-1 flex flex-col
                         ${selectedUser && !showChatList ? 'flex' : 'hidden'} {/* Oculto en móvil si la lista de chats está visible */}
                         md:flex`}> {/* Siempre visible en desktop */}
          {selectedUser ? ( // Si hay un usuario seleccionado, muestra el chat
            <>
              {/* Cabecera del chat actual */}
              <div className={`p-3 border-b ${currentTheme.colors.border} flex items-center ${theme === 'light' ? 'bg-blue-500' : 'bg-blue-600'} text-white`}>
                <button
                  className="md:hidden mr-2 p-1 rounded-full hover:bg-white/10"
                  onClick={handleBackToList} // Botón para volver a la lista (solo en móvil)
                >
                  <FaArrowLeft size={18} />
                </button>
                {selectedUser.imageUrl ? ( // Muestra la imagen de perfil del usuario seleccionado
                  <img
                    src={selectedUser.imageUrl}
                    alt={selectedUser.username}
                    className="w-10 h-10 rounded-full mr-3 border-2 border-white object-cover"
                  />
                ) : ( // O un icono de usuario si no hay imagen
                  <FaUserCircle className="w-10 h-10 text-white mr-3" />
                )}
                <div className="flex-1">
                  <h3 className="font-bold">{selectedUser.username}</h3> {/* Nombre del usuario seleccionado */}
                </div>
              </div>

              {/* Área de mensajes (con scroll) */}
              <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 min-h-0"
                style={{
                  backgroundColor: theme === 'dark' ? '#1a202c' : '#ffffff',
                  backgroundImage: theme === 'light'
                    ? 'linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9)), url("https://web.whatsapp.com/img/bg-chat-tile-light_a4be512e7195b6b733d9110b408f075d.png")'
                    : 'linear-gradient(rgba(26, 32, 44, 0.9), rgba(26, 32, 44, 0.9)), url("https://web.whatsapp.com/img/bg-chat-tile-dark_04fcacde539c58cca6745483d4858c52.png")',
                  backgroundSize: '200px 200px',
                  backgroundRepeat: 'repeat',
                  paddingBottom: window.innerWidth < 768 ? 72 : 24, // Espacio para la barra en móvil
                  transition: 'padding-bottom 0.2s'
                }}
              >

              
                {isCurrentUserIdLoaded && currentUserId !== null && messages.length === 0 ? (
                  // Mensaje si no hay mensajes en la conversación
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <div className={`text-center max-w-md p-6 rounded-lg ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-700'}`}>
                      <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${theme === 'light' ? 'bg-gray-200' : 'bg-gray-600'}`}>
                        <FaUserCircle className={`text-3xl ${currentTheme.colors.icon}`} />
                      </div>
                      <h3 className={`text-xl font-bold mb-2 ${theme === 'light' ? 'text-gray-900' : 'text-gray-100'}`}>Inicia una conversación</h3>
                      <p className={currentTheme.colors.emptyState}>
                        Envía mensajes privados a {selectedUser.username}
                      </p>
                    </div>
                  </div>
                ) : (
                  // Muestra las burbujas de mensajes
                  isCurrentUserIdLoaded && currentUserId !== null ? messages.map((message) => (
                    <MessageBubble
                      key={message.id || message.tempId} // Usa id real o tempId para las claves
                      message={message}
                      currentActiveUserId={currentUserId}  
                    />
                  )) : (
                    // Spinner si aún se está cargando el usuario o mensajes
                    <div className="flex justify-center items-center h-full">
                      <div className={`animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 ${theme === 'light' ? 'border-blue-500' : 'border-blue-400'}`}></div>
                    </div>
                  )
                )}
                <div ref={messagesEndRef} /> {/* Div para el scroll al final */}
              </div>


          {/* Input para enviar mensajes */}
          <div
            className={`
              p-3 border-t ${currentTheme.colors.border} ${currentTheme.colors.secondary}
              w-full z-10  md:static
            `}
            style={{
              maxWidth: '100vw',
              boxSizing: 'border-box',
            }}
          >
            <div className="flex items-center gap-2 w-full">
              <input
                type="text"
                id="message-input"
                className={`flex-1 p-3 rounded-full outline-none focus:ring-2 ${theme === 'light' ? 'focus:ring-blue-500' : 'focus:ring-blue-600'}
                            ${currentTheme.colors.input} ${currentTheme.colors.text} placeholder-${theme === 'light' ? 'gray-500' : 'gray-400'}`}
                placeholder="Escribe un mensaje..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || connectionStatus !== 'connected' || currentUserId === null}
                className={buttonClasses}
              >
                <FaPaperPlane size={16} />
              </button>
            </div>
          </div>
            </>
          ) : ( // Si no hay usuario seleccionado, muestra un mensaje de bienvenida
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className={`text-center max-w-sm p-6 rounded-lg ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-700'}`}>
                <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center ${theme === 'light' ? 'bg-gray-200' : 'bg-gray-600'}`}>
                  <svg className={`w-12 h-12 ${currentTheme.colors.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                  </svg>
                </div>
                <p className={currentTheme.colors.emptyState}>
                  Selecciona un chat para empezar a conversar
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;