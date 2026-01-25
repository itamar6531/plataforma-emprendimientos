import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Paper,
  Grid,
  Typography,
  IconButton,
  Divider,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  Button,
  Fab,
  alpha
} from '@mui/material';
import { ArrowBack, Add, Search } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import useSocket from '../hooks/useSocket';
import messageService from '../services/messageService';
import ConversationList from '../components/messages/ConversationList';
import ChatWindow from '../components/messages/ChatWindow';
import UserSearchDialog from '../components/messages/UserSearchDialog';

const MessagesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const startChatProcessed = useRef(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState('');
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);

  const token = localStorage.getItem('token');
  const {
    isConnected,
    onlineUsers,
    joinConversation,
    leaveConversation,
    sendMessage: sendSocketMessage,
    emitTyping,
    emitStopTyping,
    markAsRead,
    on,
    off
  } = useSocket(token);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await messageService.getConversations();
      setConversations(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar conversaciones');
      toast.error('Error al cargar conversaciones');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = useCallback(async (conversationId) => {
    try {
      setLoadingMessages(true);
      const response = await messageService.getMessages(conversationId);
      setMessages(response.data.messages || []);

      if (isConnected) {
        markAsRead(conversationId);
      }

      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === conversationId ? { ...conv, unreadCount: 0 } : conv
        )
      );
    } catch (err) {
      toast.error('Error al cargar mensajes');
      console.error('Error al cargar mensajes:', err);
    } finally {
      setLoadingMessages(false);
    }
  }, [isConnected, markAsRead]);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    const startChatWith = location.state?.startChatWith;

    if (startChatWith && !loading && !startChatProcessed.current) {
      startChatProcessed.current = true;
      handleStartChat(startChatWith);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, loading, navigate, location.pathname]);

  useEffect(() => {
    if (!isConnected) return;

    const handleNewMessage = (data) => {
      const { message } = data;

      if (selectedConversation && message.conversationId === selectedConversation._id) {
        setMessages((prev) => [...prev, message]);
        markAsRead(selectedConversation._id);
      }

      setConversations((prev) =>
        prev.map((conv) => {
          if (conv._id === message.conversationId) {
            return {
              ...conv,
              lastMessageText: message.messageText,
              lastMessageAt: message.createdAt,
              unreadCount:
                selectedConversation?._id === message.conversationId
                  ? 0
                  : conv.unreadCount + (message.sender._id !== user._id ? 1 : 0)
            };
          }
          return conv;
        })
      );
    };

    const handleUserTyping = (data) => {
      if (selectedConversation && data.conversationId === selectedConversation._id) {
        setTypingUsers((prev) => new Set(prev).add(data.user._id));
      }
    };

    const handleUserStopTyping = (data) => {
      if (selectedConversation && data.conversationId === selectedConversation._id) {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(data.user._id);
          return newSet;
        });
      }
    };

    const handleMessagesRead = (data) => {
      if (selectedConversation && data.conversationId === selectedConversation._id) {
        setMessages((prev) =>
          prev.map((msg) => ({
            ...msg,
            readAt: msg.readAt || data.readAt
          }))
        );
      }
    };

    const handleNotification = (data) => {
      if (data.type === 'new_message' && (!selectedConversation || data.conversationId !== selectedConversation._id)) {
        toast.info(data.message);
      }
    };

    on('new_message', handleNewMessage);
    on('user_typing', handleUserTyping);
    on('user_stop_typing', handleUserStopTyping);
    on('messages_read', handleMessagesRead);
    on('notification', handleNotification);

    return () => {
      off('new_message', handleNewMessage);
      off('user_typing', handleUserTyping);
      off('user_stop_typing', handleUserStopTyping);
      off('messages_read', handleMessagesRead);
      off('notification', handleNotification);
    };
  }, [isConnected, selectedConversation, on, off, user, markAsRead]);

  useEffect(() => {
    if (selectedConversation) {
      joinConversation(selectedConversation._id);
      loadMessages(selectedConversation._id);

      return () => {
        leaveConversation(selectedConversation._id);
      };
    }
  }, [selectedConversation, joinConversation, leaveConversation, loadMessages]);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setTypingUsers(new Set());
  };

  const handleSendMessage = async (messageText) => {
    if (!selectedConversation || !isConnected) {
      throw new Error('No hay conexión');
    }

    sendSocketMessage(selectedConversation._id, messageText);
  };

  const handleTyping = () => {
    if (selectedConversation && isConnected) {
      emitTyping(selectedConversation._id);
    }
  };

  const handleStopTyping = () => {
    if (selectedConversation && isConnected) {
      emitStopTyping(selectedConversation._id);
    }
  };

  const isOtherUserOnline = () => {
    if (!selectedConversation) return false;
    return onlineUsers.includes(selectedConversation.otherUser?._id);
  };

  const isOtherUserTyping = () => {
    if (!selectedConversation) return false;
    return typingUsers.has(selectedConversation.otherUser?._id);
  };

  const handleStartChat = async (selectedUser) => {
    try {
      const existingConversation = conversations.find(
        (conv) => conv.otherUser._id === selectedUser._id
      );

      if (existingConversation) {
        setSelectedConversation(existingConversation);
        toast.info('Ya tienes una conversación con este usuario');
        return;
      }

      const initialMessage = `¡Hola ${selectedUser.name}! Me gustaría conectar contigo.`;

      await messageService.sendMessage({
        receiverId: selectedUser._id,
        messageText: initialMessage
      });

      await new Promise(resolve => setTimeout(resolve, 500));

      const response = await messageService.getConversations();
      const updatedConversations = response.data || [];

      setConversations(updatedConversations);

      const newConversation = updatedConversations.find(
        (conv) => conv.otherUser?._id === selectedUser._id
      );

      if (newConversation) {
        setSelectedConversation(newConversation);
        toast.success('Conversación iniciada exitosamente');
      } else {
        if (updatedConversations.length > 0) {
          setSelectedConversation(updatedConversations[0]);
          toast.success('Conversación iniciada exitosamente');
        } else {
          toast.error('No se pudo cargar la conversación. Por favor recarga la página.');
        }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al iniciar conversación';
      toast.error(errorMessage);
      console.error('Error al iniciar chat:', err);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#0a0a0a'
        }}
      >
        <CircularProgress size={60} sx={{ color: '#00d9ff' }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#0a0a0a'
      }}
    >
      {/* Header - Dark Mode */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          borderRadius: 0,
          bgcolor: '#121212',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <IconButton
          onClick={() => navigate('/dashboard')}
          sx={{
            color: '#a0a0a0',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              color: '#fff'
            }
          }}
        >
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 600, flex: 1, color: '#fff' }}>
          Mensajes
        </Typography>
        {isConnected ? (
          <Typography variant="caption" sx={{ fontWeight: 600, color: '#22c55e' }}>
            ● Conectado
          </Typography>
        ) : (
          <Typography variant="caption" sx={{ fontWeight: 600, color: '#ef4444' }}>
            ● Desconectado
          </Typography>
        )}
      </Paper>

      {error && (
        <Alert
          severity="error"
          sx={{
            m: 2,
            bgcolor: alpha('#ef4444', 0.1),
            color: '#ef4444',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            '& .MuiAlert-icon': {
              color: '#ef4444'
            }
          }}
        >
          {error}
        </Alert>
      )}

      {/* Contenedor principal - Dark Mode */}
      <Box sx={{ height: 'calc(100vh - 80px)', p: { xs: 0, md: 2 } }}>
        <Paper
          elevation={0}
          sx={{
            height: '100%',
            display: 'flex',
            overflow: 'hidden',
            borderRadius: { xs: 0, md: 3 },
            bgcolor: '#121212',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          {/* Lista de conversaciones */}
          {(!isMobile || !selectedConversation) && (
            <Box
              sx={{
                width: { xs: '100%', md: 350 },
                borderRight: { md: '1px solid rgba(255, 255, 255, 0.08)' },
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                bgcolor: '#0a0a0a'
              }}
            >
              <Box
                sx={{
                  p: 2,
                  bgcolor: '#121212',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#fff' }}>
                  Conversaciones
                </Typography>
                <IconButton
                  onClick={() => setSearchDialogOpen(true)}
                  sx={{
                    bgcolor: '#00d9ff',
                    color: '#000',
                    '&:hover': {
                      bgcolor: '#5cefff',
                      boxShadow: '0 4px 14px rgba(0, 217, 255, 0.4)'
                    }
                  }}
                  size="small"
                >
                  <Add />
                </IconButton>
              </Box>
              <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />
              <Box sx={{ flex: 1, overflowY: 'auto' }}>
                <ConversationList
                  conversations={conversations}
                  selectedConversationId={selectedConversation?._id}
                  onSelectConversation={handleSelectConversation}
                  onlineUsers={onlineUsers}
                />
              </Box>
            </Box>
          )}

          {/* Ventana de chat */}
          {(!isMobile || selectedConversation) && (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <ChatWindow
                conversation={selectedConversation}
                messages={messages}
                currentUserId={user._id}
                isLoadingMessages={loadingMessages}
                isOnline={isOtherUserOnline()}
                isTyping={isOtherUserTyping()}
                onSendMessage={handleSendMessage}
                onTyping={handleTyping}
                onStopTyping={handleStopTyping}
              />
            </Box>
          )}
        </Paper>
      </Box>

      {/* Diálogo de búsqueda de usuarios */}
      <UserSearchDialog
        open={searchDialogOpen}
        onClose={() => setSearchDialogOpen(false)}
        currentUser={user}
        onStartChat={handleStartChat}
      />

      {/* Botón flotante para móviles */}
      {isMobile && !selectedConversation && (
        <Fab
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            bgcolor: '#00d9ff',
            color: '#000',
            '&:hover': {
              bgcolor: '#5cefff',
              boxShadow: '0 6px 20px rgba(0, 217, 255, 0.5)'
            }
          }}
          onClick={() => setSearchDialogOpen(true)}
        >
          <Search />
        </Fab>
      )}
    </Box>
  );
};

export default MessagesPage;
