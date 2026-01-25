import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  Button,
  CircularProgress,
  alpha,
  useTheme
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Warning,
  Lightbulb,
  AutoGraph
} from '@mui/icons-material';
import { useState } from 'react';
import predictionService from '../../services/predictionService';

const PredictionCard = ({ entrepreneurProfile, showRefreshButton = true }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(entrepreneurProfile?.predictionScore);
  const [error, setError] = useState('');

  const getScoreColor = (score) => {
    if (score >= 70) return '#22c55e';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const getClassificationChip = (classification) => {
    const config = {
      'ALTO': { color: '#22c55e', icon: <TrendingUp sx={{ color: '#22c55e' }} /> },
      'MEDIO': { color: '#f59e0b', icon: <AutoGraph sx={{ color: '#f59e0b' }} /> },
      'BAJO': { color: '#ef4444', icon: <TrendingDown sx={{ color: '#ef4444' }} /> }
    };

    const { color, icon } = config[classification] || config['MEDIO'];

    return (
      <Chip
        label={`Potencial ${classification}`}
        icon={icon}
        size="medium"
        sx={{
          fontWeight: 'bold',
          bgcolor: alpha(color, 0.15),
          color: color,
          border: `1px solid ${alpha(color, 0.3)}`
        }}
      />
    );
  };

  const refreshPrediction = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await predictionService.getMyPrediction();

      setPrediction({
        successScore: response.data.success_score,
        classification: response.data.classification,
        keyFactors: response.data.key_factors,
        recommendations: response.data.recommendations,
        lastUpdated: new Date()
      });

    } catch (err) {
      setError(err.response?.data?.message || 'Error al obtener predicción');
    } finally {
      setLoading(false);
    }
  };

  if (!prediction || !prediction.successScore) {
    return (
      <Card
        sx={{
          mb: 0,
          borderRadius: 3,
          bgcolor: '#121212',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ color: '#fff', fontWeight: 700 }}>
            Evaluación de Potencial de Éxito
          </Typography>
          <Alert
            severity="info"
            sx={{
              mt: 2,
              bgcolor: alpha('#00d9ff', 0.1),
              color: '#00d9ff',
              border: '1px solid rgba(0, 217, 255, 0.3)',
              '& .MuiAlert-icon': {
                color: '#00d9ff'
              }
            }}
          >
            Completa tu perfil con toda la información para obtener una evaluación de potencial de éxito basada en inteligencia artificial.
          </Alert>
          {showRefreshButton && (
            <Button
              variant="contained"
              onClick={refreshPrediction}
              disabled={loading}
              sx={{
                mt: 2,
                background: 'linear-gradient(135deg, #00d9ff 0%, #a855f7 100%)',
                color: '#000',
                fontWeight: 700,
                '&:hover': {
                  boxShadow: '0 6px 20px rgba(0, 217, 255, 0.4)'
                }
              }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: '#000' }} /> : 'Evaluar Ahora'}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const { successScore, classification, keyFactors, recommendations, lastUpdated } = prediction;
  const scoreColor = getScoreColor(successScore);

  return (
    <Card
      sx={{
        mb: 0,
        borderRadius: 3,
        bgcolor: '#121212',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${scoreColor} 0%, ${alpha(scoreColor, 0.6)} 100%)`,
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>
            Evaluación de Potencial de Éxito
          </Typography>
          {getClassificationChip(classification)}
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 2,
              bgcolor: alpha('#ef4444', 0.1),
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              '& .MuiAlert-icon': {
                color: '#ef4444'
              }
            }}
          >
            {error}
          </Alert>
        )}

        {/* Score Principal con visualización mejorada */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
            {/* Gráfico circular de progreso */}
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <CircularProgress
                variant="determinate"
                value={100}
                size={120}
                thickness={4}
                sx={{ color: alpha(scoreColor, 0.2) }}
              />
              <CircularProgress
                variant="determinate"
                value={successScore}
                size={120}
                thickness={4}
                sx={{
                  color: scoreColor,
                  position: 'absolute',
                  left: 0,
                  [`& .MuiCircularProgress-circle`]: {
                    strokeLinecap: 'round',
                  },
                }}
              />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column'
                }}
              >
                <Typography variant="h4" sx={{ color: scoreColor, fontWeight: 'bold' }}>
                  {successScore.toFixed(1)}%
                </Typography>
              </Box>
            </Box>

            {/* Información del score */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: '#fff' }}>
                Probabilidad de Éxito
              </Typography>
              <Typography variant="body2" sx={{ color: '#a0a0a0', mb: 2 }}>
                Tu emprendimiento tiene un score de <strong style={{ color: '#fff' }}>{successScore.toFixed(1)}%</strong> basado en el análisis de múltiples factores clave.
              </Typography>
              <LinearProgress
                variant="determinate"
                value={successScore}
                sx={{
                  height: 8,
                  borderRadius: 5,
                  backgroundColor: alpha(scoreColor, 0.2),
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: scoreColor,
                    borderRadius: 5
                  }
                }}
              />
              {lastUpdated && (
                <Typography variant="caption" sx={{ mt: 1, display: 'block', color: '#666' }}>
                  Última actualización: {new Date(lastUpdated).toLocaleString()}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        {/* Factores Positivos */}
        {keyFactors?.positive && keyFactors.positive.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1, color: '#fff' }}>
              <CheckCircle sx={{ color: '#22c55e' }} fontSize="small" />
              Fortalezas Identificadas
            </Typography>
            <List dense sx={{ bgcolor: '#1e1e1e', borderRadius: 2, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              {keyFactors.positive.map((factor, index) => (
                <ListItem key={index}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <TrendingUp fontSize="small" sx={{ color: '#22c55e' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={<span style={{ color: '#fff' }}>{factor.factor}</span>}
                    secondary={<span style={{ color: '#a0a0a0' }}>Impacto: +{(factor.impact * 100).toFixed(0)}%</span>}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Factores Negativos */}
        {keyFactors?.negative && keyFactors.negative.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1, color: '#fff' }}>
              <Warning sx={{ color: '#f59e0b' }} fontSize="small" />
              Áreas de Mejora
            </Typography>
            <List dense sx={{ bgcolor: '#1e1e1e', borderRadius: 2, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              {keyFactors.negative.map((factor, index) => (
                <ListItem key={index}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <TrendingDown fontSize="small" sx={{ color: '#f59e0b' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={<span style={{ color: '#fff' }}>{factor.factor}</span>}
                    secondary={<span style={{ color: '#a0a0a0' }}>Impacto: {(factor.impact * 100).toFixed(0)}%</span>}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.08)' }} />

        {/* Recomendaciones */}
        {recommendations && recommendations.length > 0 && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1, color: '#fff' }}>
              <Lightbulb sx={{ color: '#00d9ff' }} fontSize="small" />
              Recomendaciones Personalizadas
            </Typography>
            <List dense sx={{ bgcolor: '#1e1e1e', borderRadius: 2, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              {recommendations.map((recommendation, index) => (
                <ListItem key={index} sx={{ alignItems: 'flex-start' }}>
                  <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#00d9ff' }}>
                      {index + 1}.
                    </Typography>
                  </ListItemIcon>
                  <ListItemText
                    primary={<span style={{ color: '#a0a0a0' }}>{recommendation}</span>}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {showRefreshButton && (
          <Button
            variant="outlined"
            onClick={refreshPrediction}
            disabled={loading}
            fullWidth
            sx={{
              mt: 3,
              borderColor: 'rgba(0, 217, 255, 0.3)',
              color: '#00d9ff',
              fontWeight: 700,
              '&:hover': {
                borderColor: '#00d9ff',
                bgcolor: alpha('#00d9ff', 0.1)
              }
            }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: '#00d9ff' }} /> : 'Actualizar Evaluación'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default PredictionCard;
