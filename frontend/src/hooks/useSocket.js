import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

/**
 * Hook personalizado para gestionar la conexión Socket.io
 * @param {string} token - Token JWT para autenticación
 */
export const useSocket = (token) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!token) {
      return;
    }

    // Crear conexión Socket.io
    socketRef.current = io(SOCKET_URL, {
      auth: {
        token
      },
      transports: ['websocket', 'polling']
    });

    const socket = socketRef.current;

    // Event: Conexión exitosa
    socket.on('connect', () => {
      console.log('✅ Conectado a Socket.io');
      setIsConnected(true);
    });

    // Event: Desconexión
    socket.on('disconnect', () => {
      console.log('❌ Desconectado de Socket.io');
      setIsConnected(false);
    });

    // Event: Usuarios online
    socket.on('users_online', (userIds) => {
      setOnlineUsers(userIds);
    });

    // Event: Error de conexión
    socket.on('connect_error', (error) => {
      console.error('Error de conexión Socket.io:', error.message);
      setIsConnected(false);
    });

    // Event: Error general
    socket.on('error', (error) => {
      console.error('Error Socket.io:', error.message);
    });

    // Cleanup al desmontar
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [token]);

  /**
   * Unirse a una conversación
   */
  const joinConversation = useCallback((conversationId) => {
    if (socketRef.current) {
      socketRef.current.emit('join_conversation', conversationId);
    }
  }, []);

  /**
   * Salir de una conversación
   */
  const leaveConversation = useCallback((conversationId) => {
    if (socketRef.current) {
      socketRef.current.emit('leave_conversation', conversationId);
    }
  }, []);

  /**
   * Enviar mensaje por Socket.io
   */
  const sendMessage = useCallback((conversationId, messageText) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('send_message', {
        conversationId,
        messageText
      });
    }
  }, [isConnected]);

  /**
   * Notificar que el usuario está escribiendo
   */
  const emitTyping = useCallback((conversationId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('typing', { conversationId });
    }
  }, [isConnected]);

  /**
   * Notificar que el usuario dejó de escribir
   */
  const emitStopTyping = useCallback((conversationId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('stop_typing', { conversationId });
    }
  }, [isConnected]);

  /**
   * Marcar mensajes como leídos por Socket.io
   */
  const markAsRead = useCallback((conversationId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('mark_as_read', { conversationId });
    }
  }, [isConnected]);

  /**
   * Escuchar un evento personalizado
   */
  const on = useCallback((eventName, callback) => {
    if (socketRef.current) {
      socketRef.current.on(eventName, callback);
    }
  }, []);

  /**
   * Dejar de escuchar un evento
   */
  const off = useCallback((eventName, callback) => {
    if (socketRef.current) {
      socketRef.current.off(eventName, callback);
    }
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    onlineUsers,
    joinConversation,
    leaveConversation,
    sendMessage,
    emitTyping,
    emitStopTyping,
    markAsRead,
    on,
    off
  };
};

export default useSocket;
