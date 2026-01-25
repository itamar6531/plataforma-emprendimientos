import api from './api';

/**
 * Servicio para gestión de perfiles de usuario
 */
const userService = {
  /**
   * Obtiene el perfil completo del usuario actual
   */
  getMyProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  /**
   * Actualiza el perfil del usuario
   * @param {Object} profileData - Datos del perfil a actualizar
   */
  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },

  /**
   * Obtiene usuarios con filtros
   * @param {Object} filters - Filtros de búsqueda
   */
  getUsers: async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.type) params.append('type', filters.type);
    if (filters.search) params.append('search', filters.search);
    if (filters.location) params.append('location', filters.location);
    if (filters.forChat) params.append('forChat', filters.forChat);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const response = await api.get(`/users?${params.toString()}`);
    return response.data;
  },

  /**
   * Obtiene un usuario por ID
   * @param {string} userId - ID del usuario
   */
  getUserById: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  }
};

export default userService;
