import { useState, useEffect } from 'react';
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
  LinearProgress,
  Chip
} from '@mui/material';
import {
  Business,
  AttachMoney,
  LocationOn,
  Phone,
  Description,
  People,
  TrendingUp,
  School,
  CheckCircle,
  Lightbulb,
  RocketLaunch,
  Analytics
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import userService from '../../services/userService';
import predictionService from '../../services/predictionService';

const validationSchema = Yup.object({
  name: Yup.string()
    .required('El nombre es requerido')
    .max(100, 'Máximo 100 caracteres'),
  phone: Yup.string()
    .matches(/^[0-9+\-\s()]*$/, 'Número de teléfono inválido'),
  location: Yup.string(),
  bio: Yup.string()
    .max(500, 'Máximo 500 caracteres'),
  projectName: Yup.string()
    .max(150, 'Máximo 150 caracteres'),
  projectDescription: Yup.string()
    .max(2000, 'Máximo 2000 caracteres'),
  sector: Yup.string()
    .required('El sector es requerido'),
  fundingNeeded: Yup.number()
    .min(0, 'El monto debe ser mayor a 0')
    .nullable(),
  stage: Yup.string()
    .oneOf(['idea', 'desarrollo', 'operando'], 'Selecciona una etapa válida'),
  yearsInBusiness: Yup.number()
    .min(0, 'Debe ser mayor o igual a 0')
    .nullable(),
  numberOfEmployees: Yup.number()
    .min(0, 'Debe ser mayor o igual a 0')
    .nullable(),
  businessLocation: Yup.string(),
  // Campos para modelo predictivo
  educationLevel: Yup.string()
    .oneOf(['secundaria', 'tecnico', 'universitario', 'postgrado'], 'Selecciona un nivel válido'),
  previousExperienceYears: Yup.number()
    .min(0, 'Debe ser mayor o igual a 0')
    .nullable(),
  hasBusinessPlan: Yup.boolean(),
  marketValidationLevel: Yup.string()
    .oneOf(['ninguna', 'encuestas', 'mvp', 'clientes_activos'], 'Selecciona un nivel válido'),
  initialCapital: Yup.number()
    .min(0, 'Debe ser mayor o igual a 0')
    .nullable(),
  projectedMonthlyRevenue: Yup.number()
    .min(0, 'Debe ser mayor o igual a 0')
    .nullable()
});

const EntrepreneurProfileForm = ({ user, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formik = useFormik({
    initialValues: {
      // Datos base del usuario
      name: user.name || '',
      phone: user.phone || '',
      location: 'Kennedy, Guayaquil',
      bio: user.bio || '',

      // Datos del perfil de emprendedor
      projectName: user.entrepreneurProfile?.projectName || '',
      projectDescription: user.entrepreneurProfile?.projectDescription || '',
      sector: user.entrepreneurProfile?.sector || 'restaurante',
      fundingNeeded: user.entrepreneurProfile?.fundingNeeded || '',
      stage: user.entrepreneurProfile?.stage || '',
      yearsInBusiness: user.entrepreneurProfile?.yearsInBusiness || '',
      numberOfEmployees: user.entrepreneurProfile?.numberOfEmployees || '',
      businessLocation: 'Kennedy, Guayaquil',

      // Campos para modelo predictivo
      educationLevel: user.entrepreneurProfile?.educationLevel || 'secundaria',
      previousExperienceYears: user.entrepreneurProfile?.previousExperienceYears || 0,
      hasBusinessPlan: user.entrepreneurProfile?.hasBusinessPlan || false,
      marketValidationLevel: user.entrepreneurProfile?.marketValidationLevel || 'ninguna',
      initialCapital: user.entrepreneurProfile?.initialCapital || 0,
      projectedMonthlyRevenue: user.entrepreneurProfile?.projectedMonthlyRevenue || 0
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError('');

      try {
        const response = await userService.updateProfile(values);
        toast.success('Perfil actualizado exitosamente');

        // Llamar callback para actualizar el usuario en el contexto
        if (onUpdate) {
          onUpdate(response.data); // Backend retorna { success: true, message: ..., data: user }
        }

        // Recalcular predicción automáticamente si el perfil tiene los campos necesarios
        const hasRequiredFields = values.sector && values.stage &&
                                  values.fundingNeeded && values.educationLevel;

        if (hasRequiredFields) {
          try {
            toast.info('Recalculando predicción de éxito...', { autoClose: 2000 });
            await predictionService.getMyPrediction();
            toast.success('Predicción actualizada', { autoClose: 2000 });

            // Recargar el perfil actualizado con la nueva predicción
            const updatedProfile = await userService.getMyProfile();
            if (onUpdate) {
              onUpdate(updatedProfile.data);
            }
          } catch (predError) {
            console.log('No se pudo recalcular la predicción:', predError.response?.data?.message);
            // No mostrar error al usuario, la predicción se puede actualizar manualmente
          }
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
      'projectName',
      'projectDescription',
      'sector',
      'fundingNeeded',
      'stage',
      'yearsInBusiness',
      'numberOfEmployees',
      'businessLocation'
    ];

    const filled = fields.filter(field => formik.values[field]).length;
    return Math.round((filled / fields.length) * 100);
  };

  const completeness = calculateCompleteness();

  return (
    <Box>
      {/* Header con porcentaje de completitud */}
      <Card
        sx={{
          mb: 4,
          background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(0, 217, 255, 0.1) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(168, 85, 247, 0.3)',
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
            background: 'linear-gradient(90deg, #a855f7 0%, #00d9ff 50%, #ff6b9d 100%)',
          }
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(0, 217, 255, 0.2) 100%)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
              }}
            >
              <RocketLaunch sx={{ fontSize: 32, color: '#a855f7' }} />
            </Box>
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #a855f7 0%, #00d9ff 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Perfil de Emprendedor
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                Completa tu información para conectar con inversionistas
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
                        : 'linear-gradient(90deg, #a855f7 0%, #00d9ff 100%)',
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
                placeholder="Cuéntanos sobre ti..."
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Información del Proyecto */}
        <Paper
          sx={{
            p: 4,
            mb: 3,
            background: 'rgba(30, 30, 30, 0.6)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(168, 85, 247, 0.15)',
            borderRadius: 4,
            transition: 'all 0.3s ease',
            '&:hover': {
              border: '1px solid rgba(168, 85, 247, 0.3)',
              boxShadow: '0 0 20px rgba(168, 85, 247, 0.1)',
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
              color: '#a855f7'
            }}
          >
            <Box
              sx={{
                p: 1,
                borderRadius: 2,
                background: 'rgba(168, 85, 247, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Business sx={{ color: '#a855f7' }} />
            </Box>
            Información del Proyecto
          </Typography>
          <Divider sx={{ mb: 3, borderColor: 'rgba(168, 85, 247, 0.2)' }} />

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre del Proyecto"
                name="projectName"
                value={formik.values.projectName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.projectName && Boolean(formik.errors.projectName)}
                helperText={formik.touched.projectName && formik.errors.projectName}
                placeholder="Ej: Restaurante de comida fusión"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Descripción del Proyecto"
                name="projectDescription"
                value={formik.values.projectDescription}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.projectDescription && Boolean(formik.errors.projectDescription)}
                helperText={
                  (formik.touched.projectDescription && formik.errors.projectDescription) ||
                  `${formik.values.projectDescription.length}/2000 caracteres`
                }
                placeholder="Describe tu proyecto, tu propuesta de valor, mercado objetivo, etc."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Description />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Sector"
                name="sector"
                value={formik.values.sector}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.sector && Boolean(formik.errors.sector)}
                helperText={formik.touched.sector && formik.errors.sector}
              >
                <MenuItem value="restaurante">Restaurante</MenuItem>
                <MenuItem value="cafeteria">Cafetería</MenuItem>
                <MenuItem value="food-truck">Food Truck</MenuItem>
                <MenuItem value="catering">Catering</MenuItem>
                <MenuItem value="panaderia">Panadería/Pastelería</MenuItem>
                <MenuItem value="otro">Otro</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Etapa del Proyecto"
                name="stage"
                value={formik.values.stage}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.stage && Boolean(formik.errors.stage)}
                helperText={formik.touched.stage && formik.errors.stage}
              >
                <MenuItem value="idea">Idea</MenuItem>
                <MenuItem value="desarrollo">En Desarrollo</MenuItem>
                <MenuItem value="operando">Operando</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Financiamiento Necesario (USD)"
                name="fundingNeeded"
                value={formik.values.fundingNeeded}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.fundingNeeded && Boolean(formik.errors.fundingNeeded)}
                helperText={formik.touched.fundingNeeded && formik.errors.fundingNeeded}
                placeholder="Ej: 50000"
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
                label="Ubicación del Negocio"
                name="businessLocation"
                value={formik.values.businessLocation}
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

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Años en el Negocio"
                name="yearsInBusiness"
                value={formik.values.yearsInBusiness}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.yearsInBusiness && Boolean(formik.errors.yearsInBusiness)}
                helperText={formik.touched.yearsInBusiness && formik.errors.yearsInBusiness}
                placeholder="0 si es nueva idea"
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
                label="Número de Empleados"
                name="numberOfEmployees"
                value={formik.values.numberOfEmployees}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.numberOfEmployees && Boolean(formik.errors.numberOfEmployees)}
                helperText={formik.touched.numberOfEmployees && formik.errors.numberOfEmployees}
                placeholder="0 si aún no hay empleados"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <People />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Información para Modelo Predictivo */}
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
              <Analytics sx={{ color: '#22c55e' }} />
            </Box>
            Información para Evaluación IA
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 3, ml: 6 }}>
            Estos datos alimentan nuestro modelo de inteligencia artificial para evaluar el potencial de éxito
          </Typography>
          <Divider sx={{ mb: 3, borderColor: 'rgba(34, 197, 94, 0.2)' }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Nivel Educativo"
                name="educationLevel"
                value={formik.values.educationLevel}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.educationLevel && Boolean(formik.errors.educationLevel)}
                helperText={formik.touched.educationLevel && formik.errors.educationLevel}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <School />
                    </InputAdornment>
                  )
                }}
              >
                <MenuItem value="secundaria">Secundaria</MenuItem>
                <MenuItem value="tecnico">Técnico/Tecnólogo</MenuItem>
                <MenuItem value="universitario">Universitario</MenuItem>
                <MenuItem value="postgrado">Postgrado</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Años de Experiencia en el Sector"
                name="previousExperienceYears"
                value={formik.values.previousExperienceYears}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.previousExperienceYears && Boolean(formik.errors.previousExperienceYears)}
                helperText={formik.touched.previousExperienceYears && formik.errors.previousExperienceYears}
                placeholder="0 si no tienes experiencia"
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
                select
                label="¿Tienes Plan de Negocios?"
                name="hasBusinessPlan"
                value={String(formik.values.hasBusinessPlan)}
                onChange={(e) => formik.setFieldValue('hasBusinessPlan', e.target.value === 'true')}
                onBlur={formik.handleBlur}
                error={formik.touched.hasBusinessPlan && Boolean(formik.errors.hasBusinessPlan)}
                helperText={formik.touched.hasBusinessPlan && formik.errors.hasBusinessPlan}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CheckCircle />
                    </InputAdornment>
                  )
                }}
              >
                <MenuItem value="false">No</MenuItem>
                <MenuItem value="true">Sí</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Nivel de Validación de Mercado"
                name="marketValidationLevel"
                value={formik.values.marketValidationLevel}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.marketValidationLevel && Boolean(formik.errors.marketValidationLevel)}
                helperText={formik.touched.marketValidationLevel && formik.errors.marketValidationLevel}
              >
                <MenuItem value="ninguna">Ninguna</MenuItem>
                <MenuItem value="encuestas">Encuestas a clientes potenciales</MenuItem>
                <MenuItem value="mvp">MVP (Producto Mínimo Viable)</MenuItem>
                <MenuItem value="clientes_activos">Ya tengo clientes activos</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Capital Inicial Disponible (USD)"
                name="initialCapital"
                value={formik.values.initialCapital}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.initialCapital && Boolean(formik.errors.initialCapital)}
                helperText={formik.touched.initialCapital && formik.errors.initialCapital}
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
                label="Ingresos Mensuales Proyectados (USD)"
                name="projectedMonthlyRevenue"
                value={formik.values.projectedMonthlyRevenue}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.projectedMonthlyRevenue && Boolean(formik.errors.projectedMonthlyRevenue)}
                helperText={formik.touched.projectedMonthlyRevenue && formik.errors.projectedMonthlyRevenue}
                placeholder="Ej: 5000"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoney />
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
              background: 'linear-gradient(135deg, #a855f7 0%, #00d9ff 100%)',
              boxShadow: '0 4px 20px rgba(168, 85, 247, 0.3)',
              borderRadius: 3,
              '&:hover': {
                background: 'linear-gradient(135deg, #9333ea 0%, #00c4e6 100%)',
                boxShadow: '0 6px 30px rgba(168, 85, 247, 0.4)',
                transform: 'translateY(-2px)',
              },
              '&:disabled': {
                background: 'rgba(168, 85, 247, 0.3)',
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

export default EntrepreneurProfileForm;
