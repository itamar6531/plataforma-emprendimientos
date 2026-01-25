import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  alpha,
  useTheme,
  Fade,
  Grow,
  Chip
} from '@mui/material';
import {
  ArrowBack,
  Assessment,
  TrendingUp,
  Psychology,
  AutoGraph,
  Insights,
  Speed
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import PredictionCard from '../components/prediction/PredictionCard';
import PredictionCharts from '../components/prediction/PredictionCharts';
import userService from '../services/userService';

const AnalysisPage = () => {
  const navigate = useNavigate();
  const { user: contextUser } = useAuth();
  const theme = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const response = await userService.getMyProfile();
      setUser(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar el perfil');
    } finally {
      setLoading(false);
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
                <Psychology sx={{ fontSize: 35, color: '#00d9ff' }} />
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
              Procesando Análisis
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Nuestra IA está evaluando tu emprendimiento...
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

  // Verificar que es emprendedor
  if (user?.userType !== 'emprendedor') {
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
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: 4
              }}
            >
              <Alert
                severity="warning"
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  '& .MuiAlert-icon': { fontSize: 28 }
                }}
              >
                Esta funcionalidad solo está disponible para emprendedores.
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
          background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.1) 0%, rgba(168, 85, 247, 0.1) 50%, rgba(255, 107, 157, 0.05) 100%)',
          borderBottom: '1px solid rgba(0, 217, 255, 0.2)',
          py: { xs: 4, md: 6 },
          mb: 2,
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
            animation: 'pulse-glow 4s ease-in-out infinite',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -100,
            left: -100,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)',
            animation: 'pulse-glow 4s ease-in-out infinite 2s',
          },
        }}
      >
        <Container maxWidth="lg">
          <Fade in={true} timeout={800}>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
                    border: '1px solid rgba(0, 217, 255, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 30px rgba(0, 217, 255, 0.2)',
                  }}
                >
                  <Psychology sx={{ fontSize: 55, color: '#00d9ff' }} />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 800,
                        fontSize: { xs: '1.8rem', md: '2.8rem' },
                        background: 'linear-gradient(135deg, #ffffff 0%, #00d9ff 50%, #a855f7 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      Análisis de Viabilidad
                    </Typography>
                    <Chip
                      icon={<AutoGraph sx={{ color: '#00d9ff !important' }} />}
                      label="IA"
                      size="small"
                      sx={{
                        background: 'rgba(0, 217, 255, 0.15)',
                        border: '1px solid rgba(0, 217, 255, 0.3)',
                        color: '#00d9ff',
                        fontWeight: 600,
                        display: { xs: 'none', sm: 'flex' }
                      }}
                    />
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontWeight: 400,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <Insights sx={{ fontSize: 20, color: '#a855f7' }} />
                    Evaluación predictiva con Machine Learning
                  </Typography>
                </Box>
              </Box>

              {/* Stats rápidos */}
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mt: 3 }}>
                {[
                  { icon: <Speed />, label: 'Análisis en tiempo real', color: '#00d9ff' },
                  { icon: <TrendingUp />, label: 'Predicción de éxito', color: '#22c55e' },
                  { icon: <Assessment />, label: 'Métricas detalladas', color: '#a855f7' },
                ].map((item, index) => (
                  <Grow in={true} timeout={600 + index * 200} key={index}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: `1px solid ${alpha(item.color, 0.3)}`,
                      }}
                    >
                      <Box sx={{ color: item.color }}>{item.icon}</Box>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        {item.label}
                      </Typography>
                    </Box>
                  </Grow>
                ))}
              </Box>
            </Box>
          </Fade>
        </Container>
      </Box>

      <Container maxWidth="lg">
        <Grid container spacing={2}>
          {/* Botón de regreso */}
          <Grid item xs={12}>
            <Fade in={true} timeout={400}>
              <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate('/dashboard')}
                sx={{
                  mb: 1.5,
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
            </Fade>
          </Grid>

          {/* Información sobre el análisis */}
          <Grid item xs={12}>
            <Grow in={true} timeout={600}>
              <Paper
                sx={{
                  p: 4,
                  mb: 2,
                  background: 'rgba(30, 30, 30, 0.6)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(0, 217, 255, 0.2)',
                  borderRadius: 4,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: 'linear-gradient(90deg, #00d9ff 0%, #a855f7 50%, #ff6b9d 100%)',
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
                      border: '1px solid rgba(0, 217, 255, 0.2)',
                    }}
                  >
                    <TrendingUp sx={{ fontSize: 40, color: '#00d9ff' }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="h5"
                      gutterBottom
                      sx={{
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #ffffff 0%, #00d9ff 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      ¿Cómo funciona este análisis?
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 3 }}>
                      Nuestro modelo de inteligencia artificial analiza múltiples factores de tu emprendimiento
                      para predecir su probabilidad de éxito. El análisis considera:
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        {[
                          { text: 'Tu nivel de preparación y experiencia', color: '#00d9ff' },
                          { text: 'Validación de mercado realizada', color: '#22c55e' },
                          { text: 'Plan de negocios y proyecciones', color: '#a855f7' },
                        ].map((item, idx) => (
                          <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: item.color,
                                boxShadow: `0 0 10px ${item.color}`,
                              }}
                            />
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                              {item.text}
                            </Typography>
                          </Box>
                        ))}
                      </Grid>
                      <Grid item xs={12} md={6}>
                        {[
                          { text: 'Relación capital inicial vs financiamiento', color: '#f59e0b' },
                          { text: 'Etapa actual del proyecto', color: '#ff6b9d' },
                          { text: 'Factores específicos del sector culinario', color: '#06b6d4' },
                        ].map((item, idx) => (
                          <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: item.color,
                                boxShadow: `0 0 10px ${item.color}`,
                              }}
                            />
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                              {item.text}
                            </Typography>
                          </Box>
                        ))}
                      </Grid>
                    </Grid>
                    <Alert
                      severity="info"
                      sx={{
                        mt: 3,
                        background: 'rgba(0, 217, 255, 0.1)',
                        border: '1px solid rgba(0, 217, 255, 0.2)',
                        borderRadius: 2,
                        '& .MuiAlert-icon': { color: '#00d9ff' },
                        color: 'rgba(255, 255, 255, 0.9)'
                      }}
                    >
                      <strong>Nota:</strong> Los resultados son orientativos y basados en datos históricos
                      de emprendimientos en Kennedy, Guayaquil. Úsalos como guía para mejorar tu proyecto.
                    </Alert>
                  </Box>
                </Box>
              </Paper>
            </Grow>
          </Grid>

          {/* Gráficos de Análisis */}
          {user?.entrepreneurProfile?.predictionScore && (
            <Grid item xs={12}>
              <Grow in={true} timeout={800}>
                <Box>
                  <PredictionCharts prediction={user.entrepreneurProfile.predictionScore} />
                </Box>
              </Grow>
            </Grid>
          )}

          {/* Tarjeta de Predicción */}
          <Grid item xs={12}>
            <Grow in={true} timeout={1000}>
              <Box>
                <PredictionCard
                  entrepreneurProfile={user?.entrepreneurProfile}
                  showRefreshButton={true}
                />
              </Box>
            </Grow>
          </Grid>

          {/* Acceso rápido a completar perfil */}
          {(!user?.entrepreneurProfile?.sector ||
            !user?.entrepreneurProfile?.stage ||
            !user?.entrepreneurProfile?.fundingNeeded) && (
            <Grid item xs={12}>
              <Grow in={true} timeout={1200}>
                <Paper
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    background: 'rgba(30, 30, 30, 0.6)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: 4,
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: 'linear-gradient(90deg, #f59e0b 0%, #ff6b9d 100%)',
                    }
                  }}
                >
                  <Box
                    sx={{
                      width: 70,
                      height: 70,
                      borderRadius: '50%',
                      background: 'rgba(245, 158, 11, 0.15)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3,
                    }}
                  >
                    <Assessment sx={{ fontSize: 35, color: '#f59e0b' }} />
                  </Box>
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #f59e0b 0%, #ff6b9d 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    ¿Quieres obtener una evaluación más precisa?
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 3, maxWidth: 500, mx: 'auto' }}>
                    Completa toda la información de tu perfil para recibir un análisis
                    detallado con recomendaciones personalizadas.
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/profile')}
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, #f59e0b 0%, #ff6b9d 100%)',
                      boxShadow: '0 4px 20px rgba(245, 158, 11, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #d97706 0%, #e11d48 100%)',
                        boxShadow: '0 6px 30px rgba(245, 158, 11, 0.4)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Completar Perfil
                  </Button>
                </Paper>
              </Grow>
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  );
};

export default AnalysisPage;
