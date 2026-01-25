import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  MenuItem,
  InputAdornment,
  Paper,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  Chip,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  LinearProgress
} from '@mui/material';
import {
  AccountBalance,
  AttachMoney,
  LocationOn,
  Phone,
  TrendingUp,
  People,
  BusinessCenter,
  Savings,
  ShowChart
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import userService from '../../services/userService';

const validationSchema = Yup.object({
  name: Yup.string()
    .required('El nombre es requerido')
    .max(100, 'Máximo 100 caracteres'),
  phone: Yup.string()
    .matches(/^[0-9+\-\s()]*$/, 'Número de teléfono inválido'),
  location: Yup.string(),
  bio: Yup.string()
    .max(500, 'Máximo 500 caracteres'),
  investmentInterests: Yup.string()
    .max(1000, 'Máximo 1000 caracteres'),
  investmentRangeMin: Yup.number()
    .min(0, 'El monto debe ser mayor a 0')
    .nullable(),
  investmentRangeMax: Yup.number()
    .min(0, 'El monto debe ser mayor a 0')
    .nullable()
    .test('is-greater', 'El máximo debe ser mayor al mínimo', function(value) {
      const { investmentRangeMin } = this.parent;
      if (!value || !investmentRangeMin) return true;
      return value >= investmentRangeMin;
    }),
  sectorsOfInterest: Yup.array()
    .min(1, 'Selecciona al menos un sector'),
  yearsExperience: Yup.number()
    .min(0, 'Debe ser mayor o igual a 0')
    .nullable(),
  numberOfInvestments: Yup.number()
    .min(0, 'Debe ser mayor o igual a 0')
    .nullable(),
  investorType: Yup.string()
    .oneOf(['angel', 'venture_capital', 'private_equity', 'individual', 'otro'], 'Selecciona un tipo válido'),
  partnershipType: Yup.string()
    .oneOf(['activo', 'pasivo', 'ambos'], 'Selecciona un tipo válido')
});

const SECTOR_OPTIONS = [
  'culinario',
  'restaurante',
  'cafeteria',
  'food-truck',
  'catering',
  'panaderia',
  'bebidas',
  'otro'
];

const InvestorProfileForm = ({ user, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formik = useFormik({
    initialValues: {
      // Datos base del usuario
      name: user.name || '',
      phone: user.phone || '',
      location: 'Kennedy, Guayaquil',
      bio: user.bio || '',

      // Datos del perfil de inversionista
      investmentInterests: user.investorProfile?.investmentInterests || '',
      investmentRangeMin: user.investorProfile?.investmentRange?.min || '',
      investmentRangeMax: user.investorProfile?.investmentRange?.max || '',
      sectorsOfInterest: user.investorProfile?.sectorsOfInterest || ['culinario'],
      yearsExperience: user.investorProfile?.yearsExperience || '',
      numberOfInvestments: user.investorProfile?.numberOfInvestments || '',
      investorType: user.investorProfile?.investorType || '',
      partnershipType: user.investorProfile?.partnershipType || ''
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError('');

      try {
        // Formatear datos para el backend
        const profileData = {
          ...values,
          investmentRange: {
            min: values.investmentRangeMin || 0,
            max: values.investmentRangeMax || undefined
          }
        };

        // Remover campos temporales
        delete profileData.investmentRangeMin;
        delete profileData.investmentRangeMax;

        const response = await userService.updateProfile(profileData);
        toast.success('Perfil actualizado exitosamente');

        // Llamar callback para actualizar el usuario en el contexto
        if (onUpdate) {
          onUpdate(response.data); // Backend retorna { success: true, message: ..., data: user }
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Error al actualizar el perfil';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  });

  // Calcular completitud del perfil
  const calculateCompleteness = () => {
    const fields = [
      'investmentInterests',
      'investmentRangeMin',
      'sectorsOfInterest',
      'yearsExperience',
      'numberOfInvestments',
      'investorType',
      'partnershipType'
    ];

    const filled = fields.filter(field => {
      const value = formik.values[field];
      if (Array.isArray(value)) return value.length > 0;
      return Boolean(value);
    }).length;

    return Math.round((filled / fields.length) * 100);
  };

  const completeness = calculateCompleteness();

  return (
    <Box>
      {/* Header con porcentaje de completitud */}
      <Card
        sx={{
          mb: 4,
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(0, 217, 255, 0.1) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          borderRadius: 4,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(90deg, #22c55e 0%, #00d9ff 50%, #10b981 100%)',
          }
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(0, 217, 255, 0.2) 100%)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
              }}
            >
              <Savings sx={{ fontSize: 32, color: '#22c55e' }} />
            </Box>
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #22c55e 0%, #00d9ff 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Perfil de Inversionista
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                Configura tus intereses para conectar con emprendedores
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Progreso del perfil
                </Typography>
                <Chip
                  label={`${completeness}%`}
                  size="small"
                  sx={{
                    background: completeness >= 80 ? 'rgba(34, 197, 94, 0.2)' : completeness >= 50 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    border: `1px solid ${completeness >= 80 ? 'rgba(34, 197, 94, 0.5)' : completeness >= 50 ? 'rgba(245, 158, 11, 0.5)' : 'rgba(239, 68, 68, 0.5)'}`,
                    color: completeness >= 80 ? '#22c55e' : completeness >= 50 ? '#f59e0b' : '#ef4444',
                    fontWeight: 700,
                  }}
                />
              </Box>
              <LinearProgress
                variant="determinate"
                value={completeness}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    background: completeness >= 80
                      ? 'linear-gradient(90deg, #22c55e 0%, #10b981 100%)'
                      : completeness >= 50
                        ? 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)'
                        : 'linear-gradient(90deg, #22c55e 0%, #00d9ff 100%)',
                  }
                }}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={formik.handleSubmit}>
        {/* Información Personal */}
        <Paper
          sx={{
            p: 4,
            mb: 3,
            background: 'rgba(30, 30, 30, 0.6)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0, 217, 255, 0.15)',
            borderRadius: 4,
            transition: 'all 0.3s ease',
            '&:hover': {
              border: '1px solid rgba(0, 217, 255, 0.3)',
              boxShadow: '0 0 20px rgba(0, 217, 255, 0.1)',
            }
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              fontWeight: 700,
              color: '#00d9ff'
            }}
          >
            <Box
              sx={{
                p: 1,
                borderRadius: 2,
                background: 'rgba(0, 217, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <People sx={{ color: '#00d9ff' }} />
            </Box>
            Información Personal
          </Typography>
          <Divider sx={{ mb: 3, borderColor: 'rgba(0, 217, 255, 0.2)' }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre Completo"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Teléfono"
                name="phone"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                helperText={formik.touched.phone && formik.errors.phone}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Ubicación"
                name="location"
                value={formik.values.location}
                disabled
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn />
                    </InputAdornment>
                  )
                }}
                helperText="Plataforma disponible únicamente en el sector Kennedy"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Biografía"
                name="bio"
                value={formik.values.bio}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.bio && Boolean(formik.errors.bio)}
                helperText={
                  (formik.touched.bio && formik.errors.bio) ||
                  `${formik.values.bio.length}/500 caracteres`
                }
                placeholder="Cuéntanos sobre tu experiencia como inversionista..."
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Perfil de Inversión */}
        <Paper
          sx={{
            p: 4,
            mb: 3,
            background: 'rgba(30, 30, 30, 0.6)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(34, 197, 94, 0.15)',
            borderRadius: 4,
            transition: 'all 0.3s ease',
            '&:hover': {
              border: '1px solid rgba(34, 197, 94, 0.3)',
              boxShadow: '0 0 20px rgba(34, 197, 94, 0.1)',
            }
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              fontWeight: 700,
              color: '#22c55e'
            }}
          >
            <Box
              sx={{
                p: 1,
                borderRadius: 2,
                background: 'rgba(34, 197, 94, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShowChart sx={{ color: '#22c55e' }} />
            </Box>
            Perfil de Inversión
          </Typography>
          <Divider sx={{ mb: 3, borderColor: 'rgba(34, 197, 94, 0.2)' }} />

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Intereses de Inversión"
                name="investmentInterests"
                value={formik.values.investmentInterests}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.investmentInterests && Boolean(formik.errors.investmentInterests)}
                helperText={
                  (formik.touched.investmentInterests && formik.errors.investmentInterests) ||
                  `${formik.values.investmentInterests.length}/1000 caracteres`
                }
                placeholder="Describe qué tipo de proyectos te interesan, qué buscas en un emprendimiento, etc."
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Inversión Mínima (USD)"
                name="investmentRangeMin"
                value={formik.values.investmentRangeMin}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.investmentRangeMin && Boolean(formik.errors.investmentRangeMin)}
                helperText={formik.touched.investmentRangeMin && formik.errors.investmentRangeMin}
                placeholder="Ej: 10000"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoney />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Inversión Máxima (USD)"
                name="investmentRangeMax"
                value={formik.values.investmentRangeMax}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.investmentRangeMax && Boolean(formik.errors.investmentRangeMax)}
                helperText={formik.touched.investmentRangeMax && formik.errors.investmentRangeMax}
                placeholder="Ej: 100000"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoney />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Sectores de Interés</InputLabel>
                <Select
                  multiple
                  name="sectorsOfInterest"
                  value={formik.values.sectorsOfInterest}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  input={<OutlinedInput label="Sectores de Interés" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                  error={formik.touched.sectorsOfInterest && Boolean(formik.errors.sectorsOfInterest)}
                >
                  {SECTOR_OPTIONS.map((sector) => (
                    <MenuItem key={sector} value={sector}>
                      {sector.charAt(0).toUpperCase() + sector.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.sectorsOfInterest && formik.errors.sectorsOfInterest && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                    {formik.errors.sectorsOfInterest}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Tipo de Inversionista"
                name="investorType"
                value={formik.values.investorType}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.investorType && Boolean(formik.errors.investorType)}
                helperText={formik.touched.investorType && formik.errors.investorType}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessCenter />
                    </InputAdornment>
                  )
                }}
              >
                <MenuItem value="angel">Inversionista Ángel</MenuItem>
                <MenuItem value="venture_capital">Venture Capital</MenuItem>
                <MenuItem value="private_equity">Private Equity</MenuItem>
                <MenuItem value="individual">Inversionista Individual</MenuItem>
                <MenuItem value="otro">Otro</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Tipo de Participación"
                name="partnershipType"
                value={formik.values.partnershipType}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.partnershipType && Boolean(formik.errors.partnershipType)}
                helperText={formik.touched.partnershipType && formik.errors.partnershipType}
              >
                <MenuItem value="activo">Activo (participación en decisiones)</MenuItem>
                <MenuItem value="pasivo">Pasivo (solo inversión financiera)</MenuItem>
                <MenuItem value="ambos">Ambos (flexible)</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Años de Experiencia Invirtiendo"
                name="yearsExperience"
                value={formik.values.yearsExperience}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.yearsExperience && Boolean(formik.errors.yearsExperience)}
                helperText={formik.touched.yearsExperience && formik.errors.yearsExperience}
                placeholder="0 si eres nuevo inversionista"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TrendingUp />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Número de Inversiones Previas"
                name="numberOfInvestments"
                value={formik.values.numberOfInvestments}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.numberOfInvestments && Boolean(formik.errors.numberOfInvestments)}
                helperText={formik.touched.numberOfInvestments && formik.errors.numberOfInvestments}
                placeholder="0 si es tu primera inversión"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TrendingUp />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Botones de acción */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{
              px: 5,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #22c55e 0%, #00d9ff 100%)',
              boxShadow: '0 4px 20px rgba(34, 197, 94, 0.3)',
              borderRadius: 3,
              '&:hover': {
                background: 'linear-gradient(135deg, #16a34a 0%, #00c4e6 100%)',
                boxShadow: '0 6px 30px rgba(34, 197, 94, 0.4)',
                transform: 'translateY(-2px)',
              },
              '&:disabled': {
                background: 'rgba(34, 197, 94, 0.3)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1, color: 'white' }} />
                Guardando...
              </>
            ) : (
              'Guardar Perfil'
            )}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default InvestorProfileForm;
