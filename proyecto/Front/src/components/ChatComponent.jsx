import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';
import { FaPaperPlane, FaUserCircle, FaArrowLeft, FaSearch } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { jwtDecode } from 'jwt-decode';
import { useLocation } from 'react-router-dom';

/**
 * Configuración de temas para el chat
 * Define los colores y estilos para el modo claro y oscuro
 */
const themes = {
  light: {
    colors: {
      primary: 'bg-white',
      secondary: 'bg-gray-50',
      text: 'text-gray-900',
      input: 'bg-gray-50',
      message: {
        own: 'bg-blue-500 text-white',
        other: 'bg-gray-100 text-gray-800'
      },
      emptyState: 'text-gray-500',
      border: 'border-gray-200',
      icon: 'text-gray-500'
    },
    selectedUser: 'bg-blue-100'
  },
  dark: {
    colors: {
      primary: 'bg-gray-900',
      secondary: 'bg-gray-800',
      text: 'text-gray-100',
      input: 'bg-gray-700',
      message: {
        own: 'bg-blue-600 text-white',
        other: 'bg-gray-700 text-gray-100'
      },
      emptyState: 'text-gray-400',
      border: 'border-gray-700',
      icon: 'text-gray-400'
    },
    selectedUser: 'bg-blue-900'
  }
};

/**
 * Componente principal de chat
 * @param {Object} props - Propiedades del componente
 * @param {string} [props.accentColor='blue'] - Color de acento
 * @param {string} [props.apiBaseUrl='http://localhost:8080/api'] - URL base de la API
 * @param {string} [props.websocketUrl='http://localhost:8080/ws'] - URL del WebSocket
 * @param {Function} [props.onChatOpen] - Callback al abrir chat
 * @param {Function} [props.onChatClose] - Callback al cerrar chat
 */
