import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Typography,
  Fade,
  Chip,
  Avatar
} from '@mui/material';
import {
  ArrowBack,
  Person,
  Business,
  AccountBalance,
  Verified,
  Edit as EditIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import EntrepreneurProfileForm from '../components/profile/EntrepreneurProfileForm';
import InvestorProfileForm from '../components/profile/InvestorProfileForm';
import userService from '../services/userService';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user: contextUser, setUser } = useAuth();
  const [user, setLocalUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const response = await userService.getMyProfile();
      setLocalUser(response.data); // El backend retorna { success: true, data: user }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = (updatedUser) => {
    // Actualizar estado local
    setLocalUser(updatedUser);

    // Actualizar contexto de autenticación
    setUser(updatedUser);

    // Actualizar localStorage
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)'
        }}
      >
        <Fade in={true} timeout={800}>
          <Paper
            sx={{
              p: 5,
              textAlign: 'center',
              background: 'rgba(30, 30, 30, 0.8)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0, 217, 255, 0.2)',
              borderRadius: 4,
              boxShadow: '0 0 40px rgba(0, 217, 255, 0.15)'
            }}
          >
            <Box sx={{ position: 'relative', display: 'inline-flex', mb: 3 }}>
              <CircularProgress
                size={80}
                thickness={2}
                sx={{
                  color: '#00d9ff',
                  '& .MuiCircularProgress-circle': {
                    strokeLinecap: 'round',
                  }
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Person sx={{ fontSize: 35, color: '#00d9ff' }} />
              </Box>
            </Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #00d9ff 0%, #a855f7 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              Cargando Perfil
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Obteniendo tu información...
            </Typography>
          </Paper>
        </Fade>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)'
        }}
      >
        <Container maxWidth="sm">
          <Fade in={true}>
            <Paper
              sx={{
                p: 4,
                textAlign: 'center',
                background: 'rgba(30, 30, 30, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 4
              }}
            >
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  '& .MuiAlert-icon': { fontSize: 28 }
                }}
              >
                {error}
              </Alert>
              <Button
                variant="contained"
                startIcon={<ArrowBack />}
                onClick={() => navigate('/dashboard')}
                sx={{
                  background: 'linear-gradient(135deg, #00d9ff 0%, #a855f7 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #00c4e6 0%, #9333ea 100%)',
                  }
                }}
              >
                Volver al Dashboard
              </Button>
            </Paper>
          </Fade>
        </Container>
      </Box>
    );
  }

  if (!user) {
    return null;
  }

  const isEntrepreneur = user.userType === 'emprendedor';
  const profileColor = isEntrepreneur ? '#a855f7' : '#22c55e';
  const ProfileIcon = isEntrepreneur ? Business : AccountBalance;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
        pb: 6
      }}
    >
      {/* Header mejorado */}
      <Box
        sx={{
          background: `linear-gradient(135deg, rgba(0, 217, 255, 0.1) 0%, ${isEntrepreneur ? 'rgba(168, 85, 247, 0.1)' : 'rgba(34, 197, 94, 0.1)'} 100%)`,
          borderBottom: `1px solid ${isEntrepreneur ? 'rgba(168, 85, 247, 0.2)' : 'rgba(34, 197, 94, 0.2)'}`,
          py: { xs: 4, md: 5 },
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
            background: `radial-gradient(circle, ${isEntrepreneur ? 'rgba(168, 85, 247, 0.1)' : 'rgba(34, 197, 94, 0.1)'} 0%, transparent 70%)`,
          },
        }}
      >
        <Container maxWidth="lg">
          <Fade in={true} timeout={600}>
            <Box>
              {/* Botón de regreso */}
              <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate('/dashboard')}
                sx={{
                  mb: 3,
                  color: 'rgba(255, 255, 255, 0.7)',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  '&:hover': {
                    borderColor: '#00d9ff',
                    color: '#00d9ff',
                    background: 'rgba(0, 217, 255, 0.1)',
                  }
                }}
                variant="outlined"
              >
                Volver al Dashboard
              </Button>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    background: `linear-gradient(135deg, ${profileColor} 0%, #00d9ff 100%)`,
                    border: `3px solid ${profileColor}`,
                    boxShadow: `0 0 30px ${profileColor}40`,
                  }}
                >
                  <ProfileIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 800,
                        background: `linear-gradient(135deg, #ffffff 0%, ${profileColor} 100%)`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      Mi Perfil
                    </Typography>
                    <Chip
                      icon={<EditIcon sx={{ color: `${profileColor} !important`, fontSize: 16 }} />}
                      label="Editar"
                      size="small"
                      sx={{
                        background: `${profileColor}20`,
                        border: `1px solid ${profileColor}40`,
                        color: profileColor,
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip
                      icon={<Verified sx={{ color: '#00d9ff !important' }} />}
                      label={isEntrepreneur ? 'Emprendedor' : 'Inversionista'}
                      sx={{
                        background: 'rgba(0, 217, 255, 0.15)',
                        border: '1px solid rgba(0, 217, 255, 0.3)',
                        color: '#00d9ff',
                        fontWeight: 600,
                      }}
                    />
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                      {user.email}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Fade>
        </Container>
      </Box>

      <Container maxWidth="lg">
        <Fade in={true} timeout={800}>
          <Box>
            {/* Formulario según tipo de usuario */}
            {user.userType === 'emprendedor' ? (
              <EntrepreneurProfileForm
                user={user}
                onUpdate={handleProfileUpdate}
              />
            ) : user.userType === 'inversionista' ? (
              <InvestorProfileForm
                user={user}
                onUpdate={handleProfileUpdate}
              />
            ) : (
              <Alert
                severity="warning"
                sx={{
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: 2
                }}
              >
                Tipo de usuario no reconocido
              </Alert>
            )}
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default ProfilePage;
