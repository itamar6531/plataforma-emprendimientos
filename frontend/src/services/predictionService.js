import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Obtiene la predicción de éxito para el perfil del usuario autenticado
 */
const getMyPrediction = async () => {
  const token = localStorage.getItem('token');

  const response = await axios.get(`${API_URL}/predictions/my-prediction`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return response.data;
};

/**
 * Obtiene la predicción para un perfil específico (solo inversionistas)
 */
const getPredictionForProfile = async (profileId) => {
  const token = localStorage.getItem('token');

  const response = await axios.get(`${API_URL}/predictions/profile/${profileId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return response.data;
};

/**
 * Verifica el estado del servicio de predicción
 */
const checkServiceHealth = async () => {
  const response = await axios.get(`${API_URL}/predictions/health`);
  return response.data;
};

/**
 * Obtiene información del modelo ML
 */
const getModelInfo = async () => {
  const response = await axios.get(`${API_URL}/predictions/model-info`);
  return response.data;
};

const predictionService = {
  getMyPrediction,
  getPredictionForProfile,
  checkServiceHealth,
  getModelInfo
};

export default predictionService;
