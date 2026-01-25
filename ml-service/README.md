# 🤖 Microservicio de Machine Learning - Success Predictor

Microservicio Python con FastAPI para predecir la probabilidad de éxito de emprendimientos culinarios en el sector Kennedy, Guayaquil.

## 📋 Descripción

Este microservicio utiliza un modelo XGBoost entrenado para evaluar la probabilidad de éxito de emprendimientos culinarios basándose en múltiples factores:

- **Datos del proyecto**: sector, etapa, financiamiento
- **Datos del emprendedor**: experiencia, educación
- **Validación de mercado**: plan de negocios, MVP, clientes

## 🚀 Instalación

### Prerrequisitos

- Python 3.10 o superior
- pip

### Paso 1: Crear entorno virtual

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### Paso 2: Instalar dependencias

```bash
pip install -r requirements.txt
```

### Paso 3: Configurar variables de entorno

```bash
cp .env.example .env
# Editar .env según sea necesario
```

## 🎯 Uso

### Generar Dataset Simulado

```bash
cd training
python generate_dataset.py
```

Esto generará un archivo `culinary_startups_kennedy.csv` en la carpeta `data/` con 500 registros simulados basados en estadísticas reales del sector.

### Entrenar el Modelo

```bash
cd training
python train_model.py
```

Este script:
- Carga y prepara los datos
- Entrena un modelo XGBoost
- Evalúa métricas de rendimiento
- Guarda el modelo en `models/success_predictor.joblib`

**Métricas esperadas:**
- Accuracy > 75%
- Precision > 70%
- Recall > 70%
- F1-Score > 70%
- ROC-AUC > 0.80

### Iniciar el Servidor API

```bash
cd app
python main.py
```

O con uvicorn directamente:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 5000 --reload
```

La API estará disponible en: `http://localhost:5000`

Documentación interactiva: `http://localhost:5000/docs`

## 📡 Endpoints

### `POST /predict`

Predice la probabilidad de éxito de un emprendimiento.

**Request Body:**
```json
{
  "sector": "restaurante",
  "stage": "desarrollo",
  "years_in_business": 1,
  "number_of_employees": 3,
  "funding_needed": 35000,
  "education_level": "universitario",
  "previous_experience_years": 5,
  "has_business_plan": true,
  "market_validation_level": "mvp",
  "initial_capital": 15000,
  "projected_monthly_revenue": 8000
}
```

**Response:**
```json
{
  "success_score": 76.5,
  "classification": "ALTO",
  "confidence": 0.82,
  "key_factors": {
    "positive": [
      {"factor": "Experiencia previa en el sector", "impact": 0.25},
      {"factor": "Tiene plan de negocios", "impact": 0.18}
    ],
    "negative": [
      {"factor": "Ratio financiamiento/capital alto", "impact": -0.15}
    ]
  },
  "recommendations": [
    "Considera reducir el financiamiento inicial...",
    "Continúa desarrollando tu plan de negocios..."
  ]
}
```

### `GET /health`

Verifica el estado del servicio.

### `GET /model/info`

Obtiene información sobre el modelo cargado (features, importancia, etc.).

### `POST /predict/batch`

Realiza predicciones en lote para múltiples emprendimientos.

## 🧪 Testing

```bash
pytest
```

## 📊 Estructura del Proyecto

```
ml-service/
├── app/
│   ├── main.py              # API FastAPI
│   ├── predictor.py         # Lógica de predicción
│   └── schemas.py           # Modelos Pydantic
├── training/
│   ├── generate_dataset.py  # Generador de datos
│   └── train_model.py       # Script de entrenamiento
├── models/
│   └── success_predictor.joblib  # Modelo entrenado
├── data/
│   └── culinary_startups_kennedy.csv  # Dataset
├── config.py                # Configuración
├── requirements.txt         # Dependencias
└── README.md
```

## 🔬 Modelo Predictivo

### Algoritmo: XGBoost (Gradient Boosting)

**¿Por qué XGBoost?**
- Excelente con datasets pequeños/medianos
- Maneja bien datos mixtos (numéricos + categóricos)
- Alta precisión con interpretabilidad
- Rápido para inferencia

### Features Utilizadas (11 variables)

1. **sector_encoded**: Tipo de negocio culinario
2. **stage_encoded**: Etapa del proyecto
3. **years_in_business**: Años operando
4. **number_of_employees**: Tamaño del equipo
5. **funding_needed**: Capital requerido
6. **education_level_encoded**: Nivel educativo
7. **previous_experience_years**: Experiencia previa
8. **has_business_plan**: Tiene plan de negocios (0/1)
9. **market_validation_encoded**: Nivel de validación
10. **initial_capital**: Capital disponible
11. **projected_monthly_revenue**: Ingresos proyectados

### Target

- **success**: 1 si el negocio sobrevive/prospera >2 años, 0 si fracasa antes

### Fuentes de Datos

El dataset simulado se basa en:

1. **INEC** - Tasa de supervivencia de empresas (~40%)
2. **SRI** - Distribución de empresas por sector
3. **Estudios ESPAE-ESPOL** - Impacto de plan de negocios (+35%)
4. **Análisis del sector Kennedy** - Distribución de tipos de negocio

## 🔌 Integración con Backend Node.js

El backend Node.js puede consumir este microservicio mediante HTTP:

```javascript
// Ejemplo en Node.js
const axios = require('axios');

const predictSuccess = async (entrepreneurData) => {
  const response = await axios.post('http://localhost:5000/predict', {
    sector: entrepreneurData.sector,
    stage: entrepreneurData.stage,
    // ... otros campos
  });

  return response.data;
};
```

## 📝 Notas de Desarrollo

- El modelo se carga en memoria al iniciar el servidor (singleton)
- CORS está configurado para permitir requests desde el frontend
- El modelo puede ser reentrenado en cualquier momento ejecutando `train_model.py`
- Los datos simulados son representativos pero deben ser reemplazados con datos reales en producción

## 📄 Licencia

Este proyecto es parte de una tesis académica.

---

**Desarrollado para**: Plataforma de Emprendimientos Culinarios - Kennedy, Guayaquil
**Versión**: 1.0.0
