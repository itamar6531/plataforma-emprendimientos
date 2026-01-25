import {
  Card,
  CardContent,
  Avatar,
  Typography,
  Button,
  Box,
  Chip,
  Grid,
  alpha,
  useTheme
} from '@mui/material';
import {
  Business,
  AccountBalance,
  LocationOn,
  AttachMoney,
  TrendingUp,
  Chat
} from '@mui/icons-material';

const UserCard = ({ user, currentUser, onStartChat }) => {
  const theme = useTheme();

  const isEntrepreneur = user.userType === 'emprendedor';
  const profile = isEntrepreneur ? user.entrepreneurProfile : user.investorProfile;
  const cardColor = isEntrepreneur ? '#00d9ff' : '#ff6b9d';

  const canChat = currentUser.userType !== user.userType;

  const getCompleteness = () => {
    if (isEntrepreneur) {
      const fields = [
        profile?.projectName,
        profile?.projectDescription,
        profile?.sector,
        profile?.fundingNeeded,
        profile?.stage,
        profile?.yearsInBusiness,
        profile?.numberOfEmployees,
        profile?.businessLocation
      ];
      const filled = fields.filter(Boolean).length;
      return Math.round((filled / fields.length) * 100);
    } else {
      const fields = [
        profile?.investmentInterests,
        profile?.investmentRange?.min,
        profile?.sectorsOfInterest?.length,
        profile?.yearsExperience,
        profile?.numberOfInvestments,
        profile?.investorType,
        profile?.partnershipType
      ];
      const filled = fields.filter(Boolean).length;
      return Math.round((filled / fields.length) * 100);
    }
  };

  const completeness = getCompleteness();

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        bgcolor: '#121212',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${cardColor} 0%, ${alpha(cardColor, 0.6)} 100%)`,
        },
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 24px ${alpha(cardColor, 0.25)}`,
          border: `1px solid ${alpha(cardColor, 0.4)}`,
          '& .user-avatar': {
            transform: 'scale(1.05)',
          }
        }
      }}
    >
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
        {/* Header con avatar y nombre */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            className="user-avatar"
            sx={{
              width: 64,
              height: 64,
              bgcolor: alpha(cardColor, 0.2),
              fontSize: '1.8rem',
              fontWeight: 'bold',
              mr: 2,
              color: cardColor,
              border: `2px solid ${alpha(cardColor, 0.3)}`,
              transition: 'transform 0.3s ease'
            }}
          >
            {user.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, color: '#fff' }}>
              {user.name}
            </Typography>
            <Chip
              icon={isEntrepreneur ? <Business sx={{ color: `${cardColor} !important` }} /> : <AccountBalance sx={{ color: `${cardColor} !important` }} />}
              label={isEntrepreneur ? 'Emprendedor' : 'Inversionista'}
              size="small"
              sx={{
                bgcolor: alpha(cardColor, 0.15),
                color: cardColor,
                fontWeight: 600,
                border: `1px solid ${alpha(cardColor, 0.3)}`
              }}
            />
          </Box>
        </Box>

        {/* Barra de completitud */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" sx={{ color: '#a0a0a0' }}>
              Perfil completado
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#fff' }}>
              {completeness}%
            </Typography>
          </Box>
          <Box
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: 'rgba(255, 255, 255, 0.08)',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                height: '100%',
                width: `${completeness}%`,
                bgcolor: cardColor,
                transition: 'width 0.3s ease'
              }}
            />
          </Box>
        </Box>

        {/* Biografía */}
        {user.bio && (
          <Typography
            variant="body2"
            sx={{
              mb: 2,
              color: '#a0a0a0',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {user.bio}
          </Typography>
        )}

        {/* Ubicación */}
        {user.location && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LocationOn sx={{ fontSize: 18, mr: 1, color: '#a0a0a0' }} />
            <Typography variant="body2" sx={{ color: '#a0a0a0' }}>
              {user.location}
            </Typography>
          </Box>
        )}

        {/* Información específica */}
        <Grid container spacing={1} sx={{ mb: 2, flex: 1 }}>
          {isEntrepreneur ? (
            <>
              {profile?.projectName && (
                <Grid item xs={12}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#1e1e1e', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <Typography variant="caption" sx={{ color: '#a0a0a0' }}>
                      Proyecto
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#fff' }}>
                      {profile.projectName}
                    </Typography>
                  </Box>
                </Grid>
              )}
              {profile?.sector && (
                <Grid item xs={6}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#1e1e1e', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <Typography variant="caption" sx={{ color: '#a0a0a0' }}>
                      Sector
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#fff' }}>
                      {profile.sector}
                    </Typography>
                  </Box>
                </Grid>
              )}
              {profile?.fundingNeeded && (
                <Grid item xs={6}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#1e1e1e', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <AttachMoney sx={{ fontSize: 16, mr: 0.5, color: '#22c55e' }} />
                      <Typography variant="caption" sx={{ color: '#a0a0a0' }}>
                        Financiamiento
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#22c55e' }}>
                      ${profile.fundingNeeded.toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
              )}
              {profile?.stage && (
                <Grid item xs={12}>
                  <Chip
                    label={profile.stage === 'idea' ? 'Idea' : profile.stage === 'desarrollo' ? 'En Desarrollo' : 'Operando'}
                    size="small"
                    sx={{
                      bgcolor: alpha('#a855f7', 0.15),
                      color: '#a855f7',
                      border: '1px solid rgba(168, 85, 247, 0.3)'
                    }}
                  />
                </Grid>
              )}
            </>
          ) : (
            <>
              {profile?.investmentRange?.min && (
                <Grid item xs={12}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#1e1e1e', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <AttachMoney sx={{ fontSize: 16, mr: 0.5, color: '#22c55e' }} />
                      <Typography variant="caption" sx={{ color: '#a0a0a0' }}>
                        Rango de Inversión
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#22c55e' }}>
                      ${profile.investmentRange.min.toLocaleString()}
                      {profile.investmentRange.max && ` - $${profile.investmentRange.max.toLocaleString()}`}
                    </Typography>
                  </Box>
                </Grid>
              )}
              {profile?.yearsExperience !== undefined && (
                <Grid item xs={6}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#1e1e1e', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <TrendingUp sx={{ fontSize: 16, mr: 0.5, color: '#00d9ff' }} />
                      <Typography variant="caption" sx={{ color: '#a0a0a0' }}>
                        Experiencia
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#fff' }}>
                      {profile.yearsExperience} años
                    </Typography>
                  </Box>
                </Grid>
              )}
              {profile?.numberOfInvestments !== undefined && (
                <Grid item xs={6}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#1e1e1e', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <Typography variant="caption" sx={{ color: '#a0a0a0' }}>
                      Inversiones
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#fff' }}>
                      {profile.numberOfInvestments}
                    </Typography>
                  </Box>
                </Grid>
              )}
              {profile?.sectorsOfInterest?.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ display: 'block', mb: 0.5, color: '#a0a0a0' }}>
                    Sectores de interés
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {profile.sectorsOfInterest.slice(0, 3).map((sector) => (
                      <Chip
                        key={sector}
                        label={sector}
                        size="small"
                        sx={{
                          fontSize: '0.7rem',
                          height: 20,
                          bgcolor: alpha('#ff6b9d', 0.15),
                          color: '#ff6b9d',
                          border: '1px solid rgba(255, 107, 157, 0.3)'
                        }}
                      />
                    ))}
                    {profile.sectorsOfInterest.length > 3 && (
                      <Chip
                        label={`+${profile.sectorsOfInterest.length - 3}`}
                        size="small"
                        sx={{
                          fontSize: '0.7rem',
                          height: 20,
                          bgcolor: alpha('#666', 0.15),
                          color: '#a0a0a0'
                        }}
                      />
                    )}
                  </Box>
                </Grid>
              )}
            </>
          )}
        </Grid>

        {/* Botón para iniciar chat */}
        {canChat ? (
          <Button
            variant="contained"
            fullWidth
            startIcon={<Chat />}
            onClick={() => onStartChat(user)}
            sx={{
              mt: 'auto',
              py: 1.5,
              borderRadius: 2,
              fontWeight: 700,
              background: `linear-gradient(135deg, ${cardColor} 0%, ${alpha(cardColor, 0.8)} 100%)`,
              color: '#000',
              boxShadow: `0 4px 14px ${alpha(cardColor, 0.3)}`,
              '&:hover': {
                boxShadow: `0 6px 20px ${alpha(cardColor, 0.5)}`,
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Iniciar Conversación
          </Button>
        ) : (
          <Chip
            label="Mismo tipo de usuario"
            size="small"
            sx={{
              mt: 'auto',
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              color: '#a0a0a0'
            }}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default UserCard;
