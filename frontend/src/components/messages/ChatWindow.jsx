import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Divider,
  CircularProgress,
  alpha,
  useTheme,
  Badge
} from '@mui/material';
import { Send, Circle } from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'react-toastify';

const ChatWindow = ({
  conversation,
  messages,
  currentUserId,
  isLoadingMessages,
  isOnline,
  isTyping,
  onSendMessage,
  onTyping,
  onStopTyping
}) => {
  const theme = useTheme();
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInputChange = (e) => {
    setMessageText(e.target.value);

    if (onTyping) {
      onTyping();
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (onStopTyping) {
        onStopTyping();
      }
    }, 2000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageText.trim()) {
      return;
    }

    if (!onSendMessage) {
      toast.error('No se puede enviar el mensaje');
      return;
    }

    try {
      setSending(true);
      await onSendMessage(messageText.trim());
      setMessageText('');

      if (onStopTyping) {
        onStopTyping();
      }
    } catch (error) {
      toast.error('Error al enviar mensaje');
      console.error('Error al enviar mensaje:', error);
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (date) => {
    try {
      return formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: es
      });
    } catch (error) {
      return '';
    }
  };

  if (!conversation) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          p: 4,
          bgcolor: '#0a0a0a'
        }}
      >
        <Typography variant="h6" sx={{ color: '#a0a0a0' }}>
          Selecciona una conversación para comenzar a chatear
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#0a0a0a' }}>
      {/* Header del chat - Dark Mode */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          borderRadius: 0,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={
            isOnline ? (
              <Circle
                sx={{
                  fontSize: 14,
                  color: '#22c55e',
                  border: '2px solid #1e1b4b',
                  borderRadius: '50%'
                }}
              />
            ) : null
          }
        >
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: alpha('#00d9ff', 0.2),
              border: '2px solid rgba(0, 217, 255, 0.3)',
              fontWeight: 'bold',
              color: '#00d9ff'
            }}
          >
            {conversation.otherUser?.name?.charAt(0).toUpperCase()}
          </Avatar>
        </Badge>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#fff' }}>
            {conversation.otherUser?.name}
          </Typography>
          <Typography variant="caption" sx={{ color: isOnline ? '#22c55e' : '#a0a0a0' }}>
            {isOnline ? 'En línea' : 'Desconectado'}
          </Typography>
        </Box>
      </Paper>

      {/* Área de mensajes - Dark Mode */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 3,
          bgcolor: '#0a0a0a',
          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(0, 217, 255, 0.03) 0%, transparent 50%)',
        }}
      >
        {isLoadingMessages ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress sx={{ color: '#00d9ff' }} />
          </Box>
        ) : messages && messages.length > 0 ? (
          <>
            {messages.map((message, index) => {
              const isOwnMessage = message.sender?._id === currentUserId;
              const showAvatar = index === 0 || messages[index - 1].sender?._id !== message.sender?._id;

              return (
                <Box
                  key={message._id || index}
                  sx={{
                    display: 'flex',
                    justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                    mb: 2,
                    alignItems: 'flex-end',
                    gap: 1
                  }}
                >
                  {!isOwnMessage && showAvatar && (
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: alpha('#a855f7', 0.2),
                        border: '1px solid rgba(168, 85, 247, 0.3)',
                        fontSize: '0.9rem',
                        color: '#a855f7'
                      }}
                    >
                      {message.sender?.name?.charAt(0).toUpperCase()}
                    </Avatar>
                  )}
                  {!isOwnMessage && !showAvatar && <Box sx={{ width: 32 }} />}

                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      maxWidth: '70%',
                      bgcolor: isOwnMessage ? '#00d9ff' : '#1e1e1e',
                      color: isOwnMessage ? '#000' : '#fff',
                      borderRadius: 2,
                      borderTopRightRadius: isOwnMessage ? 0 : 2,
                      borderTopLeftRadius: isOwnMessage ? 2 : 0,
                      border: isOwnMessage ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                      boxShadow: isOwnMessage
                        ? '0 4px 14px rgba(0, 217, 255, 0.3)'
                        : 'none'
                    }}
                  >
                    <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                      {message.messageText}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        mt: 0.5,
                        opacity: 0.8,
                        textAlign: 'right',
                        color: isOwnMessage ? 'rgba(0, 0, 0, 0.7)' : '#a0a0a0'
                      }}
                    >
                      {formatMessageTime(message.createdAt)}
                    </Typography>
                  </Paper>
                </Box>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <Typography variant="body2" sx={{ color: '#a0a0a0' }}>
              No hay mensajes aún. ¡Envía el primero!
            </Typography>
          </Box>
        )}

        {/* Indicador de "escribiendo" */}
        {isTyping && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 2
            }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: alpha('#a855f7', 0.2),
                border: '1px solid rgba(168, 85, 247, 0.3)',
                fontSize: '0.9rem',
                color: '#a855f7'
              }}
            >
              {conversation.otherUser?.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                borderRadius: 2,
                borderTopLeftRadius: 0,
                bgcolor: '#1e1e1e',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#a0a0a0' }}>
                escribiendo...
              </Typography>
            </Paper>
          </Box>
        )}
      </Box>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />

      {/* Input de mensaje - Dark Mode */}
      <Paper
        component="form"
        onSubmit={handleSendMessage}
        elevation={0}
        sx={{
          p: 2,
          display: 'flex',
          gap: 1,
          alignItems: 'center',
          borderRadius: 0,
          bgcolor: '#121212',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={messageText}
          onChange={handleInputChange}
          placeholder="Escribe un mensaje..."
          variant="outlined"
          size="small"
          disabled={sending}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              bgcolor: 'rgba(255, 255, 255, 0.03)',
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.1)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(0, 217, 255, 0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#00d9ff',
              },
            },
            '& .MuiInputBase-input': {
              color: '#fff',
            },
            '& .MuiInputBase-input::placeholder': {
              color: '#a0a0a0',
              opacity: 1,
            },
          }}
        />
        <IconButton
          type="submit"
          disabled={!messageText.trim() || sending}
          sx={{
            bgcolor: '#00d9ff',
            color: '#000',
            '&:hover': {
              bgcolor: '#5cefff',
              boxShadow: '0 4px 14px rgba(0, 217, 255, 0.4)'
            },
            '&.Mui-disabled': {
              bgcolor: alpha('#00d9ff', 0.2),
              color: alpha('#fff', 0.3)
            },
            transition: 'all 0.3s ease'
          }}
        >
          {sending ? <CircularProgress size={24} sx={{ color: '#000' }} /> : <Send />}
        </IconButton>
      </Paper>
    </Box>
  );
};

export default ChatWindow;
