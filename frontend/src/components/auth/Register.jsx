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
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  alpha,
  useTheme,
  Grid,
} from '@mui/material';
import {
  PersonAdd,
  Person,
  Email,
  Lock,
  LockOutlined,
  ArrowForward,
  Restaurant,
  Business,
  AccountBalance,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const theme = useTheme();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    tipoUsuario: 'emprendedor',
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

  const validateForm = () => {
    if (!formData.nombre || !formData.email || !formData.password) {
      setError('Todos los campos son obligatorios');
      return false;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Ingrese un correo electrónico válido');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      toast.success('Registro exitoso');
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err.message || 'Error al registrarse';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const inputStyles = {
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
      paddingLeft: '4px !important',
    },
    '& .MuiInputAdornment-root': {
      marginRight: '8px',
    },
    '& .MuiFormHelperText-root': {
      color: '#a0a0a0',
    },
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        py: 4,
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -150,
          right: -150,
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 107, 157, 0.15) 0%, transparent 70%)',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: -150,
          left: -150,
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 217, 255, 0.15) 0%, transparent 70%)',
        },
      }}
    >
      <Container component="main" maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
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
                background: 'linear-gradient(135deg, #ff6b9d 0%, #a855f7 100%)',
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
                  bgcolor: alpha('#ff6b9d', 0.15),
                  mb: 2,
                }}
              >
                <PersonAdd sx={{ fontSize: 40, color: '#ff6b9d' }} />
              </Box>
              <Typography
                component="h1"
                variant="h4"
                sx={{
                  fontWeight: 800,
                  mb: 1,
                  background: 'linear-gradient(135deg, #ff6b9d 0%, #a855f7 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Crear Cuenta
              </Typography>
              <Typography variant="body2" sx={{ color: '#a0a0a0' }}>
                Únete a CookStart y emprende en el mundo culinario
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

            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="nombre"
                    label="Nombre Completo"
                    name="nombre"
                    autoComplete="name"
                    autoFocus
                    value={formData.nombre}
                    onChange={handleChange}
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <Person sx={{ color: '#a0a0a0', fontSize: 20 }} />
                      ),
                    }}
                    sx={inputStyles}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    label="Correo Electrónico"
                    name="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <Email sx={{ color: '#a0a0a0', fontSize: 20 }} />
                      ),
                    }}
                    sx={inputStyles}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    name="password"
                    label="Contraseña"
                    type="password"
                    id="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    helperText="Mínimo 6 caracteres"
                    InputProps={{
                      startAdornment: (
                        <Lock sx={{ color: '#a0a0a0', fontSize: 20 }} />
                      ),
                    }}
                    sx={inputStyles}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    name="confirmPassword"
                    label="Confirmar Contraseña"
                    type="password"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <LockOutlined sx={{ color: '#a0a0a0', fontSize: 20 }} />
                      ),
                    }}
                    sx={inputStyles}
                  />
                </Grid>
              </Grid>

              <FormControl
                component="fieldset"
                sx={{
                  mt: 3,
                  mb: 2,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  width: '100%',
                }}
              >
                <FormLabel
                  component="legend"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    color: '#fff',
                  }}
                >
                  Tipo de Usuario
                </FormLabel>
                <RadioGroup
                  row
                  name="tipoUsuario"
                  value={formData.tipoUsuario}
                  onChange={handleChange}
                  sx={{ justifyContent: 'space-around' }}
                >
                  <FormControlLabel
                    value="emprendedor"
                    control={
                      <Radio
                        sx={{
                          color: '#a0a0a0',
                          '&.Mui-checked': {
                            color: '#00d9ff',
                          },
                        }}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Business sx={{ color: formData.tipoUsuario === 'emprendedor' ? '#00d9ff' : '#a0a0a0' }} />
                        <Typography fontWeight={600} sx={{ color: formData.tipoUsuario === 'emprendedor' ? '#fff' : '#a0a0a0' }}>
                          Emprendedor
                        </Typography>
                      </Box>
                    }
                    disabled={loading}
                    sx={{
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      border: `2px solid ${
                        formData.tipoUsuario === 'emprendedor'
                          ? '#00d9ff'
                          : 'rgba(255, 255, 255, 0.1)'
                      }`,
                      bgcolor:
                        formData.tipoUsuario === 'emprendedor'
                          ? alpha('#00d9ff', 0.1)
                          : 'transparent',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: alpha('#00d9ff', 0.05),
                        borderColor: alpha('#00d9ff', 0.5),
                      },
                    }}
                  />
                  <FormControlLabel
                    value="inversionista"
                    control={
                      <Radio
                        sx={{
                          color: '#a0a0a0',
                          '&.Mui-checked': {
                            color: '#ff6b9d',
                          },
                        }}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccountBalance sx={{ color: formData.tipoUsuario === 'inversionista' ? '#ff6b9d' : '#a0a0a0' }} />
                        <Typography fontWeight={600} sx={{ color: formData.tipoUsuario === 'inversionista' ? '#fff' : '#a0a0a0' }}>
                          Inversionista
                        </Typography>
                      </Box>
                    }
                    disabled={loading}
                    sx={{
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      border: `2px solid ${
                        formData.tipoUsuario === 'inversionista'
                          ? '#ff6b9d'
                          : 'rgba(255, 255, 255, 0.1)'
                      }`,
                      bgcolor:
                        formData.tipoUsuario === 'inversionista'
                          ? alpha('#ff6b9d', 0.1)
                          : 'transparent',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: alpha('#ff6b9d', 0.05),
                        borderColor: alpha('#ff6b9d', 0.5),
                      },
                    }}
                  />
                </RadioGroup>
              </FormControl>

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
                  background: 'linear-gradient(135deg, #ff6b9d 0%, #a855f7 100%)',
                  color: '#000',
                  boxShadow: '0 4px 14px rgba(255, 107, 157, 0.3)',
                  '&:hover': {
                    boxShadow: '0 6px 20px rgba(255, 107, 157, 0.5)',
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
                  'Crear Cuenta'
                )}
              </Button>
              <Box sx={{ textAlign: 'center' }}>
                <Link
                  to="/login"
                  style={{
                    textDecoration: 'none',
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#a0a0a0',
                      '&:hover': {
                        color: '#ff6b9d',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    ¿Ya tienes cuenta?{' '}
                    <Box component="span" sx={{ fontWeight: 700, color: '#ff6b9d' }}>
                      Inicia sesión aquí
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

export default Register;
