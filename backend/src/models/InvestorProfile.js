const mongoose = require('mongoose');

/**
 * MODELO INVESTOR PROFILE (Perfil de Inversionista)
 * 
 * Información específica para usuarios tipo "inversionista"
 */

const investorProfileSchema = new mongoose.Schema({
  // Referencia al usuario
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  // Intereses de inversión
  investmentInterests: {
    type: String,
    required: false,
    default: '',
    maxlength: [1000, 'Los intereses no pueden exceder 1000 caracteres']
  },

  // Rango de inversión preferido
  investmentRange: {
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: null
    }
  },

  // Sectores de interés (array de strings)
  sectorsOfInterest: {
    type: [String],
    default: ['culinario']
  },

  // Experiencia como inversionista
  yearsExperience: {
    type: Number,
    min: 0,
    default: 0
  },

  // Número de inversiones realizadas
  numberOfInvestments: {
    type: Number,
    min: 0,
    default: 0
  },

  // Tipo de inversionista
  investorType: {
    type: String,
    enum: ['angel', 'venture_capital', 'private_equity', 'individual', 'otro'],
    default: 'individual'
  },

  // ¿Busca ser socio activo o pasivo?
  partnershipType: {
    type: String,
    enum: ['activo', 'pasivo', 'ambos'],
    default: 'ambos'
  },

  // Empresas o proyectos previos
  previousInvestments: [{
    projectName: String,
    sector: String,
    year: Number,
    outcome: String
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
investorProfileSchema.index({ userId: 1 });
investorProfileSchema.index({ sectorsOfInterest: 1 });
investorProfileSchema.index({ investorType: 1 });

/**
 * MÉTODO DE INSTANCIA
 * 
 * Verificar si un proyecto está dentro del rango de inversión
 */
investorProfileSchema.methods.isInRange = function(amount) {
  if (!amount) return true;
  
  const min = this.investmentRange.min || 0;
  const max = this.investmentRange.max || Infinity;
  
  return amount >= min && amount <= max;
};

/**
 * MÉTODO DE INSTANCIA
 * 
 * Calcular porcentaje de completitud del perfil
 */
investorProfileSchema.methods.getCompleteness = function() {
  let completedFields = 0;
  const totalFields = 7;

  if (this.investmentInterests) completedFields++;
  if (this.investmentRange.min !== undefined) completedFields++;
  if (this.investmentRange.max) completedFields++;
  if (this.sectorsOfInterest.length > 0) completedFields++;
  if (this.yearsExperience !== undefined) completedFields++;
  if (this.investorType) completedFields++;
  if (this.partnershipType) completedFields++;

  return Math.round((completedFields / totalFields) * 100);
};

// Crear y exportar el modelo
const InvestorProfile = mongoose.model('InvestorProfile', investorProfileSchema);

module.exports = InvestorProfile;