"""
Generador de Dataset Simulado para Emprendimientos Culinarios en Kennedy, Guayaquil

FUENTES DE DATOS:
1. INEC - Instituto Nacional de Estadística y Censos (Ecuador)
   - Tasa de supervivencia de empresas: ~40% sobreviven más de 3 años
   - Promedio de empleados en microempresas: 2-5 personas

2. SRI - Servicio de Rentas Internas (Ecuador)
   - Distribución de empresas por sector económico
   - Nivel de formalización de negocios culinarios

3. Estudios especializados:
   - "Emprendimiento en Ecuador 2020" - ESPAE-ESPOL
   - Tasa de éxito aumenta 35% con plan de negocios (no 26x - ver v2.4)
   - Experiencia previa incrementa éxito en 40%

4. Análisis del sector Kennedy:
   - Zona comercial de alto tráfico en Guayaquil
   - Predominancia de restaurantes (30%), cafeterías (25%), food trucks (15%)
   - Inversión inicial promedio: $15,000 - $50,000 USD

VARIABLES PREDICTORAS:
- Sector del negocio
- Etapa del proyecto
- Años en el negocio
- Número de empleados
- Financiamiento necesario
- Nivel educativo del emprendedor
- Años de experiencia previa
- Tiene plan de negocios
- Nivel de validación de mercado
- Capital inicial disponible
- Ingresos mensuales proyectados

TARGET:
- success: 1 si el negocio sobrevive/prospera >2 años, 0 si fracasa antes
"""

import pandas as pd
import numpy as np
from datetime import datetime
from pathlib import Path

# Semilla para reproducibilidad
np.random.seed(42)

