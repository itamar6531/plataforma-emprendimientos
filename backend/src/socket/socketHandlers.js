const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

// Almacenar usuarios conectados
const connectedUsers = new Map(); // Map<userId, socketId>

/**
 * Middleware de autenticación para Socket.io
 */
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Token no proporcionado'));
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar usuario
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new Error('Usuario no encontrado'));
    }

    // Adjuntar usuario al socket
    socket.user = user;
    next();
  } catch (error) {
    console.error('Error de autenticación Socket.io:', error.message);
    next(new Error('Token inválido'));
  }
};

/**
 * Configurar manejadores de eventos de Socket.io
 */
module.exports = (io) => {
  // Middleware de autenticación
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    const user = socket.user;
    console.log(`✅ Usuario conectado: ${user.name} (${user._id})`);

    // Registrar usuario conectado
    connectedUsers.set(user._id.toString(), socket.id);

    // Emitir lista de usuarios online a todos
    io.emit('users_online', Array.from(connectedUsers.keys()));

    /**
     * Evento: Unirse a una conversación
     */
    socket.on('join_conversation', async (conversationId) => {
      try {
        // Verificar que la conversación existe y el usuario es participante
        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
          socket.emit('error', { message: 'Conversación no encontrada' });
          return;
        }

        if (!conversation.isParticipant(user._id)) {
          socket.emit('error', { message: 'No eres parte de esta conversación' });
          return;
        }

        // Unirse a la sala de la conversación
        socket.join(conversationId);
        console.log(`👥 ${user.name} se unió a conversación: ${conversationId}`);

        socket.emit('joined_conversation', { conversationId });
      } catch (error) {
        console.error('Error al unirse a conversación:', error);
        socket.emit('error', { message: 'Error al unirse a la conversación' });
      }
    });

    /**
     * Evento: Salir de una conversación
     */
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(conversationId);
      console.log(`👋 ${user.name} salió de conversación: ${conversationId}`);
    });

    /**
     * Evento: Enviar mensaje
     */
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, messageText } = data;

        if (!messageText || messageText.trim() === '') {
          socket.emit('error', { message: 'El mensaje no puede estar vacío' });
          return;
        }

        // Verificar conversación
        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
          socket.emit('error', { message: 'Conversación no encontrada' });
          return;
        }

        if (!conversation.isParticipant(user._id)) {
          socket.emit('error', { message: 'No eres parte de esta conversación' });
          return;
        }

        // Crear mensaje
        const message = await Message.create({
          conversationId,
          senderId: user._id,
          messageText: messageText.trim()
        });

        // Poblar sender para enviar datos completos
        await message.populate('senderId', 'name email userType');

        // Emitir mensaje a todos en la sala (incluido el emisor)
        io.to(conversationId).emit('new_message', {
          message: {
            _id: message._id,
            conversationId: message.conversationId,
            sender: message.senderId,
            messageText: message.messageText,
            createdAt: message.createdAt,
            readAt: message.readAt
          }
        });

        // Notificar al otro usuario si está conectado
        const otherUserId = conversation.getOtherParticipant(user._id);
        const otherUserSocketId = connectedUsers.get(otherUserId.toString());

        if (otherUserSocketId) {
          io.to(otherUserSocketId).emit('notification', {
            type: 'new_message',
            conversationId,
            message: `Nuevo mensaje de ${user.name}`,
            sender: {
              _id: user._id,
              name: user.name
            }
          });
        }

        console.log(`💬 Mensaje enviado en conversación ${conversationId}`);
      } catch (error) {
        console.error('Error al enviar mensaje:', error);
        socket.emit('error', { message: 'Error al enviar mensaje' });
      }
    });

    /**
     * Evento: Usuario está escribiendo
     */
    socket.on('typing', async (data) => {
      try {
        const { conversationId } = data;

        // Verificar conversación
        const conversation = await Conversation.findById(conversationId);

        if (!conversation || !conversation.isParticipant(user._id)) {
          return;
        }

        // Emitir a todos menos al emisor
        socket.to(conversationId).emit('user_typing', {
          conversationId,
          user: {
            _id: user._id,
            name: user.name
          }
        });
      } catch (error) {
        console.error('Error en evento typing:', error);
      }
    });

    /**
     * Evento: Usuario dejó de escribir
     */
    socket.on('stop_typing', async (data) => {
      try {
        const { conversationId } = data;

        // Verificar conversación
        const conversation = await Conversation.findById(conversationId);

        if (!conversation || !conversation.isParticipant(user._id)) {
          return;
        }

        // Emitir a todos menos al emisor
        socket.to(conversationId).emit('user_stop_typing', {
          conversationId,
          user: {
            _id: user._id,
            name: user.name
          }
        });
      } catch (error) {
        console.error('Error en evento stop_typing:', error);
      }
    });

    /**
     * Evento: Marcar mensajes como leídos
     */
    socket.on('mark_as_read', async (data) => {
      try {
        const { conversationId } = data;

        // Verificar conversación
        const conversation = await Conversation.findById(conversationId);

        if (!conversation || !conversation.isParticipant(user._id)) {
          socket.emit('error', { message: 'Conversación no válida' });
          return;
        }

        // Marcar mensajes como leídos
        const now = new Date();
        await Message.updateMany(
          {
            conversationId,
            senderId: { $ne: user._id },
            readAt: null
          },
          { readAt: now }
        );

        // Resetear contador de no leídos
        await conversation.markAsRead(user.userType);

        // Notificar al otro usuario
        socket.to(conversationId).emit('messages_read', {
          conversationId,
          readBy: user._id,
          readAt: now
        });

        console.log(`✅ Mensajes marcados como leídos en conversación ${conversationId}`);
      } catch (error) {
        console.error('Error al marcar como leído:', error);
        socket.emit('error', { message: 'Error al marcar mensajes como leídos' });
      }
    });

    /**
     * Evento: Desconexión
     */
    socket.on('disconnect', () => {
      console.log(`❌ Usuario desconectado: ${user.name} (${user._id})`);

      // Remover de usuarios conectados
      connectedUsers.delete(user._id.toString());

      // Emitir lista actualizada de usuarios online
      io.emit('users_online', Array.from(connectedUsers.keys()));
    });

    /**
     * Evento: Manejo de errores
     */
    socket.on('error', (error) => {
      console.error('Error en socket:', error);
    });
  });

  console.log('🔌 Socket.io configurado correctamente');
};
