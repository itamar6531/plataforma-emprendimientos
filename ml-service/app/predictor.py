"""
Módulo de predicción que carga y utiliza el modelo entrenado
"""
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from typing import Dict, List, Tuple
import config


class SuccessPredictor:
    """
    Clase para realizar predicciones de éxito de emprendimientos
    """

    def __init__(self, model_path: Path = config.MODEL_PATH):
        """
        Inicializa el predictor cargando el modelo

        Args:
            model_path: Ruta al archivo del modelo
        """
        self.model_path = model_path
        self.model_data = None
        self.model = None
        self.encoders = None
        self.version = None
        self.is_loaded = False

        self.load_model()

    def load_model(self):
        """
        Carga el modelo y los encoders desde disco
        """
        try:
            if not self.model_path.exists():
                raise FileNotFoundError(f"Modelo no encontrado en: {self.model_path}")

            self.model_data = joblib.load(self.model_path)
            self.model = self.model_data['model']
            self.encoders = self.model_data['encoders']
            self.version = self.model_data.get('version', 'unknown')
            self.is_loaded = True

            print(f"OK Modelo cargado exitosamente (versión: {self.version})")

        except Exception as e:
            print(f"ERROR Error cargando modelo: {e}")
            self.is_loaded = False
            raise

    def preprocess_input(self, data: Dict) -> np.ndarray:
        """
        Preprocesa los datos de entrada para el modelo

        NOTA: El sector NO se usa en la predicción para evitar sesgo.
        Todos los sectores tienen las mismas oportunidades.

        Args:
            data: Diccionario con los datos del emprendimiento

        Returns:
            np.ndarray: Array con las features procesadas
        """
        # Codificar variables categóricas (sector NO se usa)
        stage_encoded = self.encoders['stage'].transform([data['stage']])[0]
        education_encoded = self.encoders['education_level'].transform([data['education_level']])[0]
        market_validation_encoded = self.encoders['market_validation_level'].transform([data['market_validation_level']])[0]

        # Convertir booleano a int
        has_business_plan = 1 if data['has_business_plan'] else 0

        # Construir array de features en el orden correcto (SIN sector)
        features = np.array([
            stage_encoded,
            data['years_in_business'],
            data['number_of_employees'],
            data['funding_needed'],
            education_encoded,
            data['previous_experience_years'],
            has_business_plan,
            market_validation_encoded,
            data['initial_capital'],
            data['projected_monthly_revenue']
        ]).reshape(1, -1)

        return features

    def predict(self, data: Dict) -> Dict:
        """
        Realiza predicción de éxito usando el modelo ML

        Args:
            data: Diccionario con los datos del emprendimiento

        Returns:
            Dict: Resultado de la predicción con análisis detallado
        """
        if not self.is_loaded:
            raise RuntimeError("Modelo no cargado")

        # Preprocesar
        features = self.preprocess_input(data)

        # Predicción del modelo ML
        prediction_proba = self.model.predict_proba(features)[0]
        success_probability = prediction_proba[1]  # Probabilidad de clase 1 (éxito)
        success_score = success_probability * 100

        # Clasificación
        if success_score >= 70:
            classification = "ALTO"
        elif success_score >= 50:
            classification = "MEDIO"
        else:
            classification = "BAJO"

        # Confianza (basada en qué tan cerca está de 0.5)
        confidence = abs(success_probability - 0.5) * 2

        # Análisis de factores clave
        key_factors = self._analyze_key_factors(data, features)

        # Recomendaciones personalizadas
        recommendations = self._generate_recommendations(data, success_score, key_factors)

        return {
            "success_score": round(success_score, 2),
            "classification": classification,
            "confidence": round(confidence, 3),
            "key_factors": key_factors,
            "recommendations": recommendations
        }

    def _analyze_key_factors(self, data: Dict, features: np.ndarray) -> Dict[str, List[Dict]]:
        """
        Analiza los factores clave que influyen en la predicción

        ACTUALIZADO v2.4: Modelo balanceado y realista
        - Importancias recalibradas basadas en el modelo reentrenado
        - Plan de negocios ya no tiene peso desproporcionado (20.9% vs 35.2% antes)
        - La etapa del proyecto es ahora el factor más importante (24%)

        Args:
            data: Datos originales
            features: Features procesadas

        Returns:
            Dict con factores positivos y áreas de mejora
        """
        positive_factors = []
        improvement_areas = []  # Áreas de mejora en lugar de "negativos"

        # Factor 1: Plan de negocios (20.94% - reducido de 35.24%)
        if data['has_business_plan']:
            positive_factors.append({
                "factor": "Cuenta con plan de negocios",
                "impact": 0.21
            })
        else:
            improvement_areas.append({
                "factor": "Desarrollar un plan de negocios aumentaría tu score",
                "impact": -0.08  # Reducido de -0.10
            })

        # Factor 2: Etapa del proyecto (12.79%)
        if data['stage'] == 'operando':
            positive_factors.append({
                "factor": "Negocio ya en operación",
                "impact": 0.13
            })
        elif data['stage'] == 'desarrollo':
            positive_factors.append({
                "factor": "Proyecto en etapa de desarrollo",
                "impact": 0.06
            })
        # Sin penalización para etapa idea

        # Factor 3: Nivel educativo (8.45%)
        if data['education_level'] == 'postgrado':
            positive_factors.append({
                "factor": "Formación académica avanzada",
                "impact": 0.08
            })
        elif data['education_level'] == 'universitario':
            positive_factors.append({
                "factor": "Formación universitaria",
                "impact": 0.05
            })
        elif data['education_level'] == 'tecnico':
            positive_factors.append({
                "factor": "Formación técnica",
                "impact": 0.02
            })

        # Factor 4: Experiencia previa (7.76%)
        if data['previous_experience_years'] >= 5:
            positive_factors.append({
                "factor": "Amplia experiencia en el sector (5+ años)",
                "impact": 0.10
            })
        elif data['previous_experience_years'] >= 3:
            positive_factors.append({
                "factor": "Buena experiencia en el sector (3+ años)",
                "impact": 0.07
            })
        elif data['previous_experience_years'] >= 1:
            positive_factors.append({
                "factor": "Experiencia inicial en el sector",
                "impact": 0.04
            })
        else:
            improvement_areas.append({
                "factor": "Ganar experiencia en el sector mejoraría tu perfil",
                "impact": -0.05
            })

        # Factor 5: Validación de mercado (6.74%)
        if data['market_validation_level'] == 'clientes_activos':
            positive_factors.append({
                "factor": "Ya cuenta con clientes activos",
                "impact": 0.10
            })
        elif data['market_validation_level'] == 'mvp':
            positive_factors.append({
                "factor": "Ha validado el mercado con MVP",
                "impact": 0.07
            })
        elif data['market_validation_level'] == 'encuestas':
            positive_factors.append({
                "factor": "Ha realizado estudios de mercado",
                "impact": 0.04
            })
        else:
            improvement_areas.append({
                "factor": "Validar el mercado aumentaría la confianza",
                "impact": -0.05
            })

        # Factor 6: Capital inicial (6.41%)
        capital_ratio = data['funding_needed'] / (data['initial_capital'] + 1)
        if capital_ratio < 1.5:
            positive_factors.append({
                "factor": "Sólida base de capital propio",
                "impact": 0.08
            })
        elif capital_ratio < 3:
            positive_factors.append({
                "factor": "Balance razonable de capital",
                "impact": 0.04
            })

        # Factor 7: Equipo de trabajo (6.86%)
        if data['number_of_employees'] >= 3:
            positive_factors.append({
                "factor": "Cuenta con equipo de trabajo",
                "impact": 0.05
            })
        elif data['number_of_employees'] >= 1:
            positive_factors.append({
                "factor": "Tiene colaboradores",
                "impact": 0.02
            })

        # Factor 8: Proyecciones de ingresos (6.58%)
        revenue_ratio = (data['projected_monthly_revenue'] * 12) / (data['funding_needed'] + 1)
        if revenue_ratio > 1.0:
            positive_factors.append({
                "factor": "Proyecciones de ingresos sólidas",
                "impact": 0.05
            })
        elif revenue_ratio > 0.5:
            positive_factors.append({
                "factor": "Proyecciones de ingresos moderadas",
                "impact": 0.02
            })

        # Ordenar por impacto
        positive_factors.sort(key=lambda x: x['impact'], reverse=True)
        improvement_areas.sort(key=lambda x: x['impact'])

        return {
            "positive": positive_factors[:5],  # Top 5
            "negative": improvement_areas[:5]  # Áreas de mejora
        }

    def _generate_recommendations(self, data: Dict, success_score: float, key_factors: Dict) -> List[str]:
        """
        Genera recomendaciones personalizadas

        Args:
            data: Datos del emprendimiento
            success_score: Score de éxito
            key_factors: Factores analizados

        Returns:
            List[str]: Lista de recomendaciones
        """
        recommendations = []

        # Recomendaciones basadas en puntos débiles
        if not data['has_business_plan']:
            recommendations.append(
                "Desarrolla un plan de negocios detallado que incluya análisis de mercado, "
                "proyecciones financieras y estrategia de operaciones"
            )

        if data['previous_experience_years'] < 2:
            recommendations.append(
                "Considera asociarte con alguien con experiencia en el sector culinario "
                "o busca mentoría de emprendedores exitosos"
            )

        capital_ratio = data['funding_needed'] / (data['initial_capital'] + 1)
        if capital_ratio > 3:
            recommendations.append(
                "Intenta aumentar tu capital inicial o reduce el financiamiento requerido. "
                "Un ratio más bajo aumenta la confianza de los inversionistas"
            )

        if data['market_validation_level'] in ['ninguna', 'encuestas']:
            recommendations.append(
                "Valida tu idea con un MVP (Producto Mínimo Viable) antes de buscar inversión. "
                "Demuestra tracción con clientes reales"
            )

        if data['number_of_employees'] == 0 and data['stage'] != 'idea':
            recommendations.append(
                "Considera formar un equipo fundador complementario. "
                "Los inversionistas valoran equipos completos"
            )

        if data['stage'] == 'idea':
            recommendations.append(
                "Avanza a la etapa de desarrollo implementando un piloto o prototipo funcional"
            )

        # Recomendaciones basadas en score
        if success_score < 50:
            recommendations.append(
                "Tu score actual es bajo. Enfócate en los factores negativos identificados "
                "antes de buscar inversión"
            )
        elif success_score < 70:
            recommendations.append(
                "Estás en buen camino. Fortalece algunos aspectos clave para aumentar "
                "tu probabilidad de éxito"
            )

        # Limitar a 5 recomendaciones más relevantes
        return recommendations[:5]

    def get_feature_importance(self) -> pd.DataFrame:
        """
        Obtiene la importancia de las features del modelo

        Returns:
            pd.DataFrame: DataFrame con features y su importancia
        """
        if not self.is_loaded:
            raise RuntimeError("Modelo no cargado")

        importance_df = pd.DataFrame({
            'feature': config.FEATURE_NAMES,
            'importance': self.model.feature_importances_
        }).sort_values('importance', ascending=False)

        return importance_df


# Instancia global del predictor
predictor = None


def get_predictor() -> SuccessPredictor:
    """
    Obtiene la instancia global del predictor (singleton)

    Returns:
        SuccessPredictor: Instancia del predictor
    """
    global predictor
    if predictor is None:
        predictor = SuccessPredictor()
    return predictor
