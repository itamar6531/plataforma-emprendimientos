import { Box, Paper, Typography, Grid, useTheme, alpha, Chip } from '@mui/material';
import {
  DonutLarge,
  RadarOutlined,
  BarChart as BarChartIcon,
  TrendingUp,
  TrendingDown
} from '@mui/icons-material';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  PieChart,
  Pie
} from 'recharts';

const PredictionCharts = ({ prediction }) => {
  const theme = useTheme();

  if (!prediction || !prediction.successScore) {
    return null;
  }

  const { successScore, keyFactors } = prediction;

  // Datos para el gráfico de radar - Dimensiones de evaluación
  const radarData = [
    {
      dimension: 'Preparación',
      value: keyFactors?.positive?.find(f => f.factor.includes('experiencia') || f.factor.includes('educación'))
        ? 85 : 45,
      fullMark: 100,
    },
    {
      dimension: 'Planificación',
      value: keyFactors?.positive?.find(f => f.factor.includes('plan'))
        ? 90 : 35,
      fullMark: 100,
    },
    {
      dimension: 'Validación',
      value: keyFactors?.positive?.find(f => f.factor.includes('validado') || f.factor.includes('MVP'))
        ? 80 : 30,
      fullMark: 100,
    },
    {
      dimension: 'Capital',
      value: keyFactors?.negative?.find(f => f.factor.includes('capital') || f.factor.includes('financiamiento'))
        ? 40 : 75,
      fullMark: 100,
    },
    {
      dimension: 'Equipo',
      value: keyFactors?.positive?.find(f => f.factor.includes('equipo') || f.factor.includes('empleados'))
        ? 70 : 50,
      fullMark: 100,
    },
  ];

  // Datos para el gráfico de barras - Factores de impacto
  const impactData = [
    ...((keyFactors?.positive || []).map(f => ({
      name: f.factor.length > 30 ? f.factor.substring(0, 30) + '...' : f.factor,
      impacto: Math.abs(f.impact * 100),
      tipo: 'Positivo'
    }))),
    ...((keyFactors?.negative || []).map(f => ({
      name: f.factor.length > 30 ? f.factor.substring(0, 30) + '...' : f.factor,
      impacto: Math.abs(f.impact * 100),
      tipo: 'Negativo'
    })))
  ].sort((a, b) => b.impacto - a.impacto).slice(0, 8);

  // Datos para el gráfico de pastel - Distribución del score
  const pieData = [
    { name: 'Probabilidad de Éxito', value: successScore, color: theme.palette.success.main },
    { name: 'Riesgo', value: 100 - successScore, color: theme.palette.error.light }
  ];

  const COLORS = {
    Positivo: theme.palette.success.main,
    Negativo: theme.palette.warning.main
  };

  // Determinar color del score
  const getScoreColor = (score) => {
    if (score >= 70) return '#22c55e';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const scoreColor = getScoreColor(successScore);

  // Custom tooltip para mejor visualización
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            background: 'rgba(20, 20, 20, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0, 217, 255, 0.3)',
            borderRadius: 2,
            p: 2,
          }}
        >
          <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>
            {payload[0].name || payload[0].dataKey}
          </Typography>
          <Typography variant="body2" sx={{ color: '#00d9ff' }}>
            {typeof payload[0].value === 'number' ? `${payload[0].value.toFixed(1)}%` : payload[0].value}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Box>
      <Grid container spacing={2}>
        {/* Gráfico de Pastel - Score general */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              height: '100%',
              background: 'rgba(30, 30, 30, 0.6)',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(scoreColor, 0.3)}`,
              borderRadius: 4,
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              '&:hover': {
                border: `1px solid ${alpha(scoreColor, 0.5)}`,
                boxShadow: `0 0 30px ${alpha(scoreColor, 0.2)}`,
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: `linear-gradient(90deg, ${scoreColor} 0%, #00d9ff 100%)`,
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  background: `${scoreColor}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <DonutLarge sx={{ color: scoreColor, fontSize: 24 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff' }}>
                Score General
              </Typography>
            </Box>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 0 ? scoreColor : 'rgba(255, 255, 255, 0.1)'}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <Box sx={{ textAlign: 'center', mt: -8, position: 'relative', zIndex: 1 }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  color: scoreColor,
                  textShadow: `0 0 20px ${alpha(scoreColor, 0.5)}`,
                }}
              >
                {successScore.toFixed(0)}%
              </Typography>
            </Box>
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Chip
                icon={successScore >= 50 ? <TrendingUp /> : <TrendingDown />}
                label={successScore >= 70 ? 'Alto potencial' : successScore >= 50 ? 'Potencial moderado' : 'Necesita mejoras'}
                size="small"
                sx={{
                  background: `${scoreColor}20`,
                  border: `1px solid ${scoreColor}40`,
                  color: scoreColor,
                  fontWeight: 600,
                  '& .MuiChip-icon': { color: scoreColor }
                }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Gráfico de Radar - Dimensiones */}
        <Grid item xs={12} md={8} sx={{ display: 'flex' }}>
          <Paper
            sx={{
              pt: 3,
              pb: 3,
              pl: 2,
              pr: 1,
              height: '100%',
              width: '100%',
              background: 'rgba(30, 30, 30, 0.6)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(168, 85, 247, 0.2)',
              borderRadius: 4,
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              '&:hover': {
                border: '1px solid rgba(168, 85, 247, 0.4)',
                boxShadow: '0 0 30px rgba(168, 85, 247, 0.15)',
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: 'linear-gradient(90deg, #a855f7 0%, #00d9ff 50%, #ff6b9d 100%)',
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, flexShrink: 0 }}>
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
                <RadarOutlined sx={{ color: '#a855f7', fontSize: 24 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff' }}>
                Evaluación por Dimensiones
              </Typography>
            </Box>
            <Box sx={{ flex: 1, width: '100%', minHeight: 280, overflow: 'hidden' }}>
              <ResponsiveContainer width="100%" height={280}>
              <RadarChart 
                data={radarData}
                margin={{ top: 20, right: 0, bottom: 20, left: 0 }}
              >
                <PolarGrid stroke="rgba(168, 85, 247, 0.2)" />
                <PolarAngleAxis
                  dataKey="dimension"
                  tick={{ fill: 'rgba(255, 255, 255, 0.8)', fontSize: 12, fontWeight: 500 }}
                />
                <Radar
                  name="Tu Puntuación"
                  dataKey="value"
                  stroke="#00d9ff"
                  fill="url(#radarGradient)"
                  fillOpacity={0.6}
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="radarGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#00d9ff" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
              </ResponsiveContainer>
            </Box>
            <Typography variant="caption" sx={{ display: 'block', mt: 1, textAlign: 'center', color: 'rgba(255, 255, 255, 0.5)', flexShrink: 0 }}>
              Visualización de tus fortalezas en diferentes áreas clave
            </Typography>
          </Paper>
        </Grid>

        {/* Gráfico de Barras - Factores de impacto */}
        {impactData.length > 0 && (
          <Grid item xs={12}>
            <Paper
              sx={{
                p: 3,
                background: 'rgba(30, 30, 30, 0.6)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(0, 217, 255, 0.2)',
                borderRadius: 4,
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': {
                  border: '1px solid rgba(0, 217, 255, 0.4)',
                  boxShadow: '0 0 30px rgba(0, 217, 255, 0.1)',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: 'linear-gradient(90deg, #22c55e 0%, #f59e0b 50%, #00d9ff 100%)',
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
                    <BarChartIcon sx={{ color: '#00d9ff', fontSize: 24 }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff' }}>
                    Factores de Mayor Impacto
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: 1, background: '#22c55e' }} />
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Positivo</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: 1, background: '#f59e0b' }} />
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Área de mejora</Typography>
                  </Box>
                </Box>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={impactData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" horizontal={true} vertical={false} />
                  <XAxis
                    type="number"
                    domain={[0, 25]}
                    tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 11 }}
                    axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                    tickLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: 'rgba(255, 255, 255, 0.8)', fontSize: 11 }}
                    width={140}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: 'rgba(0, 217, 255, 0.1)' }}
                  />
                  <Bar dataKey="impacto" name="Impacto" radius={[0, 6, 6, 0]}>
                    {impactData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.tipo === 'Positivo' ? '#22c55e' : '#f59e0b'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <Typography variant="caption" sx={{ display: 'block', mt: 2, textAlign: 'center', color: 'rgba(255, 255, 255, 0.5)' }}>
                Factores ordenados por su influencia en el score de éxito de tu emprendimiento
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default PredictionCharts;
