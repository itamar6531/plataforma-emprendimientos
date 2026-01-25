const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

/**
 * @desc    Obtener todas las conversaciones del usuario
 * @route   GET /api/messages/conversations
 * @access  Private
 */
const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Buscar conversaciones donde el usuario sea participante
    const conversations = await Conversation.find({
      $or: [
        { entrepreneurId: userId },
        { investorId: userId }
      ],
      status: 'active'
    })
      .populate('entrepreneurId', 'name email userType profileImage')
      .populate('investorId', 'name email userType profileImage')
      .sort({ lastMessageAt: -1 }); // Más recientes primero

    // Formatear respuesta con el otro participante
    const formattedConversations = conversations.map(conv => {
      // Usar el método del modelo para obtener el otro participante
      const otherUser = conv.getOtherParticipant(userId);

      // Determinar si el usuario actual es el emprendedor
      const entrepreneurIdStr = conv.entrepreneurId._id
        ? conv.entrepreneurId._id.toString()
        : conv.entrepreneurId.toString();
      const isEntrepreneur = entrepreneurIdStr === userId.toString();

      return {
        _id: conv._id,
        otherUser,
        lastMessageText: conv.lastMessageText,
        lastMessageAt: conv.lastMessageAt,
        unreadCount: isEntrepreneur
          ? conv.unreadCount.entrepreneur
          : conv.unreadCount.investor,
        createdAt: conv.createdAt
      };
    });

    res.status(200).json({
      success: true,
      data: formattedConversations
    });

  } catch (error) {
    console.error('Error al obtener conversaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener conversaciones'
    });
  }
};

/**
 * @desc    Obtener mensajes de una conversación
 * @route   GET /api/messages/conversations/:conversationId
 * @access  Private
 */
const getMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // 1. Verificar que la conversación existe y el usuario es participante
    const conversation = await Conversation.findById(conversationId)
      .populate('entrepreneurId', 'name email userType profileImage')
      .populate('investorId', 'name email userType profileImage');

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversación no encontrada'
      });
    }

    // Verificar que el usuario sea participante
    if (!conversation.isParticipant(userId)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a esta conversación'
      });
    }

    // 2. Obtener mensajes con paginación
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const messagesFromDB = await Message.find({ conversationId })
      .populate('senderId', 'name email userType profileImage')
      .sort({ createdAt: -1 }) // Más recientes primero
      .limit(parseInt(limit))
      .skip(skip);

    // Normalizar mensajes para que el campo sea 'sender' en lugar de 'senderId'
    const messages = messagesFromDB.map(msg => ({
      _id: msg._id,
      conversationId: msg.conversationId,
      sender: msg.senderId, // Normalizar a 'sender'
      messageText: msg.messageText,
      createdAt: msg.createdAt,
      readAt: msg.readAt
    }));

    // 3. Contar total de mensajes
    const total = await Message.countDocuments({ conversationId });

    // 4. Marcar mensajes como leídos
    await Message.updateMany(
      {
        conversationId,
        senderId: { $ne: userId },
        readAt: null
      },
      { readAt: new Date() }
    );

    // 5. Actualizar contador de no leídos en la conversación
    const userType = req.user.userType;
    if (userType === 'emprendedor') {
      conversation.unreadCount.entrepreneur = 0;
    } else {
      conversation.unreadCount.investor = 0;
    }
    await conversation.save();

    res.status(200).json({
      success: true,
      data: {
        conversation: {
          _id: conversation._id,
          otherUser: conversation.getOtherParticipant(userId),
          createdAt: conversation.createdAt
        },
        messages: messages.reverse(), // Devolver en orden cronológico
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener mensajes'
    });
  }
};

/**
 * @desc    Enviar un mensaje
 * @route   POST /api/messages/send
 * @access  Private
 */
const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { receiverId, messageText } = req.body;

    // 1. Validar campos
    if (!receiverId || !messageText) {
      return res.status(400).json({
        success: false,
        message: 'Por favor proporciona receiverId y messageText'
      });
    }

    if (messageText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'El mensaje no puede estar vacío'
      });
    }

    // 2. Verificar que el receptor existe
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Usuario receptor no encontrado'
      });
    }

    // 3. Verificar que sean de tipos diferentes
    if (req.user.userType === receiver.userType) {
      return res.status(400).json({
        success: false,
        message: 'Solo puedes chatear con usuarios de tipo diferente al tuyo'
      });
    }

    // 4. Determinar quién es emprendedor y quién inversionista
    const entrepreneurId = req.user.userType === 'emprendedor' ? senderId : receiverId;
    const investorId = req.user.userType === 'inversionista' ? senderId : receiverId;

    // 5. Buscar o crear conversación
    let conversation = await Conversation.findOne({
      entrepreneurId,
      investorId
    });

    if (!conversation) {
      conversation = await Conversation.create({
        entrepreneurId,
        investorId,
        lastMessageAt: new Date(),
        lastMessageText: messageText.substring(0, 100)
      });
    }

    // 6. Crear el mensaje
    const message = await Message.create({
      conversationId: conversation._id,
      senderId,
      messageText: messageText.trim()
    });

    // 7. Cargar datos del sender
    const messageWithSender = await Message.findById(message._id)
      .populate('senderId', 'name email userType profileImage');

    // Nota: El middleware post-save del modelo Message ya actualiza la conversación

    res.status(201).json({
      success: true,
      message: 'Mensaje enviado exitosamente',
      data: messageWithSender
    });

  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar mensaje'
    });
  }
};

/**
 * @desc    Marcar conversación como leída
 * @route   PUT /api/messages/conversations/:conversationId/read
 * @access  Private
 */
const markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversación no encontrada'
      });
    }

    if (!conversation.isParticipant(userId)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a esta conversación'
      });
    }

    // Marcar como leída según tipo de usuario
    await conversation.markAsRead(req.user.userType);

    res.status(200).json({
      success: true,
      message: 'Conversación marcada como leída'
    });

  } catch (error) {
    console.error('Error al marcar como leída:', error);
    res.status(500).json({
      success: false,
      message: 'Error al marcar como leída'
    });
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead
};
