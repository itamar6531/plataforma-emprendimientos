const mongoose = require('mongoose');

/**
 * MODELO MESSAGE (Mensaje)
 * 
 * Representa un mensaje individual dentro de una conversación
 */

const messageSchema = new mongoose.Schema({
  // Conversación a la que pertenece
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },

  // Quién envió el mensaje
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Contenido del mensaje
  messageText: {
    type: String,
    required: [true, 'El mensaje no puede estar vacío'],
    maxlength: [5000, 'El mensaje no puede exceder 5000 caracteres']
  },

  // ¿Fue leído?
  readAt: {
    type: Date,
    default: null
  },

  // Tipo de mensaje (para futuro: archivos, imágenes, etc.)
  messageType: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  },

  // URL si es imagen o archivo
  attachmentUrl: {
    type: String,
    default: null
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

/**
 * ÍNDICES
 * 
 * Para búsquedas rápidas de mensajes
 */
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });

/**
 * MÉTODO DE INSTANCIA
 * 
 * Marcar mensaje como leído
 */
messageSchema.methods.markAsRead = async function() {
  if (!this.readAt) {
    this.readAt = new Date();
    await this.save();
  }
};

/**
 * MÉTODO DE INSTANCIA
 * 
 * Verificar si el mensaje fue leído
 */
messageSchema.methods.isRead = function() {
  return !!this.readAt;
};

/**
 * MIDDLEWARE POST-SAVE
 * 
 * Actualizar la conversación después de guardar un mensaje
 */
messageSchema.post('save', async function() {
  try {
    const Conversation = mongoose.model('Conversation');
    const User = mongoose.model('User');
    
    // Buscar la conversación
    const conversation = await Conversation.findById(this.conversationId);
    
    if (conversation) {
      // Actualizar último mensaje
      conversation.lastMessageAt = this.createdAt;
      conversation.lastMessageText = this.messageText.substring(0, 100); // Primeros 100 caracteres
      
      // Incrementar contador de no leídos del receptor
      const sender = await User.findById(this.senderId);
      if (sender) {
        if (sender.userType === 'emprendedor') {
          conversation.unreadCount.investor += 1;
        } else {
          conversation.unreadCount.entrepreneur += 1;
        }
      }
      
      await conversation.save();
    }
  } catch (error) {
    console.error('Error actualizando conversación:', error);
  }
});

// Crear y exportar el modelo
const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