def generate_dataset(n_samples=500):
    """
    Genera dataset simulado de emprendimientos culinarios

    Args:
        n_samples (int): Número de registros a generar

    Returns:
        pd.DataFrame: Dataset generado
    """

    # Distribución basada en observaciones del sector Kennedy
    # ACTUALIZADO: Se eliminaron categorías redundantes (culinario, bebidas)
    # para simplificar el modelo y evitar confusión en la clasificación
    sectors = np.random.choice(
        ['restaurante', 'cafeteria', 'food-truck', 'catering', 'panaderia', 'otro'],
        size=n_samples,
        p=[0.30, 0.25, 0.18, 0.12, 0.10, 0.05]  # Probabilidades redistribuidas
    )

    # Etapas del proyecto - la mayoría empieza en desarrollo
    stages = np.random.choice(
        ['idea', 'desarrollo', 'operando'],
        size=n_samples,
        p=[0.25, 0.50, 0.25]
    )

    # Años en el negocio - correlacionado con etapa
    years_in_business = []
    for stage in stages:
        if stage == 'idea':
            years_in_business.append(0)
        elif stage == 'desarrollo':
            years_in_business.append(np.random.choice([0, 1, 2], p=[0.6, 0.3, 0.1]))
        else:  # operando
            years_in_business.append(np.random.randint(1, 8))
    years_in_business = np.array(years_in_business)

    # Número de empleados - microempresas predominan (INEC)
    number_of_employees = np.random.choice(
        range(0, 11),
        size=n_samples,
        p=[0.15, 0.25, 0.20, 0.15, 0.10, 0.05, 0.04, 0.03, 0.02, 0.005, 0.005]
    )

    # Financiamiento necesario - independiente del sector para evitar sesgo
    funding_needed = np.random.uniform(10000, 60000, size=n_samples)

    # Nivel educativo - distribución típica en Ecuador
    education_level = np.random.choice(
        ['secundaria', 'tecnico', 'universitario', 'postgrado'],
        size=n_samples,
        p=[0.20, 0.30, 0.40, 0.10]
    )

    # Años de experiencia previa en el sector
    previous_experience_years = np.random.choice(
        range(0, 16),
        size=n_samples,
        p=[0.25, 0.15, 0.12, 0.10, 0.08, 0.07, 0.06, 0.05, 0.04, 0.03, 0.02, 0.01, 0.01, 0.003, 0.003, 0.004]
    )

    # Tiene plan de negocios - 45% tienen según estudios
    has_business_plan = np.random.choice([0, 1], size=n_samples, p=[0.55, 0.45])

    # Nivel de validación de mercado
    market_validation_level = np.random.choice(
        ['ninguna', 'encuestas', 'mvp', 'clientes_activos'],
        size=n_samples,
        p=[0.30, 0.35, 0.25, 0.10]
    )

    # Capital inicial disponible - correlacionado con nivel educativo
    initial_capital = []
    for edu in education_level:
        if edu == 'postgrado':
            initial_capital.append(np.random.uniform(10000, 40000))
        elif edu == 'universitario':
            initial_capital.append(np.random.uniform(5000, 25000))
        elif edu == 'tecnico':
            initial_capital.append(np.random.uniform(2000, 15000))
        else:
            initial_capital.append(np.random.uniform(1000, 10000))
    initial_capital = np.array(initial_capital)

    # Ingresos mensuales proyectados - independiente del sector para evitar sesgo
    # Solo varía por etapa del proyecto
    projected_monthly_revenue = []
    for stage in stages:
        base = np.random.uniform(2000, 8000)  # Rango uniforme para todos

        # Ajustar solo por etapa
        if stage == 'idea':
            base *= 0.7
        elif stage == 'operando':
            base *= 1.3

        projected_monthly_revenue.append(base)
    projected_monthly_revenue = np.array(projected_monthly_revenue)

    # ===== GENERAR TARGET (SUCCESS) =====
    # ACTUALIZADO v2.4: Modelo balanceado y realista
    #
    # PROBLEMA IDENTIFICADO (v2.3):
    #   - Plan de negocios aportaba +8 puntos (13.5% del score)
    #   - Pero XGBoost aprendía interacciones no lineales extremas
    #   - Resultado: sin plan + factores débiles → 1-5% (penalización multiplicativa)
    #   - Ejemplo: perfil con experiencia+MVP+educación → solo 3.2% sin plan
    #
    # SOLUCIÓN (v2.4):
    #   - Reducir diferencial del plan de negocios (+5 en lugar de +8)
    #   - Agregar base mínima para casos sin plan (+2 puntos)
    #   - Esto reduce la penalización implícita del modelo ML
    #
    # JUSTIFICACIÓN TÉCNICA:
    #   - Estudios ESPAE-ESPOL indican +35% éxito con plan (no 26x más)
    #   - Un emprendedor sin plan pero con experiencia/MVP debe tener ~60-70%
    #   - El plan es factor DIFERENCIADOR, no requisito ELIMINATORIO

    success_score = np.zeros(n_samples)

    for i in range(n_samples):
        score = 40  # Base: 40 puntos (aumentado para dar más oportunidad a todos)

        # Factor 1: Plan de negocios (diferencial pequeño)
        # ACTUALIZADO v2.4.3: Diferencial mínimo (2 puntos netos)
        if has_business_plan[i] == 1:
            score += 3
        # Sin else: no penaliza la ausencia de plan

        # Factor 2: Experiencia previa (hasta +15 puntos - FACTOR CLAVE)
        # ACTUALIZADO v2.4.3: La experiencia es el factor más importante
        if previous_experience_years[i] >= 5:
            score += 15
        elif previous_experience_years[i] >= 3:
            score += 11
        elif previous_experience_years[i] >= 1:
            score += 6

        # Factor 3: Validación de mercado (hasta +15 puntos - FACTOR CLAVE)
        # ACTUALIZADO v2.4.3: MVP y clientes son muy valiosos
        if market_validation_level[i] == 'clientes_activos':
            score += 15
        elif market_validation_level[i] == 'mvp':
            score += 11
        elif market_validation_level[i] == 'encuestas':
            score += 6

        # Factor 4: Etapa del proyecto (hasta +4 puntos - REDUCIDO)
        # ACTUALIZADO v2.4.3: Etapa tiene menos peso que preparación
        if stages[i] == 'operando':
            score += 4
        elif stages[i] == 'desarrollo':
            score += 2

        # Factor 5: Capital suficiente (hasta +8 puntos)
        capital_ratio = funding_needed[i] / (initial_capital[i] + 1)
        if capital_ratio < 1.5:
            score += 8
        elif capital_ratio < 3:
            score += 4

        # Factor 6: Educación (hasta +6 puntos)
        if education_level[i] == 'postgrado':
            score += 6
        elif education_level[i] == 'universitario':
            score += 4
        elif education_level[i] == 'tecnico':
            score += 2

        # Factor 7: Proyección de ingresos (hasta +5 puntos)
        revenue_ratio = (projected_monthly_revenue[i] * 12) / (funding_needed[i] + 1)
        if revenue_ratio > 1.0:
            score += 5
        elif revenue_ratio > 0.5:
            score += 2

        # Factor 8: Tamaño del equipo (hasta +4 puntos)
        if number_of_employees[i] >= 3:
            score += 4
        elif number_of_employees[i] >= 1:
            score += 2

        # NOTA: NO hay sesgo por sector ni penalizaciones

        # Limitar score entre 20 y 95 (nunca extremos absolutos)
        score = max(20, min(95, score))
        success_score[i] = score

    # Generar labels: score >= 50 = éxito, con ruido variable
    # ACTUALIZADO v2.4.2: Umbral restaurado a 50, pero con más variabilidad
    # para que el modelo aprenda mejor las diferencias entre perfiles
    noise = np.random.random(n_samples)
    success = np.where(
        success_score >= 60,  # Éxito muy probable
        np.where(noise > 0.05, 1, 0),  # 95% de los >= 60 son éxito
        np.where(
            success_score >= 50,  # Éxito probable
            np.where(noise > 0.15, 1, 0),  # 85% de los 50-59 son éxito
            np.where(noise > 0.85, 1, 0)   # 15% de los < 50 son éxito (más ruido)
        )
    )

    # Guardar score para análisis
    success_probability = success_score / 100

    # Crear DataFrame
    df = pd.DataFrame({
        'sector': sectors,
        'stage': stages,
        'years_in_business': years_in_business,
        'number_of_employees': number_of_employees,
        'funding_needed': funding_needed.round(2),
        'education_level': education_level,
        'previous_experience_years': previous_experience_years,
        'has_business_plan': has_business_plan,
        'market_validation_level': market_validation_level,
        'initial_capital': initial_capital.round(2),
        'projected_monthly_revenue': projected_monthly_revenue.round(2),
        'success': success,
        'success_probability': success_probability.round(4)  # Para análisis, no se usa en entrenamiento
    })

    return df


