import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  InputAdornment,
  Box,
  Grid,
  Typography,
  CircularProgress,
  IconButton,
  Divider,
  Alert
} from '@mui/material';
import { Search, Close } from '@mui/icons-material';
import { toast } from 'react-toastify';
import userService from '../../services/userService';
import UserCard from '../search/UserCard';

const UserSearchDialog = ({ open, onClose, currentUser, onStartChat }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  // Buscar usuarios cuando cambia el término de búsqueda
  useEffect(() => {
    if (!open) {
      // Reset cuando se cierra el diálogo
      setSearchTerm('');
      setUsers([]);
      setHasSearched(false);
      setError('');
      return;
    }

    // Cargar usuarios iniciales (usuarios para chat)
    loadUsers();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    // Debounce de la búsqueda
    const timeoutId = setTimeout(() => {
      if (searchTerm || hasSearched) {
        loadUsers(searchTerm);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, open]);

  const loadUsers = async (search = '') => {
    try {
      setLoading(true);
      setError('');
      setHasSearched(true);

      const response = await userService.getUsers({
        forChat: 'true', // Solo usuarios del tipo opuesto
        search: search || undefined,
        limit: 20
      });

      setUsers(response.data.users || []);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al buscar usuarios';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = (user) => {
    onStartChat(user);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '70vh',
          maxHeight: '85vh'
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 2 }}>
        <Box sx={{ fontWeight: 600 }}>
          Buscar usuarios para chatear
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 3 }}>
        {/* Campo de búsqueda */}
        <TextField
          fullWidth
          placeholder="Buscar por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            )
          }}
          autoFocus
        />

        {/* Información del tipo de usuario */}
        <Alert severity="info" sx={{ mb: 1 }}>
          {currentUser.userType === 'emprendedor'
            ? 'Solo puedes chatear con inversionistas'
            : 'Solo puedes chatear con emprendedores'}
        </Alert>

        {/* Resultados */}
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : users.length === 0 && hasSearched ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                {searchTerm
                  ? 'No se encontraron usuarios con ese criterio'
                  : 'No hay usuarios disponibles para chatear'}
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {users.map((user) => (
                <Grid size={{ xs: 12, sm: 6 }} key={user._id}>
                  <UserCard
                    user={user}
                    currentUser={currentUser}
                    onStartChat={handleStartChat}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default UserSearchDialog;
