/**
 * Servicio de Predicción ML
 *
 * Se comunica con el microservicio Python (FastAPI) para obtener predicciones
 * de éxito de emprendimientos
 */

const axios = require('axios');

// URL del microservicio ML
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';

/**
 * Obtiene predicción de éxito para un perfil de emprendedor
 *
 * @param {Object} profileData - Datos del perfil del emprendedor
 * @returns {Promise<Object>} - Predicción con score, clasificación y recomendaciones
 */
const getPrediction = async (profileData) => {
  try {
    // Preparar datos para el modelo
    const predictionRequest = {
      sector: profileData.sector || 'culinario',
      stage: profileData.stage || 'idea',
      years_in_business: profileData.yearsInBusiness || 0,
      number_of_employees: profileData.numberOfEmployees || 0,
      funding_needed: profileData.fundingNeeded || 0,
      education_level: profileData.educationLevel || 'secundaria',
      previous_experience_years: profileData.previousExperienceYears || 0,
      has_business_plan: profileData.hasBusinessPlan || false,
      market_validation_level: profileData.marketValidationLevel || 'ninguna',
      initial_capital: profileData.initialCapital || 0,
      projected_monthly_revenue: profileData.projectedMonthlyRevenue || 0
    };

    console.log('🤖 Solicitando predicción al microservicio ML...');
    console.log('Datos enviados:', predictionRequest);

    // Llamar al microservicio Python
    const response = await axios.post(
      `${ML_SERVICE_URL}/predict`,
      predictionRequest,
      {
        timeout: 10000, // 10 segundos timeout
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✓ Predicción recibida:', response.data);

    return {
      success: true,
      data: response.data
    };

  } catch (error) {
    console.error('✗ Error al obtener predicción:', error.message);

    // Manejar diferentes tipos de errores
    if (error.response) {
      // El microservicio respondió con un error
      return {
        success: false,
        error: error.response.data.detail || 'Error en el servicio de predicción',
        status: error.response.status
      };
    } else if (error.request) {
      // No se pudo conectar al microservicio
      return {
        success: false,
        error: 'No se pudo conectar al servicio de predicción. Asegúrate de que el microservicio ML esté ejecutándose.',
        status: 503
      };
    } else {
      // Otro tipo de error
      return {
        success: false,
        error: error.message,
        status: 500
      };
    }
  }
};

/**
 * Verifica el estado del microservicio ML
 *
 * @returns {Promise<Object>} - Estado del servicio
 */
const checkHealth = async () => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/health`, {
      timeout: 5000
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: 'Microservicio ML no disponible',
      status: 503
    };
  }
};

/**
 * Obtiene información del modelo ML
 *
 * @returns {Promise<Object>} - Información del modelo
 */
const getModelInfo = async () => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/model/info`, {
      timeout: 5000
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: 'No se pudo obtener información del modelo',
      status: 503
    };
  }
};

module.exports = {
  getPrediction,
  checkHealth,
  getModelInfo
};
