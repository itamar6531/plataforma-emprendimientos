import {
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Badge,
  Typography,
  Box,
  Divider,
  alpha,
  useTheme
} from '@mui/material';
import { Circle } from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const ConversationList = ({ conversations, selectedConversationId, onSelectConversation, onlineUsers }) => {
  const theme = useTheme();

  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId);
  };

  const formatLastMessageTime = (date) => {
    if (!date) return '';

    try {
      return formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: es
      });
    } catch (error) {
      return '';
    }
  };

  if (!conversations || conversations.length === 0) {
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
        <Typography variant="h6" sx={{ color: '#a0a0a0', mb: 1 }}>
          No tienes conversaciones
        </Typography>
        <Typography variant="body2" sx={{ color: '#666' }}>
          Busca usuarios y comienza a chatear
        </Typography>
      </Box>
    );
  }

  return (
    <List sx={{ width: '100%', p: 0, bgcolor: '#0a0a0a' }}>
      {conversations.map((conversation, index) => {
        const isSelected = conversation._id === selectedConversationId;
        const online = isUserOnline(conversation.otherUser?._id);

        return (
          <Box key={conversation._id}>
            <ListItem disablePadding>
              <ListItemButton
                selected={isSelected}
                onClick={() => onSelectConversation(conversation)}
                sx={{
                  py: 2,
                  px: 2.5,
                  bgcolor: '#0a0a0a',
                  '&.Mui-selected': {
                    bgcolor: alpha('#00d9ff', 0.1),
                    borderLeft: '4px solid #00d9ff',
                    '&:hover': {
                      bgcolor: alpha('#00d9ff', 0.15)
                    }
                  },
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.03)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <ListItemAvatar>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      online ? (
                        <Circle
                          sx={{
                            fontSize: 12,
                            color: '#22c55e',
                            border: '2px solid #0a0a0a',
                            borderRadius: '50%'
                          }}
                        />
                      ) : null
                    }
                  >
                    <Avatar
                      sx={{
                        width: 50,
                        height: 50,
                        bgcolor: alpha('#a855f7', 0.2),
                        border: '2px solid rgba(168, 85, 247, 0.3)',
                        fontWeight: 'bold',
                        color: '#a855f7'
                      }}
                    >
                      {conversation.otherUser?.name?.charAt(0).toUpperCase()}
                    </Avatar>
                  </Badge>
                </ListItemAvatar>

                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#fff' }}>
                        {conversation.otherUser?.name}
                      </Typography>
                      {conversation.unreadCount > 0 && (
                        <Badge
                          badgeContent={conversation.unreadCount}
                          sx={{
                            '& .MuiBadge-badge': {
                              fontSize: '0.7rem',
                              height: 18,
                              minWidth: 18,
                              fontWeight: 'bold',
                              bgcolor: '#ff6b9d',
                              color: '#000'
                            }
                          }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontWeight: conversation.unreadCount > 0 ? 600 : 400,
                          color: conversation.unreadCount > 0 ? '#fff' : '#a0a0a0'
                        }}
                      >
                        {conversation.lastMessageText || 'No hay mensajes'}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ display: 'block', mt: 0.5, color: '#666' }}
                      >
                        {formatLastMessageTime(conversation.lastMessageAt)}
                      </Typography>
                    </Box>
                  }
                />
              </ListItemButton>
            </ListItem>
            {index < conversations.length - 1 && (
              <Divider
                component="li"
                sx={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}
              />
            )}
          </Box>
        );
      })}
    </List>
  );
};

export default ConversationList;
