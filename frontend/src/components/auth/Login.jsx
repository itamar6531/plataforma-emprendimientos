import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Login as LoginIcon,
  Email,
  Lock,
  ArrowForward,
  Restaurant,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const theme = useTheme();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData);
      toast.success('Inicio de sesión exitoso');
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err.message || 'Error al iniciar sesión';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
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
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
        },
      }}
    >
      <Container component="main" maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Logo/Icon Section */}
          <Box
            sx={{
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #00d9ff 0%, #a855f7 100%)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Restaurant sx={{ fontSize: 40, color: '#000' }} />
            </Box>
            <Typography
              variant="h5"
              sx={{
                color: 'white',
                fontWeight: 700,
                display: { xs: 'none', sm: 'block' },
              }}
            >
              CookStart
            </Typography>
          </Box>

          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 4 },
              width: '100%',
              borderRadius: 3,
              background: 'rgba(18, 18, 18, 0.8)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            }}
          >
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  p: 2,
                  borderRadius: '50%',
                  bgcolor: alpha('#00d9ff', 0.15),
                  mb: 2,
                }}
              >
                <LoginIcon sx={{ fontSize: 40, color: '#00d9ff' }} />
              </Box>
              <Typography
                component="h1"
                variant="h4"
                sx={{
                  fontWeight: 800,
                  mb: 1,
                  background: 'linear-gradient(135deg, #00d9ff 0%, #ff6b9d 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Iniciar Sesión
              </Typography>
              <Typography variant="body2" sx={{ color: '#a0a0a0' }}>
                Bienvenido de vuelta a CookStart
              </Typography>
            </Box>

            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  bgcolor: alpha('#ef4444', 0.1),
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  '& .MuiAlert-icon': {
                    alignItems: 'center',
                    color: '#ef4444',
                  },
                }}
              >
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Correo Electrónico"
                name="email"
                autoComplete="email"
                autoFocus
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <Email sx={{ mr: 1, color: '#a0a0a0' }} />
                  ),
                }}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(0, 217, 255, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#00d9ff',
                      borderWidth: 2,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#a0a0a0',
                  },
                  '& .MuiInputBase-input': {
                    color: '#fff',
                  },
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Contraseña"
                type="password"
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <Lock sx={{ mr: 1, color: '#a0a0a0' }} />
                  ),
                }}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(0, 217, 255, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#00d9ff',
                      borderWidth: 2,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#a0a0a0',
                  },
                  '& .MuiInputBase-input': {
                    color: '#fff',
                  },
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                endIcon={!loading && <ArrowForward />}
                disabled={loading}
                sx={{
                  mt: 2,
                  mb: 3,
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #00d9ff 0%, #a855f7 100%)',
                  color: '#000',
                  boxShadow: '0 4px 14px rgba(0, 217, 255, 0.3)',
                  '&:hover': {
                    boxShadow: '0 6px 20px rgba(0, 217, 255, 0.5)',
                    transform: 'translateY(-2px)',
                  },
                  '&:disabled': {
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#666',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: '#fff' }} />
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>
              <Box sx={{ textAlign: 'center' }}>
                <Link
                  to="/register"
                  style={{
                    textDecoration: 'none',
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#a0a0a0',
                      '&:hover': {
                        color: '#00d9ff',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    ¿No tienes cuenta?{' '}
                    <Box component="span" sx={{ fontWeight: 700, color: '#00d9ff' }}>
                      Regístrate aquí
                    </Box>
                  </Typography>
                </Link>
              </Box>
            </Box>
          </Paper>

          {/* Back to Home Link */}
          <Button
            onClick={() => navigate('/')}
            sx={{
              mt: 3,
              color: '#a0a0a0',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                color: '#fff',
              },
            }}
          >
            ← Volver al inicio
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;
