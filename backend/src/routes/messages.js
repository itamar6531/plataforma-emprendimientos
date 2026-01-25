const express = require('express');
const router = express.Router();
const {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

/**
 * RUTAS DE MENSAJES
 * Base: /api/messages
 * Todas requieren autenticación
 */

router.use(protect); // Aplicar middleware a todas las rutas

router.get('/conversations', getConversations);
router.get('/conversations/:conversationId', getMessages);
router.post('/send', sendMessage);
router.put('/conversations/:conversationId/read', markAsRead);

module.exports = router;
