/**
 * Rutas para Predicciones ML
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getMyPrediction,
  getPredictionForProfile,
  getServiceHealth,
  getModelInformation
} = require('../controllers/predictionController');

/**
 * @route   GET /api/predictions/my-prediction
 * @desc    Obtener predicción de éxito del perfil del usuario autenticado
 * @access  Private (Emprendedores)
 */
router.get('/my-prediction', protect, getMyPrediction);

/**
 * @route   GET /api/predictions/profile/:profileId
 * @desc    Obtener predicción de un perfil específico
 * @access  Private (Solo Inversionistas)
 */
router.get('/profile/:profileId', protect, getPredictionForProfile);

/**
 * @route   GET /api/predictions/health
 * @desc    Verificar estado del servicio de predicción
 * @access  Public
 */
router.get('/health', getServiceHealth);

/**
 * @route   GET /api/predictions/model-info
 * @desc    Obtener información del modelo ML
 * @access  Public
 */
router.get('/model-info', getModelInformation);

module.exports = router;
