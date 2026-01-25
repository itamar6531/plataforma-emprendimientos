/**
 * Script de prueba de integración del Modelo Predictivo
 *
 * Este script prueba la comunicación entre:
 * 1. Servicio ML (Puerto 8000) - FastAPI + XGBoost
 * 2. Backend (Puerto 5000) - Express.js
 */

const axios = require('axios');

// URLs de los servicios
const ML_SERVICE_URL = 'http://localhost:8000';
const BACKEND_URL = 'http://localhost:5000/api';

// Datos de prueba de un emprendedor
const testProfile = {
  sector: 'restaurante',
  stage: 'desarrollo',
  years_in_business: 1,
  number_of_employees: 3,
  funding_needed: 35000,
  education_level: 'universitario',
  previous_experience_years: 5,
  has_business_plan: true,
  market_validation_level: 'mvp',
  initial_capital: 15000,
  projected_monthly_revenue: 8000
};

const testProfile2 = {
  sector: 'food-truck',
  stage: 'idea',
  years_in_business: 0,
  number_of_employees: 1,
  funding_needed: 25000,
  education_level: 'secundaria',
  previous_experience_years: 0,
  has_business_plan: false,
  market_validation_level: 'ninguna',
  initial_capital: 3000,
  projected_monthly_revenue: 1500
};

async function testMLService() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('🧪 PRUEBA 1: Servicio ML Directo (Puerto 8000)');
  console.log('═══════════════════════════════════════════════════════════\n');

  try {
    // Health Check
    console.log('1️⃣  Verificando salud del servicio ML...');
    const health = await axios.get(`${ML_SERVICE_URL}/health`);
    console.log('   ✅ Estado:', health.data.status);
    console.log('   ✅ Versión:', health.data.version);
    console.log('   ✅ Modelo cargado:', health.data.model_loaded);

    // Predicción Caso 1 (Favorable)
    console.log('\n2️⃣  Predicción Caso 1 - Emprendedor Preparado');
    console.log('   Perfil:', JSON.stringify(testProfile, null, 2).split('\n').join('\n   '));

    const prediction1 = await axios.post(`${ML_SERVICE_URL}/predict`, testProfile);
    console.log('\n   📊 RESULTADO:');
    console.log('   • Score de Éxito:', prediction1.data.success_score.toFixed(2) + '%');
    console.log('   • Clasificación:', prediction1.data.classification);
    console.log('   • Confianza:', (prediction1.data.confidence * 100).toFixed(2) + '%');
    console.log('   • Factores Positivos:', prediction1.data.key_factors.positive.length);
    console.log('   • Factores Negativos:', prediction1.data.key_factors.negative.length);

    if (prediction1.data.recommendations.length > 0) {
      console.log('   • Recomendaciones:', prediction1.data.recommendations.length);
    }

    // Predicción Caso 2 (Desafiante)
    console.log('\n3️⃣  Predicción Caso 2 - Emprendedor Novato');
    console.log('   Perfil:', JSON.stringify(testProfile2, null, 2).split('\n').join('\n   '));

    const prediction2 = await axios.post(`${ML_SERVICE_URL}/predict`, testProfile2);
    console.log('\n   📊 RESULTADO:');
    console.log('   • Score de Éxito:', prediction2.data.success_score.toFixed(2) + '%');
    console.log('   • Clasificación:', prediction2.data.classification);
    console.log('   • Confianza:', (prediction2.data.confidence * 100).toFixed(2) + '%');
    console.log('   • Factores Positivos:', prediction2.data.key_factors.positive.length);
    console.log('   • Factores Negativos:', prediction2.data.key_factors.negative.length);
    console.log('   • Recomendaciones:', prediction2.data.recommendations.length);

    return true;
  } catch (error) {
    console.error('   ❌ Error:', error.message);
    if (error.response) {
      console.error('   Detalles:', error.response.data);
    }
    return false;
  }
}