if __name__ == "__main__":
    print("=" * 70)
    print("GENERADOR DE DATASET SIMULADO - EMPRENDIMIENTOS CULINARIOS KENNEDY")
    print("=" * 70)
    print()

    # Generar dataset
    print("Generando dataset con 1000 registros simulados...")
    df = generate_dataset(n_samples=5000)  # Aumentado para mejor generalización del ML

    # Guardar
    data_dir = Path(__file__).parent.parent / "data"
    data_dir.mkdir(exist_ok=True)
    output_path = data_dir / "culinary_startups_kennedy.csv"
    df.to_csv(output_path, index=False)
    print(f"OK Dataset guardado en: {output_path}")
    print()

    # Estadísticas
    print("=" * 70)
    print("ESTADÍSTICAS DEL DATASET GENERADO")
    print("=" * 70)
    print(f"\nTotal de registros: {len(df)}")
    print(f"\nDistribución del Target:")
    print(f"  - Éxito (1): {df['success'].sum()} ({df['success'].mean()*100:.1f}%)")
    print(f"  - Fracaso (0): {(1-df['success']).sum()} ({(1-df['success'].mean())*100:.1f}%)")

    print(f"\n\nDistribución por Sector:")
    print(df['sector'].value_counts().to_string())

    print(f"\n\nDistribución por Etapa:")
    print(df['stage'].value_counts().to_string())

    print(f"\n\nEstadísticas Financieras:")
    print(f"  - Financiamiento promedio: ${df['funding_needed'].mean():,.2f}")
    print(f"  - Capital inicial promedio: ${df['initial_capital'].mean():,.2f}")
    print(f"  - Ingresos mensuales proyectados: ${df['projected_monthly_revenue'].mean():,.2f}")

    print(f"\n\nNivel Educativo:")
    print(df['education_level'].value_counts().to_string())

    print(f"\n\nPlan de Negocios:")
    print(f"  - Con plan: {df['has_business_plan'].sum()} ({df['has_business_plan'].mean()*100:.1f}%)")
    print(f"  - Sin plan: {(1-df['has_business_plan']).sum()} ({(1-df['has_business_plan'].mean())*100:.1f}%)")

    print("\n" + "=" * 70)
    print("Dataset generado exitosamente")
    print("=" * 70)
