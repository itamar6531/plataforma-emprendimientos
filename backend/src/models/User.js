const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * MODELO USER (Usuario)
 * 
 * Este es el modelo principal que representa a todos los usuarios
 * (tanto emprendedores como inversionistas)
 * 
 * En MongoDB, esto crea una colección llamada "users"
 */

const userSchema = new mongoose.Schema({
  // Información básica
  name: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,           // Elimina espacios al inicio/fin
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },

  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,         // No puede haber emails duplicados
    lowercase: true,      // Convierte a minúsculas
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Por favor ingrese un email válido'
    ]
  },

  password: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    select: false         // No devolver password en queries por defecto
  },

  // Tipo de usuario
  userType: {
    type: String,
    enum: {
      values: ['emprendedor', 'inversionista'],
      message: 'El tipo debe ser emprendedor o inversionista'
    },
    required: [true, 'El tipo de usuario es requerido']
  },

  // Información adicional
  phone: {
    type: String,
    trim: true
  },

  location: {
    type: String,
    trim: true,
    default: 'Kennedy, Guayaquil'
  },

  bio: {
    type: String,
    maxlength: [500, 'La biografía no puede exceder 500 caracteres']
  },

  profileImage: {
    type: String,         // URL de la imagen
    default: null
  },

  // Timestamps automáticos
  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,       // Crea y actualiza createdAt y updatedAt automáticamente
  toJSON: { virtuals: true },   // Incluir campos virtuales en JSON
  toObject: { virtuals: true }
});

/**
 * VIRTUAL POPULATE
 * 
 * Permite acceder al perfil (emprendedor o inversionista) sin guardarlo en la BD
 * Es como una "relación" que se calcula dinámicamente
 */

// Relación con perfil de emprendedor
userSchema.virtual('entrepreneurProfile', {
  ref: 'EntrepreneurProfile',
  localField: '_id',
  foreignField: 'userId',
  justOne: true           // Solo un perfil por usuario
});

// Relación con perfil de inversionista
userSchema.virtual('investorProfile', {
  ref: 'InvestorProfile',
  localField: '_id',
  foreignField: 'userId',
  justOne: true
});

/**
 * MIDDLEWARE PRE-SAVE
 * 
 * Se ejecuta ANTES de guardar el usuario en la base de datos
 * Útil para hashear la contraseña
 * 
 * Nota: En Mongoose 9.x, los middleware async no usan next()
 */

userSchema.pre('save', async function() {
  // Solo hashear si la contraseña fue modificada
  if (!this.isModified('password')) {
    return;
  }

  // Generar salt y hashear contraseña
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * MÉTODO DE INSTANCIA
 * 
 * Método para comparar contraseña ingresada con la hasheada
 */

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * MÉTODO DE INSTANCIA
 * 
 * Obtener perfil específico según tipo de usuario
 */

userSchema.methods.getProfile = async function() {
  if (this.userType === 'emprendedor') {
    return await mongoose.model('EntrepreneurProfile').findOne({ userId: this._id });
  } else {
    return await mongoose.model('InvestorProfile').findOne({ userId: this._id });
  }
};

/**
 * ÍNDICES
 * 
 * Mejoran la velocidad de búsqueda en campos específicos
 */

userSchema.index({ email: 1 });
userSchema.index({ userType: 1 });
userSchema.index({ location: 1 });

// Crear y exportar el modelo
const User = mongoose.model('User', userSchema);

module.exports = User;