/**
 * Controlador de Predicciones ML
 *
 * Maneja las solicitudes relacionadas con predicciones de éxito
 */

const predictionService = require('../services/predictionService');
const EntrepreneurProfile = require('../models/EntrepreneurProfile');

/**
 * Obtiene predicción de éxito para el perfil del usuario autenticado
 */
const getMyPrediction = async (req, res) => {
  try {
    const userId = req.user._id;

    // Buscar perfil del emprendedor
    const profile = await EntrepreneurProfile.findOne({ userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Perfil de emprendedor no encontrado'
      });
    }

    // Verificar que tenga los datos mínimos necesarios
    const requiredFields = ['sector', 'stage', 'fundingNeeded', 'educationLevel'];
    const missingFields = requiredFields.filter(field => !profile[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Completa tu perfil para obtener una predicción',
        missingFields: missingFields,
        completeness: profile.getCompleteness()
      });
    }

    // Obtener predicción del microservicio
    const predictionResult = await predictionService.getPrediction(profile);

    if (!predictionResult.success) {
      return res.status(predictionResult.status || 500).json({
        success: false,
        message: predictionResult.error
      });
    }

    // Guardar la predicción en el perfil
    profile.predictionScore = {
      successScore: predictionResult.data.success_score,
      classification: predictionResult.data.classification,
      lastUpdated: new Date(),
      keyFactors: predictionResult.data.key_factors,
      recommendations: predictionResult.data.recommendations
    };

    await profile.save();

    return res.status(200).json({
      success: true,
      message: 'Predicción obtenida exitosamente',
      data: predictionResult.data
    });

  } catch (error) {
    console.error('Error en getMyPrediction:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener predicción',
      error: error.message
    });
  }
};

/**
 * Obtiene predicción para un perfil específico (solo para inversionistas)
 */
const getPredictionForProfile = async (req, res) => {
  try {
    const { profileId } = req.params;

    // Verificar que el usuario sea inversionista
    if (req.user.userType !== 'inversionista') {
      return res.status(403).json({
        success: false,
        message: 'Solo los inversionistas pueden ver predicciones de otros perfiles'
      });
    }

    // Buscar perfil
    const profile = await EntrepreneurProfile.findById(profileId)
      .populate('userId', 'name email location');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Perfil no encontrado'
      });
    }

    // Si ya tiene una predicción reciente (< 24 horas), devolverla
    if (profile.predictionScore?.lastUpdated) {
      const hoursSinceUpdate = (Date.now() - new Date(profile.predictionScore.lastUpdated)) / (1000 * 60 * 60);

      if (hoursSinceUpdate < 24) {
        return res.status(200).json({
          success: true,
          message: 'Predicción existente (desde caché)',
          data: {
            success_score: profile.predictionScore.successScore,
            classification: profile.predictionScore.classification,
            key_factors: profile.predictionScore.keyFactors,
            recommendations: profile.predictionScore.recommendations,
            last_updated: profile.predictionScore.lastUpdated
          },
          entrepreneur: {
            name: profile.userId.name,
            location: profile.userId.location,
            projectName: profile.projectName
          }
        });
      }
    }

    // Obtener nueva predicción
    const predictionResult = await predictionService.getPrediction(profile);

    if (!predictionResult.success) {
      return res.status(predictionResult.status || 500).json({
        success: false,
        message: predictionResult.error
      });
    }

    // Actualizar predicción en el perfil
    profile.predictionScore = {
      successScore: predictionResult.data.success_score,
      classification: predictionResult.data.classification,
      lastUpdated: new Date(),
      keyFactors: predictionResult.data.key_factors,
      recommendations: predictionResult.data.recommendations
    };

    await profile.save();

    return res.status(200).json({
      success: true,
      message: 'Predicción obtenida exitosamente',
      data: predictionResult.data,
      entrepreneur: {
        name: profile.userId.name,
        location: profile.userId.location,
        projectName: profile.projectName
      }
    });

  } catch (error) {
    console.error('Error en getPredictionForProfile:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener predicción',
      error: error.message
    });
  }
};

/**
 * Obtiene el estado del servicio de predicción
 */
const getServiceHealth = async (req, res) => {
  try {
    const healthResult = await predictionService.checkHealth();

    if (!healthResult.success) {
      return res.status(503).json({
        success: false,
        message: 'Servicio de predicción no disponible',
        error: healthResult.error
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Servicio de predicción operativo',
      data: healthResult.data
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al verificar estado del servicio',
      error: error.message
    });
  }
};

/**
 * Obtiene información del modelo ML
 */
const getModelInformation = async (req, res) => {
  try {
    const modelInfo = await predictionService.getModelInfo();

    if (!modelInfo.success) {
      return res.status(503).json({
        success: false,
        message: 'No se pudo obtener información del modelo',
        error: modelInfo.error
      });
    }

    return res.status(200).json({
      success: true,
      data: modelInfo.data
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtener información del modelo',
      error: error.message
    });
  }
};

module.exports = {
  getMyPrediction,
  getPredictionForProfile,
  getServiceHealth,
  getModelInformation
};
