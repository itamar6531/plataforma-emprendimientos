import api from './api';

/**
 * Servicio para gestión de mensajes y conversaciones
 */
const messageService = {
  /**
   * Obtiene todas las conversaciones del usuario actual
   */
  getConversations: async () => {
    const response = await api.get('/messages/conversations');
    return response.data;
  },

  /**
   * Obtiene los mensajes de una conversación específica
   * @param {string} conversationId - ID de la conversación
   * @param {number} page - Número de página (opcional)
   * @param {number} limit - Límite de mensajes (opcional)
   */
  getMessages: async (conversationId, page = 1, limit = 50) => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);

    const response = await api.get(`/messages/conversations/${conversationId}?${params.toString()}`);
    return response.data;
  },

  /**
   * Envía un mensaje a un usuario
   * @param {Object} messageData - Datos del mensaje
   * @param {string} messageData.receiverId - ID del receptor
   * @param {string} messageData.messageText - Texto del mensaje
   */
  sendMessage: async (messageData) => {
    const response = await api.post('/messages/send', messageData);
    return response.data;
  },

  /**
   * Marca una conversación como leída
   * @param {string} conversationId - ID de la conversación
   */
  markAsRead: async (conversationId) => {
    const response = await api.put(`/messages/conversations/${conversationId}/read`);
    return response.data;
  }
};

export default messageService;
