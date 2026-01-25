"""
API FastAPI para el Modelo Predictivo de Éxito de Emprendimientos

Este microservicio proporciona endpoints para:
- Predicciones de éxito de emprendimientos culinarios
- Health checks
- Información del modelo
"""

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import sys
from pathlib import Path

# Agregar el directorio raíz al path para imports
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import config
from app.schemas import PredictionRequest, PredictionResponse, HealthResponse
from app.predictor import get_predictor

# Crear aplicación FastAPI
app = FastAPI(
    title="Success Predictor API",
    description="API para predecir el éxito de emprendimientos culinarios en Kennedy, Guayaquil",
    version=config.MODEL_VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """
    Evento de inicio: carga el modelo en memoria
    """
    try:
        predictor = get_predictor()
        print("\n" + "="*70)
        print("[START] SUCCESS PREDICTOR API INICIADO")
        print("="*70)
        print(f"Versión del modelo: {config.MODEL_VERSION}")
        print(f"Modelo cargado: {predictor.is_loaded}")
        print(f"Puerto: {config.PORT}")
        print(f"Documentación: http://localhost:{config.PORT}/docs")
        print("="*70 + "\n")
    except Exception as e:
        print(f"[ERROR] Error al cargar el modelo: {e}")
        print("[WARNING]  El servidor iniciará pero las predicciones fallarán hasta que se cargue el modelo")


@app.get("/", tags=["General"])
async def root():
    """
    Endpoint raíz
    """
    return {
        "message": "Success Predictor API",
        "version": config.MODEL_VERSION,
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health", response_model=HealthResponse, tags=["General"])
async def health_check():
    """
    Health check del servicio
    """
    try:
        predictor = get_predictor()
        return HealthResponse(
            status="healthy",
            version=config.MODEL_VERSION,
            model_loaded=predictor.is_loaded
        )
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "unhealthy",
                "version": config.MODEL_VERSION,
                "model_loaded": False,
                "error": str(e)
            }
        )


@app.post("/predict", response_model=PredictionResponse, tags=["Predictions"])
async def predict_success(request: PredictionRequest):
    """
    Predice la probabilidad de éxito de un emprendimiento

    Args:
        request: Datos del emprendimiento

    Returns:
        PredictionResponse: Predicción con análisis detallado

    Raises:
        HTTPException: Si hay error en la predicción
    """
    try:
        predictor = get_predictor()

        if not predictor.is_loaded:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Modelo no cargado. Intenta nuevamente más tarde."
            )

        # Convertir request a dict
        data = request.model_dump()

        # Realizar predicción
        result = predictor.predict(data)

        return PredictionResponse(**result)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error en los datos de entrada: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al realizar predicción: {str(e)}"
        )


@app.get("/model/info", tags=["Model"])
async def model_info():
    """
    Información sobre el modelo cargado
    """
    try:
        predictor = get_predictor()

        if not predictor.is_loaded:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Modelo no cargado"
            )

        feature_importance = predictor.get_feature_importance()

        return {
            "version": predictor.version,
            "model_type": "XGBoost Classifier",
            "features": config.FEATURE_NAMES,
            "feature_importance": feature_importance.to_dict('records'),
            "categories": {
                "sector": list(config.SECTOR_MAPPING.keys()),
                "stage": list(config.STAGE_MAPPING.keys()),
                "education_level": list(config.EDUCATION_MAPPING.keys()),
                "market_validation_level": list(config.MARKET_VALIDATION_MAPPING.keys())
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener información del modelo: {str(e)}"
        )


@app.post("/predict/batch", tags=["Predictions"])
async def predict_batch(requests: list[PredictionRequest]):
    """
    Realiza predicciones en lote

    Args:
        requests: Lista de emprendimientos

    Returns:
        Lista de predicciones
    """
    try:
        predictor = get_predictor()

        if not predictor.is_loaded:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Modelo no cargado"
            )

        results = []
        for req in requests:
            data = req.model_dump()
            result = predictor.predict(data)
            results.append(result)

        return results

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error en los datos de entrada: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al realizar predicciones: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=config.HOST,
        port=config.PORT,
        reload=config.ENVIRONMENT == "development"
    )
