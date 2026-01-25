"""
Schemas de Pydantic para validación de datos
"""
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict


class PredictionRequest(BaseModel):
    """
    Request para predicción de éxito de emprendimiento
    """
    # Datos del proyecto
    sector: str = Field(..., description="Sector del emprendimiento")
    stage: str = Field(..., description="Etapa del proyecto: idea, desarrollo, operando")
    years_in_business: int = Field(..., ge=0, description="Años en el negocio")
    number_of_employees: int = Field(..., ge=0, description="Número de empleados")
    funding_needed: float = Field(..., gt=0, description="Financiamiento necesario en USD")

    # Datos del emprendedor
    education_level: str = Field(..., description="Nivel educativo: secundaria, tecnico, universitario, postgrado")
    previous_experience_years: int = Field(..., ge=0, description="Años de experiencia previa en el sector")

    # Datos del plan
    has_business_plan: bool = Field(..., description="¿Tiene plan de negocios?")
    market_validation_level: str = Field(..., description="Nivel de validación: ninguna, encuestas, mvp, clientes_activos")
    initial_capital: float = Field(..., ge=0, description="Capital inicial disponible en USD")
    projected_monthly_revenue: float = Field(..., ge=0, description="Ingresos mensuales proyectados en USD")

    @validator('sector')
    def validate_sector(cls, v):
        allowed = ['culinario', 'restaurante', 'cafeteria', 'food-truck', 'catering', 'panaderia', 'bebidas', 'otro']
        if v not in allowed:
            raise ValueError(f'Sector debe ser uno de: {", ".join(allowed)}')
        return v

    @validator('stage')
    def validate_stage(cls, v):
        allowed = ['idea', 'desarrollo', 'operando']
        if v not in allowed:
            raise ValueError(f'Stage debe ser uno de: {", ".join(allowed)}')
        return v

    @validator('education_level')
    def validate_education(cls, v):
        allowed = ['secundaria', 'tecnico', 'universitario', 'postgrado']
        if v not in allowed:
            raise ValueError(f'Nivel educativo debe ser uno de: {", ".join(allowed)}')
        return v

    @validator('market_validation_level')
    def validate_market_validation(cls, v):
        allowed = ['ninguna', 'encuestas', 'mvp', 'clientes_activos']
        if v not in allowed:
            raise ValueError(f'Validación de mercado debe ser una de: {", ".join(allowed)}')
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "sector": "restaurante",
                "stage": "desarrollo",
                "years_in_business": 1,
                "number_of_employees": 3,
                "funding_needed": 35000,
                "education_level": "universitario",
                "previous_experience_years": 5,
                "has_business_plan": True,
                "market_validation_level": "mvp",
                "initial_capital": 15000,
                "projected_monthly_revenue": 8000
            }
        }


class KeyFactor(BaseModel):
    """
    Factor clave que influye en la predicción
    """
    factor: str
    impact: float


class PredictionResponse(BaseModel):
    """
    Respuesta de predicción
    """
    success_score: float = Field(..., description="Probabilidad de éxito (0-100)")
    classification: str = Field(..., description="Clasificación: BAJO, MEDIO, ALTO")
    confidence: float = Field(..., description="Confianza del modelo (0-1)")
    key_factors: Dict[str, List[KeyFactor]] = Field(..., description="Factores positivos y negativos")
    recommendations: List[str] = Field(..., description="Recomendaciones personalizadas")

    class Config:
        json_schema_extra = {
            "example": {
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
                    "Considera reducir el financiamiento inicial o aumentar el capital propio",
                    "Continúa desarrollando tu plan de negocios con proyecciones detalladas"
                ]
            }
        }


class HealthResponse(BaseModel):
    """
    Respuesta de health check
    """
    status: str
    version: str
    model_loaded: bool