async function testBackendIntegration() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('🧪 PRUEBA 2: Backend Integration (Puerto 5000)');
  console.log('═══════════════════════════════════════════════════════════\n');

  try {
    // Health Check del backend
    console.log('1️⃣  Verificando salud del servicio de predicciones...');
    const health = await axios.get(`${BACKEND_URL}/predictions/health`);
    console.log('   ✅', health.data.message);
    console.log('   ✅ Versión ML:', health.data.data.version);

    // Información del modelo
    console.log('\n2️⃣  Obteniendo información del modelo...');
    const modelInfo = await axios.get(`${BACKEND_URL}/predictions/model-info`);
    console.log('   ✅ Tipo:', modelInfo.data.data.model_type);
    console.log('   ✅ Features:', modelInfo.data.data.features.length);

    console.log('\n   📊 Top 5 Features más importantes:');
    modelInfo.data.data.feature_importance.slice(0, 5).forEach((item, idx) => {
      console.log(`   ${idx + 1}. ${item.feature}: ${(item.importance * 100).toFixed(2)}%`);
    });

    return true;
  } catch (error) {
    console.error('   ❌ Error:', error.message);
    if (error.response) {
      console.error('   Detalles:', error.response.data);
    }
    return false;
  }
}

async function showUsageInstructions() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📖 INSTRUCCIONES DE USO EN LA PLATAFORMA');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('Para usar el modelo predictivo desde la plataforma web:\n');

  console.log('1️⃣  EMPRENDEDOR - Obtener mi predicción:');
  console.log('   • Endpoint: GET /api/predictions/my-prediction');
  console.log('   • Requiere: Token de autenticación');
  console.log('   • Requiere: Perfil completo con campos mínimos');
  console.log('   • Retorna: Score, clasificación, factores y recomendaciones\n');

  console.log('2️⃣  INVERSIONISTA - Ver predicción de un emprendedor:');
  console.log('   • Endpoint: GET /api/predictions/profile/:profileId');
  console.log('   • Requiere: Token de autenticación (tipo inversionista)');
  console.log('   • Caché: 24 horas (evita sobrecarga)');
  console.log('   • Retorna: Predicción + datos del emprendedor\n');

  console.log('3️⃣  FRONTEND - Servicios disponibles:');
  console.log('   • predictionService.getMyPrediction()');
  console.log('   • predictionService.getPredictionForProfile(profileId)');
  console.log('   • predictionService.checkServiceHealth()');
  console.log('   • predictionService.getModelInfo()\n');

  console.log('4️⃣  CAMPOS REQUERIDOS en el perfil:');
  console.log('   • sector, stage, fundingNeeded, educationLevel');
  console.log('   • previousExperienceYears, hasBusinessPlan');
  console.log('   • marketValidationLevel, initialCapital');
  console.log('   • projectedMonthlyRevenue, numberOfEmployees\n');
}

async function main() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║   🚀 TEST DE INTEGRACIÓN - MODELO PREDICTIVO ML          ║');
  console.log('║   Plataforma de Emprendimientos - Kennedy, Guayaquil     ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');

  // Ejecutar pruebas
  const mlOk = await testMLService();
  const backendOk = await testBackendIntegration();

  // Mostrar instrucciones
  await showUsageInstructions();

  // Resumen final
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 RESUMEN DE PRUEBAS');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log(`   Servicio ML (8000):    ${mlOk ? '✅ OK' : '❌ FAIL'}`);
  console.log(`   Backend Integration:   ${backendOk ? '✅ OK' : '❌ FAIL'}`);
  console.log('\n═══════════════════════════════════════════════════════════\n');

  if (mlOk && backendOk) {
    console.log('🎉 ¡TODAS LAS PRUEBAS PASARON EXITOSAMENTE!\n');
    console.log('El modelo predictivo está completamente integrado y listo para usar.\n');
  } else {
    console.log('⚠️  Algunas pruebas fallaron. Verifica que ambos servicios estén corriendo:\n');
    console.log('   • ML Service: cd ml-service && uvicorn app.main:app --reload');
    console.log('   • Backend: cd backend && npm start\n');
  }
}

// Ejecutar
main().catch(console.error);
