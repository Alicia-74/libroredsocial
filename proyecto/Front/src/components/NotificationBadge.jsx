import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const NotificationBadge = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.id) return;

    const fetchUnread = async () => {
      try {
        const res = await axios.get(`/api/messages/unread-count/${user.id}`);
        setUnreadCount(res.data.unreadCount);
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    };

    fetchUnread();
    
    // Opcional: Configurar WebSocket para actualizaciones en tiempo real
    const ws = new WebSocket(`ws://tu-backend/updates`);
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'unread_update') {
        setUnreadCount(data.count);
      }
    };

    return () => ws.close();
  }, [user]);

  return (
    <div className="relative">
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {unreadCount}
        </span>
      )}
    </div>
  );
};

export default NotificationBadge;