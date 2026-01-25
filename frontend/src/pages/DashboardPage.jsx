import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import UserSearchDialog from '../components/messages/UserSearchDialog';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  Chip,
  Avatar,
  alpha,
  useTheme,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Person,
  Search,
  Message,
  TrendingUp,
  Logout,
  Email,
  Business,
  AccountBalance,
  Edit,
  ArrowForward,
  Assessment,
  Chat,
} from '@mui/icons-material';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleStartChat = (selectedUser) => {
    navigate('/messages', { state: { startChatWith: selectedUser } });
  };

  const handleCardClick = (cardId) => {
    switch (cardId) {
      case 'profile':
        navigate('/profile');
        break;
      case 'search':
        setSearchDialogOpen(true);
        break;
      case 'messages':
        navigate('/messages');
        break;
      case 'analysis':
        navigate('/analysis');
        break;
      default:
        break;
    }
  };

  const tipoUsuarioText = user?.userType === 'emprendedor' ? 'Emprendedor' : 'Inversionista';
  const isEmprendedor = user?.userType === 'emprendedor';

  const actionCards = [
    {
      id: 'profile',
      icon: <Person />,
      title: 'Mi Perfil',
      description: 'Completa tu perfil para comenzar a conectar con otros usuarios de la plataforma.',
      color: '#00d9ff',
      buttonText: 'Completar Perfil',
      buttonIcon: <Edit />,
    },
    {
      id: 'search',
      icon: <Search />,
      title: isEmprendedor ? 'Buscar Inversionistas' : 'Buscar Emprendedores',
      description: `Encuentra la conexión perfecta para tu ${isEmprendedor ? 'proyecto' : 'inversión'}.`,
      color: '#a855f7',
      buttonText: 'Explorar',
      buttonIcon: <ArrowForward />,
    },
    {
      id: 'messages',
      icon: <Message />,
      title: 'Mensajes',
      description: 'Mantente en contacto con tus conexiones y potenciales socios.',
      color: '#ff6b9d',
      buttonText: 'Ver Mensajes',
      buttonIcon: <Chat />,
      badge: 0,
    },
    ...(isEmprendedor
      ? [
          {
            id: 'analysis',
            icon: <TrendingUp />,
            title: 'Análisis de Viabilidad',
            description: 'Obtén un análisis predictivo de tu emprendimiento con IA avanzada.',
            color: '#22c55e',
            buttonText: 'Ver Análisis',
            buttonIcon: <Assessment />,
          },
        ]
      : []),
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#0a0a0a',
        pb: 4,
      }}
    >
      {/* Header con Gradiente Dark */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
          color: 'white',
          py: { xs: 4, md: 6 },
          mb: 4,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0, 217, 255, 0.15) 0%, transparent 70%)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -100,
            left: -100,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
          },
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              flexDirection: { xs: 'column', md: 'row' },
              gap: 2,
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: alpha('#00d9ff', 0.2),
                    fontSize: 32,
                    border: '2px solid rgba(0, 217, 255, 0.3)',
                  }}
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      mb: 0.5,
                      fontSize: { xs: '1.8rem', md: '2.5rem' },
                      background: 'linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    ¡Bienvenido, {user?.name}!
                  </Typography>
                  <Chip
                    icon={isEmprendedor ? <Business sx={{ color: '#00d9ff !important' }} /> : <AccountBalance sx={{ color: '#ff6b9d !important' }} />}
                    label={tipoUsuarioText}
                    sx={{
                      bgcolor: isEmprendedor ? alpha('#00d9ff', 0.15) : alpha('#ff6b9d', 0.15),
                      color: isEmprendedor ? '#00d9ff' : '#ff6b9d',
                      fontWeight: 600,
                      border: `1px solid ${isEmprendedor ? 'rgba(0, 217, 255, 0.3)' : 'rgba(255, 107, 157, 0.3)'}`,
                    }}
                  />
                </Box>
              </Box>
              <Typography
                variant="body1"
                sx={{
                  mt: 2,
                  color: '#a0a0a0',
                  fontSize: { xs: '0.9rem', md: '1rem' },
                }}
              >
                Gestiona tu {isEmprendedor ? 'emprendimiento' : 'inversión'} desde aquí
              </Typography>
            </Box>
            <Button
              variant="contained"
              onClick={handleLogout}
              startIcon={<Logout />}
              sx={{
                position: 'relative',
                zIndex: 1,
                px: 3,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600,
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  background: 'rgba(239, 68, 68, 0.2)',
                  borderColor: 'rgba(239, 68, 68, 0.5)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Cerrar Sesión
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg">
        <Grid container spacing={3}>
          {/* Información del Usuario - Tarjeta Dark */}
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: 3,
                background: '#121212',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: alpha('#00d9ff', 0.15),
                    mr: 2,
                  }}
                >
                  <Person sx={{ fontSize: 32, color: '#00d9ff' }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff' }}>
                  Información de la Cuenta
                </Typography>
              </Box>
              <Divider sx={{ mb: 3, borderColor: 'rgba(255, 255, 255, 0.08)' }} />
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: '#1e1e1e',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ mb: 1, fontWeight: 600, color: '#a0a0a0' }}
                    >
                      Nombre
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff' }}>
                      {user?.name}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: '#1e1e1e',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Email sx={{ fontSize: 18, mr: 1, color: '#a0a0a0' }} />
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: '#a0a0a0' }}
                      >
                        Email
                      </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff' }}>
                      {user?.email}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: '#1e1e1e',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      {isEmprendedor ? (
                        <Business sx={{ fontSize: 18, mr: 1, color: '#a0a0a0' }} />
                      ) : (
                        <AccountBalance sx={{ fontSize: 18, mr: 1, color: '#a0a0a0' }} />
                      )}
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: '#a0a0a0' }}
                      >
                        Tipo de Usuario
                      </Typography>
                    </Box>
                    <Chip
                      icon={isEmprendedor ? <Business sx={{ color: '#00d9ff !important' }} /> : <AccountBalance sx={{ color: '#ff6b9d !important' }} />}
                      label={tipoUsuarioText}
                      sx={{
                        bgcolor: isEmprendedor ? alpha('#00d9ff', 0.15) : alpha('#ff6b9d', 0.15),
                        color: isEmprendedor ? '#00d9ff' : '#ff6b9d',
                        fontWeight: 700,
                        border: `1px solid ${isEmprendedor ? 'rgba(0, 217, 255, 0.3)' : 'rgba(255, 107, 157, 0.3)'}`,
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Tarjetas de Acción - Dark Mode */}
          {actionCards.map((card) => (
            <Grid item xs={12} sm={6} md={isEmprendedor ? 6 : 4} key={card.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  background: '#121212',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: `linear-gradient(90deg, ${card.color} 0%, ${alpha(card.color, 0.6)} 100%)`,
                  },
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 12px 40px ${alpha(card.color, 0.25)}`,
                    border: `1px solid ${alpha(card.color, 0.4)}`,
                    '& .card-icon': {
                      transform: 'scale(1.1) rotate(5deg)',
                    },
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 2,
                    }}
                  >
                    <Box
                      className="card-icon"
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: alpha(card.color, 0.15),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {React.cloneElement(card.icon, {
                        sx: { fontSize: 40, color: card.color },
                      })}
                    </Box>
                    {card.badge !== undefined && card.badge > 0 && (
                      <Chip
                        label={card.badge}
                        size="small"
                        sx={{
                          bgcolor: '#ef4444',
                          color: 'white',
                          fontWeight: 700,
                        }}
                      />
                    )}
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 1.5,
                      fontSize: '1.3rem',
                      color: '#fff',
                    }}
                  >
                    {card.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    paragraph
                    sx={{
                      mb: 3,
                      lineHeight: 1.7,
                      minHeight: '3em',
                      color: '#a0a0a0',
                    }}
                  >
                    {card.description}
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={card.buttonIcon}
                    onClick={() => handleCardClick(card.id)}
                    sx={{
                      mt: 'auto',
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 700,
                      background: `linear-gradient(135deg, ${card.color} 0%, ${alpha(card.color, 0.8)} 100%)`,
                      color: '#000',
                      boxShadow: `0 4px 14px ${alpha(card.color, 0.3)}`,
                      '&:hover': {
                        boxShadow: `0 6px 20px ${alpha(card.color, 0.5)}`,
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {card.buttonText}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Diálogo de búsqueda de usuarios */}
      <UserSearchDialog
        open={searchDialogOpen}
        onClose={() => setSearchDialogOpen(false)}
        currentUser={user}
        onStartChat={handleStartChat}
      />
    </Box>
  );
};

export default DashboardPage;
