const mongoose = require('mongoose');

/**
 * MODELO ENTREPRENEUR PROFILE (Perfil de Emprendedor)
 * 
 * Información específica para usuarios tipo "emprendedor"
 * Cada usuario emprendedor tiene UN perfil asociado
 */

const entrepreneurProfileSchema = new mongoose.Schema({
  // Referencia al usuario (relación con User)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true          // Un perfil por usuario
  },

  // Información del proyecto
 projectName: {
  type: String,
  required: false,  // ← Cambiar a false
  default: '',      // ← Agregar default
  trim: true,
  maxlength: [150, 'El nombre del proyecto no puede exceder 150 caracteres']
},

projectDescription: {
  type: String,
  required: false,  // ← Cambiar a false
  default: '',      // ← Agregar default
  maxlength: [2000, 'La descripción no puede exceder 2000 caracteres']
},

  // Sector (por defecto culinario)
  sector: {
    type: String,
    default: 'culinario',
    trim: true
  },

  // Monto de financiamiento necesario
  fundingNeeded: {
    type: Number,
    min: [0, 'El monto no puede ser negativo'],
    default: null
  },

  // Etapa del proyecto
  stage: {
    type: String,
    enum: {
      values: ['idea', 'desarrollo', 'operando'],
      message: 'La etapa debe ser: idea, desarrollo u operando'
    },
    default: 'idea'
  },

  // Información adicional
  yearsInBusiness: {
    type: Number,
    min: 0,
    default: 0
  },

  numberOfEmployees: {
    type: Number,
    min: 0,
    default: 0
  },

  // Ubicación específica del negocio
  businessLocation: {
    type: String,
    trim: true,
    default: 'Kennedy, Guayaquil'
  },

  // ===== CAMPOS PARA MODELO PREDICTIVO =====

  // Nivel educativo del emprendedor
  educationLevel: {
    type: String,
    enum: {
      values: ['secundaria', 'tecnico', 'universitario', 'postgrado'],
      message: 'Nivel educativo debe ser: secundaria, tecnico, universitario o postgrado'
    },
    default: 'secundaria'
  },

  // Años de experiencia previa en el sector culinario
  previousExperienceYears: {
    type: Number,
    min: 0,
    default: 0
  },

  // ¿Tiene plan de negocios?
  hasBusinessPlan: {
    type: Boolean,
    default: false
  },

  // Nivel de validación de mercado
  marketValidationLevel: {
    type: String,
    enum: {
      values: ['ninguna', 'encuestas', 'mvp', 'clientes_activos'],
      message: 'Validación debe ser: ninguna, encuestas, mvp o clientes_activos'
    },
    default: 'ninguna'
  },

  // Capital inicial disponible
  initialCapital: {
    type: Number,
    min: 0,
    default: 0
  },

  // Ingresos mensuales proyectados
  projectedMonthlyRevenue: {
    type: Number,
    min: 0,
    default: 0
  },

  // Score de predicción del modelo ML (guardado después de calcular)
  predictionScore: {
    successScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null
    },
    classification: {
      type: String,
      enum: ['BAJO', 'MEDIO', 'ALTO'],
      default: null
    },
    lastUpdated: {
      type: Date,
      default: null
    },
    keyFactors: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    recommendations: [{
      type: String
    }]
  },

  // Documentos o enlaces
  documents: [{
    name: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

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
 * ÍNDICES
 */
entrepreneurProfileSchema.index({ userId: 1 });
entrepreneurProfileSchema.index({ sector: 1 });
entrepreneurProfileSchema.index({ stage: 1 });

/**
 * MÉTODO DE INSTANCIA
 * 
 * Calcular porcentaje de completitud del perfil
 */
entrepreneurProfileSchema.methods.getCompleteness = function() {
  let completedFields = 0;
  const totalFields = 14; // Aumentado de 8 a 14

  // Campos básicos
  if (this.projectName) completedFields++;
  if (this.projectDescription) completedFields++;
  if (this.sector) completedFields++;
  if (this.fundingNeeded) completedFields++;
  if (this.stage) completedFields++;
  if (this.yearsInBusiness !== undefined) completedFields++;
  if (this.numberOfEmployees !== undefined) completedFields++;
  if (this.businessLocation) completedFields++;

  // Campos para modelo predictivo
  if (this.educationLevel) completedFields++;
  if (this.previousExperienceYears !== undefined) completedFields++;
  if (this.hasBusinessPlan !== undefined) completedFields++;
  if (this.marketValidationLevel) completedFields++;
  if (this.initialCapital !== undefined) completedFields++;
  if (this.projectedMonthlyRevenue !== undefined) completedFields++;

  return Math.round((completedFields / totalFields) * 100);
};

// Crear y exportar el modelo
const EntrepreneurProfile = mongoose.model('EntrepreneurProfile', entrepreneurProfileSchema);

module.exports = EntrepreneurProfile;
