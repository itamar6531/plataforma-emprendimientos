import api from './api';

const authService = {
  // Registro de usuario
  register: async (userData) => {
    try {
      // Mapear campos del español al inglés que espera el backend
      const backendData = {
        name: userData.nombre,
        email: userData.email,
        password: userData.password,
        userType: userData.tipoUsuario,
      };
      
      const response = await api.post('/auth/register', backendData);
      
      if (response.data.data.token) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      return response.data.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error en el registro' };
    }
  },

  // Login de usuario
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      
      if (response.data.data.token) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      return response.data.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error en el login' };
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Obtener usuario actual
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Verificar si hay token
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

export default authService;