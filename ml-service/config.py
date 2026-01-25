"""
Configuración del microservicio ML
"""
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# Directorios
BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "models"
DATA_DIR = BASE_DIR / "data"

# Servidor
PORT = int(os.getenv("PORT", 8000))
HOST = os.getenv("HOST", "0.0.0.0")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# Modelo
MODEL_PATH = MODELS_DIR / "success_predictor.joblib"
MODEL_VERSION = os.getenv("MODEL_VERSION", "1.0.0")

# CORS
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://localhost:5173"
).split(",")

# Features del modelo (en orden) - ACTUALIZADO v2.3: sector removido
FEATURE_NAMES = [
    'stage_encoded',
    'years_in_business',
    'number_of_employees',
    'funding_needed',
    'education_level_encoded',
    'previous_experience_years',
    'has_business_plan',
    'market_validation_encoded',
    'initial_capital',
    'projected_monthly_revenue',
]

# Mapeo de valores categóricos
# ACTUALIZADO v2.0: Se eliminaron categorías redundantes (culinario, bebidas)
SECTOR_MAPPING = {
    'restaurante': 0,
    'cafeteria': 1,
    'food-truck': 2,
    'catering': 3,
    'panaderia': 4,
    'otro': 5
}

STAGE_MAPPING = {
    'idea': 0,
    'desarrollo': 1,
    'operando': 2
}

EDUCATION_MAPPING = {
    'secundaria': 0,
    'tecnico': 1,
    'universitario': 2,
    'postgrado': 3
}

MARKET_VALIDATION_MAPPING = {
    'ninguna': 0,
    'encuestas': 1,
    'mvp': 2,
    'clientes_activos': 3
}