const ChatComponent = ({
  accentColor = 'blue',
  apiBaseUrl = 'http://localhost:8080/api',
  websocketUrl = 'http://localhost:8080/ws',
  onChatOpen,
  onChatClose
  
}) => {
  // Obtener el tema del contexto
  const { theme } = useTheme();
  
  // Obtener el ID del usuario actual desde el token (similar a Profile)
  const [currentUserId, setCurrentUserId] = useState(null);


  
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUserId(decoded.sub);
        console.log('CurrentUserId obtenido del token:', decoded.sub);
      } catch (error) {
        console.error('Error al decodificar el token:', error);
      }
    }
  }, []);
  

  // Referencias
  const stompClientRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatInputContainerRef = useRef(null);

  // Estados
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [followedUsers, setFollowedUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showChatList, setShowChatList] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [isLoading, setIsLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const location = useLocation();
  const { state } = location;

  // Obtener estilos del tema actual
  const currentTheme = themes[theme];
  const buttonClasses = `ml-3 w-10 h-10 flex items-center justify-center rounded-full text-white
                        ${theme === 'light' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'} 
                        transition-colors disabled:opacity-50`;

  // Función para desplazarse al final de los mensajes
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, []);

  // Efecto para manejar el teclado en móviles
  useEffect(() => {
    const isMobileView = window.matchMedia('(max-width: 767px)').matches;
    if (!isMobileView || !selectedUser) {
      setKeyboardHeight(0);
      return;
    }

    const adjustForKeyboard = () => {
      const visualViewportHeight = window.visualViewport?.height || window.innerHeight;
      const currentKeyboardHeight = window.innerHeight - visualViewportHeight;
      setKeyboardHeight(currentKeyboardHeight > 0 ? currentKeyboardHeight : 0);
      scrollToBottom();
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', adjustForKeyboard);
      adjustForKeyboard();
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', adjustForKeyboard);
      }
    };
  }, [selectedUser, showChatList, scrollToBottom]);

  // Función para obtener usuarios seguidos (following)
  const fetchFollowedUsers = useCallback(async () => {
    if (!currentUserId) {
      console.warn('No hay currentUserId, no se pueden cargar usuarios seguidos');
      setFollowedUsers([]);
      return;
    }

    setIsLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        console.warn('No hay token JWT');
        setFollowedUsers([]);
        return;
      }

      console.log(`Obteniendo usuarios seguidos para userId: ${currentUserId}`);
      const response = await axios.get(`${apiBaseUrl}/follow/${currentUserId}/following`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Usuarios seguidos recibidos:", response.data);
      setFollowedUsers(response.data);
    } catch (error) {
      console.error('Error al cargar usuarios seguidos:', error.response?.data || error.message);
      setFollowedUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId, apiBaseUrl]);

  // Función para obtener historial de mensajes
  const fetchMessagesHistory = useCallback(async (user1Id, user2Id) => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) throw new Error('No hay token JWT');

      const response = await axios.get(
        `${apiBaseUrl}/messages/conversation/${user1Id}/${user2Id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setMessages(response.data);
      scrollToBottom();
    } catch (error) {
      console.error('Error al cargar mensajes:', error.response?.data || error.message);
      setMessages([]);
    }
  }, [apiBaseUrl, scrollToBottom]);

  // Efecto para cargar usuarios seguidos cuando cambia currentUserId
  useEffect(() => {
    fetchFollowedUsers();
  }, [fetchFollowedUsers]);

  // Efecto para manejar conexión WebSocket
  useEffect(() => {
    if (!currentUserId || !selectedUser) {
      setMessages([]);
      if (stompClientRef.current?.active) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
        setConnectionStatus('disconnected');
      }
      return;
    }

    setConnectionStatus('connecting');
    const client = new Client({
      webSocketFactory: () => new SockJS(websocketUrl),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => console.log('[WebSocket]', str),
      onConnect: () => {
        setConnectionStatus('connected');
        stompClientRef.current = client;

        client.subscribe(`/user/${currentUserId}/queue/messages`, (message) => {
          const receivedMessage = JSON.parse(message.body);
          console.log('Mensaje recibido:', receivedMessage);

          setMessages(prev => {
            const filtered = prev.filter(m => !m.isTemp || m.tempId !== receivedMessage.tempId);
            return [...filtered, receivedMessage];
          });
          scrollToBottom();
        });

        fetchMessagesHistory(currentUserId, selectedUser.id);
      },
      onDisconnect: () => {
        setConnectionStatus('disconnected');
      },
      onStompError: (frame) => {
        console.error('Error STOMP:', frame.headers['message']);
        setConnectionStatus('error');
      },
      onWebSocketError: (error) => {
        console.error('Error WebSocket:', error);
        setConnectionStatus('error');
      }
    });

    client.activate();

    return () => {
      if (client.connected) {
        client.deactivate();
      }
    };
  }, [currentUserId, selectedUser, websocketUrl, apiBaseUrl, fetchMessagesHistory]);

  // Efecto para scroll al final de los mensajes
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Función para enviar mensaje
  const sendMessage = () => {
    if (!newMessage.trim() || !selectedUser) return;

    const tempId = Date.now();
    const tempMessage = {
      tempId,
      sender: { id: currentUserId },
      receiver: { id: selectedUser.id },
      content: newMessage.trim(),
      sentAt: new Date().toISOString(),
      isTemp: true
    };

    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
    scrollToBottom();

    if (stompClientRef.current?.active) {
      const messageToSend = {
        senderId: currentUserId,
        receiverId: selectedUser.id,
        content: newMessage.trim(),
        tempId
      };

      stompClientRef.current.publish({
        destination: "/app/chat.sendMessage",
        body: JSON.stringify(messageToSend),
        headers: {
          'content-type': 'application/json'
        }
      });
    } else {
      console.error('No hay conexión STOMP activa');
      setConnectionStatus('error');
    }
  };

  // Manejar selección de usuario
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setShowChatList(false);
    if (typeof onChatOpen === 'function') {
      onChatOpen();
    }
  };

  // Manejar volver a la lista
  const handleBackToList = () => {
    setSelectedUser(null);
    setShowChatList(true);
    setKeyboardHeight(0);
    if (typeof onChatClose === 'function') {
      onChatClose();
    }
  };

  // Filtrar usuarios por término de búsqueda
  const filteredUsers = followedUsers.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Componente de burbuja de mensaje
  const MessageBubble = ({ message, isOwn }) => {
    const messageStyle = isOwn ? currentTheme.colors.message.own : currentTheme.colors.message.other;
    const sentAt = message.sentAt ? new Date(message.sentAt) : null;

    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} px-[8px] mb-[2px]`}>
        <div
          className={`max-w-[80%] min-w-[48px] p-[6px_7px_5px_9px] rounded-[7.5px] ${messageStyle} relative`}
          style={{
            wordBreak: 'break-word',
            overflowWrap: 'break-word'
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
              <span className={`text-[12px] ${isOwn ? 'text-white/80' : (theme === 'light' ? 'text-gray-500' : 'text-gray-300')}`}>
                ✓✓
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };


  // Efecto para manejar la apertura automática
  useEffect(() => {
    if (location.state?.autoOpenChat && location.state?.targetUser) {
      setSelectedUser(location.state.targetUser);
      setShowChatList(false);
      onChatOpen(); // Oculta las barras de navegación
      
      // Limpiar el estado
      window.history.replaceState({}, document.title);
      
      // Scroll al final y focus en el input
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView();
        document.getElementById('message-input')?.focus();
      }, 100);
    }

    return () => {
      onChatClose(); // Asegura que las barras vuelvan al salir
    };
  }, [location.state]);
  
  return (
    <div className={`flex flex-col w-full max-w-full mx-auto rounded-none shadow-none overflow-hidden
                     ${currentTheme.colors.primary} ${currentTheme.colors.text}
                     ${selectedUser && !showChatList ? 'fixed inset-0 h-screen md:static md:h-full md:inset-auto' : 'h-full'}
                     md:h-[calc(100vh-65px)] md:max-w-7xl md:mx-auto md:shadow-xl
                     lg:h-[calc(100vh-65px)]`}>

      <div className="flex flex-1">
        {/* Panel lateral - Lista de chats */}
        <div className={`w-full flex-col
                         ${showChatList ? 'flex' : 'hidden'}
                         md:w-80 lg:w-96 md:min-w-[280px] md:border-r ${currentTheme.colors.border} md:flex`}>
          {/* Cabecera del panel de chats */}
          <div className={`p-4 border-b ${currentTheme.colors.border} ${theme === 'light' ? 'bg-blue-500' : 'bg-blue-600'} text-white`}>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Mensajes</h2>
            </div>
          </div>
          
          {/* Barra de búsqueda de chats */}
          <div className={`p-3 border-b ${currentTheme.colors.border}`}>
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar chats..."
                className={`w-full p-2 pl-10 rounded-lg ${currentTheme.colors.input} ${currentTheme.colors.text}
                            placeholder-${theme === 'light' ? 'gray-500' : 'gray-400'} focus:outline-none focus:ring-2 ${theme === 'light' ? 'focus:ring-blue-500' : 'focus:ring-blue-600'}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${currentTheme.colors.icon}`} />
            </div>
          </div>
          
          {/* Lista de usuarios seguidos */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className={`animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 ${theme === 'light' ? 'border-blue-500' : 'border-blue-400'}`}></div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center h-full p-4">
                <p className={currentTheme.colors.emptyState}>
                  {searchTerm ? 'No se encontraron chats' : 'No tienes chats disponibles'}
                </p>
              </div>
            ) : (
              <ul>
                {filteredUsers.map(user => (
                  <li
                    key={user.id}
                    className={`flex items-center p-3 border-b ${currentTheme.colors.border} cursor-pointer transition-colors duration-200
                                ${selectedUser?.id === user.id ? `${currentTheme.selectedUser} border-l-4 ${theme === 'light' ? 'border-blue-500' : 'border-blue-400'}` :
                                `hover:${theme === 'light' ? 'bg-gray-50' : 'bg-gray-800'}`}`}
                    onClick={() => handleSelectUser(user)}
                  >
                    {user.imageUrl ? (
                      <img
                        src={user.imageUrl}
                        alt={user.username}
                        className="w-12 h-12 rounded-full object-cover mr-3"
                      />
                    ) : (
                      <FaUserCircle className={`w-12 h-12 ${currentTheme.colors.icon} mr-3`} />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{user.username}</h4>
                      <p className={`text-xs ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'} truncate`}>
                        {user.lastMessage || 'Nuevo chat'}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Área de chat principal */}
        <div className={`flex-1 flex flex-col
                         ${selectedUser && !showChatList ? 'flex' : 'hidden'}
                         md:flex`}>
          {selectedUser ? (
            <>
              {/* Cabecera del chat actual */}
              <div className={`p-3 border-b ${currentTheme.colors.border} flex items-center ${theme === 'light' ? 'bg-blue-500' : 'bg-blue-600'} text-white`}>
                <button
                  className="md:hidden mr-2 p-1 rounded-full hover:bg-white/10"
                  onClick={handleBackToList}
                >
                  <FaArrowLeft size={18} />
                </button>
                {selectedUser.imageUrl ? (
                  <img
                    src={selectedUser.imageUrl}
                    alt={selectedUser.username}
                    className="w-10 h-10 rounded-full mr-3 border-2 border-white object-cover"
                  />
                ) : (
                  <FaUserCircle className="w-10 h-10 text-white mr-3" />
                )}
                <div className="flex-1">
                  <h3 className="font-bold">{selectedUser.username}</h3>
                  <p className="text-xs opacity-80">
                    {connectionStatus === 'connected' ? 'En línea' : connectionStatus === 'connecting' ? 'Conectando...' : 'Desconectado'}
                  </p>
                </div>
              </div>

              {/* Área de mensajes */}
              <div
                className="flex-1 p-4 overflow-y-auto flex flex-col gap-3"
                style={{
                  backgroundColor: theme === 'dark' ? '#1a202c' : '#ffffff',
                  backgroundImage: theme === 'light'
                    ? 'linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9)), url("https://web.whatsapp.com/img/bg-chat-tile-light_a4be512e7195b6b733d9110b408f075d.png")'
                    : 'linear-gradient(rgba(26, 32, 44, 0.9), rgba(26, 32, 44, 0.9)), url("https://web.whatsapp.com/img/bg-chat-tile-dark_04fcacde539c58cca6745483d4858c52.png")',
                  backgroundSize: '200px 200px',
                  backgroundRepeat: 'repeat',
                  paddingBottom: `${keyboardHeight + (keyboardHeight > 0 ? 10 : 20)}px`
                }}
              >
                {messages.length === 0 ? (
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
                  messages.map((message) => (
                    <MessageBubble
                      key={message.id || message.tempId}
                      message={message}
                      isOwn={message.sender.id === currentUserId}
                    />
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input para enviar mensajes */}
              <div
                ref={chatInputContainerRef}
                className={`p-3 border-t ${currentTheme.colors.border} ${currentTheme.colors.secondary}
                            fixed bottom-3 w-full md:relative md:w-auto`}
                style={{
                  paddingBottom: `${keyboardHeight > 0 ? keyboardHeight : 0}px`,
                  transition: 'padding-bottom 0.2s ease-out',
                }}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    className={`flex-1 p-3 rounded-full outline-none focus:ring-2 ${theme === 'light' ? 'focus:ring-blue-500' : 'focus:ring-blue-600'}
                                ${currentTheme.colors.input} ${currentTheme.colors.text} placeholder-${theme === 'light' ? 'gray-500' : 'gray-400'}`}
                    placeholder="Escribe un mensaje..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || connectionStatus !== 'connected'}
                    className={buttonClasses}
                  >
                    <FaPaperPlane size={16} />
                  </button>
                </div>
              </div>
            </>
          ) : (
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