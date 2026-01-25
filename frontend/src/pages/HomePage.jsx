import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  Paper,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Restaurant,
  TrendingUp,
  Chat,
  Assessment,
  ArrowForward,
  CheckCircle,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const theme = useTheme();

  const features = [
    {
      icon: <Restaurant />,
      title: 'Emprendimientos Culinarios',
      description: 'Conecta tu idea de negocio gastronómico con inversionistas interesados en el sector',
      color: '#ff6b9d',
    },
    {
      icon: <TrendingUp />,
      title: 'Análisis Predictivo',
      description: 'IA avanzada que evalúa la viabilidad y potencial de éxito de tu emprendimiento',
      color: '#00d9ff',
    },
    {
      icon: <Chat />,
      title: 'Chat en Tiempo Real',
      description: 'Comunícate directamente con potenciales inversionistas en tiempo real',
      color: '#a855f7',
    },
    {
      icon: <Assessment />,
      title: 'Dashboard Analítico',
      description: 'Visualiza métricas clave y toma decisiones informadas basadas en datos',
      color: '#22c55e',
    },
  ];


  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#0a0a0a', minHeight: '100vh' }}>
      {/* Modern Navbar - Dark Mode */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: 'rgba(10, 10, 10, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                p: 1,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #00d9ff 0%, #a855f7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
              }}
            >
              <Restaurant sx={{ fontSize: 28, color: '#000' }} />
            </Box>
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #00d9ff 0%, #ff6b9d 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              CookStart
            </Typography>
          </Box>
          {!isAuthenticated ? (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                color="inherit"
                onClick={() => navigate('/login')}
                sx={{
                  fontWeight: 600,
                  color: '#a0a0a0',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    color: '#fff',
                  },
                }}
              >
                Iniciar Sesión
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/register')}
                sx={{
                  background: 'linear-gradient(135deg, #00d9ff 0%, #a855f7 100%)',
                  color: '#000',
                  fontWeight: 600,
                  px: 3,
                  boxShadow: '0 4px 14px rgba(0, 217, 255, 0.3)',
                  '&:hover': {
                    boxShadow: '0 6px 20px rgba(0, 217, 255, 0.5)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Registrarse
              </Button>
            </Box>
          ) : (
            <Button
              variant="contained"
              onClick={() => navigate('/dashboard')}
              sx={{
                fontWeight: 600,
                background: 'linear-gradient(135deg, #00d9ff 0%, #a855f7 100%)',
                color: '#000',
              }}
            >
              Dashboard
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Hero Section with Dark Gradient */}
      <Box
        sx={{
          position: 'relative',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
          color: 'white',
          py: { xs: 10, md: 14 },
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 50%, rgba(0, 217, 255, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.15) 0%, transparent 50%)',
            pointerEvents: 'none',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '150%',
            height: '150%',
            background: 'radial-gradient(ellipse at center, transparent 0%, #0a0a0a 70%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', maxWidth: '900px', mx: 'auto' }}>
            <Typography
              variant="h1"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 800,
                fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                mb: 3,
                lineHeight: 1.2,
                background: 'linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              ¡Conecta tu emprendimiento!
            </Typography>
            <Typography
              variant="h5"
              paragraph
              sx={{
                mb: 4,
                color: '#a0a0a0',
                fontSize: { xs: '1.1rem', md: '1.4rem' },
                fontWeight: 300,
              }}
            >
              CookStart conecta emprendedores culinarios con inversionistas en Guayaquil
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
                endIcon={<ArrowForward />}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #00d9ff 0%, #a855f7 100%)',
                  color: '#000',
                  boxShadow: '0 8px 24px rgba(0, 217, 255, 0.4)',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 12px 32px rgba(0, 217, 255, 0.5)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Comenzar Ahora
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/login')}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 2,
                  borderWidth: 2,
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  '&:hover': {
                    borderWidth: 2,
                    borderColor: '#00d9ff',
                    bgcolor: 'rgba(0, 217, 255, 0.1)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Iniciar Sesión
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Features Section - Dark Mode */}
      <Container maxWidth="lg" sx={{ py: { xs: 10, md: 14 } }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h2"
            gutterBottom
            sx={{
              fontWeight: 800,
              fontSize: { xs: '2rem', md: '2.8rem' },
              mb: 2,
              background: 'linear-gradient(135deg, #00d9ff 0%, #ff6b9d 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            ¿Por qué elegirnos?
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontSize: { xs: '1rem', md: '1.2rem' },
              maxWidth: '600px',
              mx: 'auto',
              color: '#a0a0a0',
            }}
          >
            Características que nos hacen únicos y te ayudan a alcanzar el éxito
          </Typography>
        </Box>

        <Grid container spacing={3} sx={{ justifyContent: 'center' }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index} sx={{ display: 'flex' }}>
              <Card
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  p: { xs: 2.5, md: 3 },
                  borderRadius: 3,
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  background: '#121212',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 12px 40px ${alpha(feature.color, 0.3)}`,
                    border: `1px solid ${alpha(feature.color, 0.5)}`,
                    '& .feature-icon': {
                      transform: 'scale(1.1) rotate(5deg)',
                    },
                  },
                }}
              >
                <Box
                  className="feature-icon"
                  sx={{
                    mb: 2.5,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      bgcolor: alpha(feature.color, 0.15),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 72,
                      height: 72,
                    }}
                  >
                    {React.cloneElement(feature.icon, {
                      sx: { fontSize: 40, color: feature.color },
                    })}
                  </Box>
                </Box>
                <CardContent sx={{ p: 0, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      fontWeight: 700,
                      mb: 1.5,
                      fontSize: { xs: '1.1rem', md: '1.2rem' },
                      color: '#fff',
                      textAlign: 'center',
                      minHeight: { xs: '3em', md: '3.5em' },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      lineHeight: 1.7,
                      fontSize: { xs: '0.9rem', md: '0.95rem' },
                      color: '#a0a0a0',
                      textAlign: 'center',
                      flexGrow: 1,
                    }}
                  >
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

{/* CTA Section - Dark Mode */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
          color: 'white',
          py: { xs: 10, md: 12 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0, 217, 255, 0.2) 0%, transparent 70%)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -100,
            left: -100,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 70%)',
          },
        }}
      >
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <Box
            sx={{
              display: 'inline-flex',
              p: 2,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
              mb: 3,
            }}
          >
            <CheckCircle sx={{ fontSize: 60, color: '#00d9ff' }} />
          </Box>
          <Typography
            variant="h3"
            gutterBottom
            sx={{
              fontWeight: 800,
              mb: 3,
              fontSize: { xs: '2rem', md: '2.5rem' },
              color: '#fff',
            }}
          >
            ¿Listo para comenzar?
          </Typography>
          <Typography
            variant="h6"
            paragraph
            sx={{
              mb: 4,
              color: '#a0a0a0',
              fontSize: { xs: '1rem', md: '1.2rem' },
              fontWeight: 300,
            }}
          >
            Únete hoy y conecta con la comunidad de emprendedores culinarios más grande de Guayaquil
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/register')}
            endIcon={<ArrowForward />}
            sx={{
              px: 5,
              py: 2,
              fontSize: '1.2rem',
              fontWeight: 700,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #ff6b9d 0%, #a855f7 100%)',
              color: '#000',
              boxShadow: '0 8px 24px rgba(255, 107, 157, 0.4)',
              '&:hover': {
                transform: 'translateY(-4px) scale(1.05)',
                boxShadow: '0 12px 32px rgba(255, 107, 157, 0.5)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Crear Cuenta Gratis
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
