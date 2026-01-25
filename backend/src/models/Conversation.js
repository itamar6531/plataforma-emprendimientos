const mongoose = require('mongoose');

/**
 * MODELO CONVERSATION (Conversación)
 * 
 * Representa una conversación entre un emprendedor y un inversionista
 * Una conversación contiene múltiples mensajes
 */

const conversationSchema = new mongoose.Schema({
  // Participantes de la conversación
  entrepreneurId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  investorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Último mensaje enviado (para ordenar conversaciones)
  lastMessageAt: {
    type: Date,
    default: Date.now
  },

  // Último mensaje (texto)
  lastMessageText: {
    type: String,
    default: ''
  },

  // Estado de la conversación
  status: {
    type: String,
    enum: ['active', 'archived', 'blocked'],
    default: 'active'
  },

  // Mensajes no leídos por cada participante
  unreadCount: {
    entrepreneur: {
      type: Number,
      default: 0
    },
    investor: {
      type: Number,
      default: 0
    }
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

/**
 * ÍNDICES COMPUESTOS
 * 
 * Para evitar conversaciones duplicadas y búsquedas rápidas
 */
conversationSchema.index({ entrepreneurId: 1, investorId: 1 }, { unique: true });
conversationSchema.index({ lastMessageAt: -1 }); // -1 = descendente (más recientes primero)

/**
 * MÉTODO ESTÁTICO
 * 
 * Encontrar o crear una conversación entre dos usuarios
 */
conversationSchema.statics.findOrCreate = async function(entrepreneurId, investorId) {
  let conversation = await this.findOne({
    entrepreneurId,
    investorId
  });

  if (!conversation) {
    conversation = await this.create({
      entrepreneurId,
      investorId
    });
  }

  return conversation;
};

/**
 * MÉTODO DE INSTANCIA
 *
 * Obtener el otro participante de la conversación
 */
conversationSchema.methods.getOtherParticipant = function(userId) {
  // Obtener el ID real (puede ser un ObjectId o un objeto poblado)
  const entrepreneurIdStr = this.entrepreneurId._id
    ? this.entrepreneurId._id.toString()
    : this.entrepreneurId.toString();

  const userIdStr = userId.toString();

  if (entrepreneurIdStr === userIdStr) {
    return this.investorId;
  }
  return this.entrepreneurId;
};

/**
 * MÉTODO DE INSTANCIA
 *
 * Verificar si un usuario es participante de esta conversación
 */
conversationSchema.methods.isParticipant = function(userId) {
  // Obtener el ID real (puede ser un ObjectId o un objeto poblado)
  const entrepreneurIdStr = this.entrepreneurId._id
    ? this.entrepreneurId._id.toString()
    : this.entrepreneurId.toString();

  const investorIdStr = this.investorId._id
    ? this.investorId._id.toString()
    : this.investorId.toString();

  const userIdStr = userId.toString();

  return (
    entrepreneurIdStr === userIdStr ||
    investorIdStr === userIdStr
  );
};

/**
 * MÉTODO DE INSTANCIA
 * 
 * Actualizar contador de mensajes no leídos
 */
conversationSchema.methods.incrementUnread = async function(userType) {
  if (userType === 'emprendedor') {
    this.unreadCount.entrepreneur += 1;
  } else {
    this.unreadCount.investor += 1;
  }
  await this.save();
};

/**
 * MÉTODO DE INSTANCIA
 * 
 * Marcar mensajes como leídos
 */
conversationSchema.methods.markAsRead = async function(userType) {
  if (userType === 'emprendedor') {
    this.unreadCount.entrepreneur = 0;
  } else {
    this.unreadCount.investor = 0;
  }
  await this.save();
};

// Crear y exportar el modelo
const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
