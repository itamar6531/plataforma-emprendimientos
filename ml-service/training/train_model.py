"""
Script de Entrenamiento del Modelo Predictivo

Este script entrena un modelo XGBoost para predecir la probabilidad de éxito
de emprendimientos culinarios en el sector Kennedy, Guayaquil.
"""

import pandas as pd
import numpy as np
import joblib
from pathlib import Path
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, classification_report,
    roc_curve
)
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.calibration import CalibratedClassifierCV
from sklearn.pipeline import Pipeline
from xgboost import XGBClassifier
from imblearn.over_sampling import SMOTE


def load_and_prepare_data(data_path):
    """
    Carga y prepara los datos para entrenamiento

    Args:
        data_path (str): Ruta al archivo CSV

    Returns:
        tuple: X_train, X_test, y_train, y_test, feature_names, encoders
    """
    print(" Cargando dataset...")
    df = pd.read_csv(data_path)

    # Remover la columna success_probability (era solo para análisis)
    if 'success_probability' in df.columns:
        df = df.drop('success_probability', axis=1)

    print(f"   Total de registros: {len(df)}")
    print(f"   Distribución de clases: {df['success'].value_counts().to_dict()}")

    # Separar features y target
    X = df.drop('success', axis=1)
    y = df['success']

    # Codificar variables categóricas
    print("\n Codificando variables categóricas...")
    encoders = {}

    # NOTA: Sector se codifica pero NO se usa en el modelo para evitar sesgo
    # Solo se mantiene el encoder para compatibilidad con la API
    le_sector = LabelEncoder()
    le_sector.fit(X['sector'])
    encoders['sector'] = le_sector
    print(f"   - sector: {len(le_sector.classes_)} clases (NO usado en predicción)")

    # Eliminar sector del dataset de entrenamiento
    X = X.drop('sector', axis=1)

    categorical_columns = ['stage', 'education_level', 'market_validation_level']

    for col in categorical_columns:
        le = LabelEncoder()
        X[col] = le.fit_transform(X[col])
        encoders[col] = le
        print(f"   - {col}: {len(le.classes_)} clases")

    # Renombrar columnas para claridad
    X = X.rename(columns={
        'stage': 'stage_encoded',
        'education_level': 'education_level_encoded',
        'market_validation_level': 'market_validation_encoded'
    })

    feature_names = X.columns.tolist()

    # Split train/test
    print("\n[SPLIT]  Dividiendo dataset (80% train, 20% test)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print(f"   Train: {len(X_train)} | Test: {len(X_test)}")

    # Aplicar SMOTE para balancear clases en entrenamiento (si es necesario)
    if y_train.value_counts().min() / y_train.value_counts().max() < 0.7:
        print("\n[BALANCE]  Balanceando clases con SMOTE...")
        smote = SMOTE(random_state=42)
        X_train, y_train = smote.fit_resample(X_train, y_train)
        print(f"   Nuevas clases train: {pd.Series(y_train).value_counts().to_dict()}")

    return X_train, X_test, y_train, y_test, feature_names, encoders


def train_model(X_train, y_train, X_test, y_test):
    """
    Entrena el modelo XGBoost con calibración de probabilidades

    ACTUALIZADO v2.4.4: XGBoost + Calibración Isotónica

    JUSTIFICACIÓN:
    - XGBoost es potente para capturar patrones complejos (importante para tesis)
    - El problema era que las probabilidades no estaban calibradas
    - CalibratedClassifierCV ajusta las probabilidades para que sean más realistas
    - Calibración isotónica es más flexible que Platt scaling

    Args:
        X_train, y_train: Datos de entrenamiento
        X_test, y_test: Datos de prueba

    Returns:
        CalibratedClassifierCV: Modelo XGBoost calibrado
    """
    print("\n Entrenando modelo XGBoost con calibración...")

    # Modelo base XGBoost
    base_model = XGBClassifier(
        n_estimators=100,
        max_depth=3,          # Reducido para evitar overfitting
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        min_child_weight=5,   # Aumentado para regularizar
        gamma=0.2,            # Aumentado para regularizar
        reg_alpha=0.5,        # Regularización L1
        reg_lambda=1.0,       # Regularización L2
        random_state=42,
        eval_metric='logloss',
        use_label_encoder=False
    )

    # Calibrar probabilidades con método isotónico
    # Esto ajusta las probabilidades para que reflejen mejor la realidad
    model = CalibratedClassifierCV(
        estimator=base_model,
        method='isotonic',    # Más flexible que 'sigmoid'
        cv=5                  # 5-fold cross-validation para calibración
    )

    # Entrenar
    model.fit(X_train, y_train)

    print("   OK Modelo entrenado (XGBoost + Calibración Isotónica)")

    return model


def evaluate_model(model, X_train, y_train, X_test, y_test, feature_names):
    """
    Evalúa el modelo y genera métricas

    Args:
        model: Modelo entrenado
        X_train, y_train: Datos de entrenamiento
        X_test, y_test: Datos de prueba
        feature_names: Nombres de las features

    Returns:
        dict: Métricas de evaluación
    """
    print("\n Evaluando modelo...")

    # Predicciones
    y_pred_train = model.predict(X_train)
    y_pred_test = model.predict(X_test)
    y_pred_proba_test = model.predict_proba(X_test)[:, 1]

    # Métricas
    metrics = {
        'train_accuracy': accuracy_score(y_train, y_pred_train),
        'test_accuracy': accuracy_score(y_test, y_pred_test),
        'precision': precision_score(y_test, y_pred_test),
        'recall': recall_score(y_test, y_pred_test),
        'f1_score': f1_score(y_test, y_pred_test),
        'roc_auc': roc_auc_score(y_test, y_pred_proba_test)
    }

    print("\n" + "="*70)
    print("MÉTRICAS DEL MODELO")
    print("="*70)
    print(f"Train Accuracy:  {metrics['train_accuracy']:.4f}")
    print(f"Test Accuracy:   {metrics['test_accuracy']:.4f}")
    print(f"Precision:       {metrics['precision']:.4f}")
    print(f"Recall:          {metrics['recall']:.4f}")
    print(f"F1-Score:        {metrics['f1_score']:.4f}")
    print(f"ROC-AUC:         {metrics['roc_auc']:.4f}")
    print("="*70)

    # Matriz de confusión
    cm = confusion_matrix(y_test, y_pred_test)
    print("\nMatriz de Confusión:")
    print(f"  TN: {cm[0,0]}  |  FP: {cm[0,1]}")
    print(f"  FN: {cm[1,0]}  |  TP: {cm[1,1]}")

    # Classification Report
    print("\nReporte de Clasificación:")
    print(classification_report(y_test, y_pred_test, target_names=['Fracaso', 'Éxito']))

    # Validación cruzada
    print("\n Validación Cruzada (5-fold)...")
    cv_scores = cross_val_score(
        model, X_train, y_train, cv=StratifiedKFold(n_splits=5, shuffle=True, random_state=42),
        scoring='roc_auc'
    )
    print(f"   ROC-AUC scores: {cv_scores}")
    print(f"   Promedio: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")

    # Feature Importance
    print("\n Importancia de Features (Top 10):")

    # Para CalibratedClassifierCV, acceder al estimador base
    if hasattr(model, 'calibrated_classifiers_'):
        # Es un modelo calibrado, obtener importancia del primer estimador
        base_estimator = model.calibrated_classifiers_[0].estimator
        if hasattr(base_estimator, 'feature_importances_'):
            coefs = base_estimator.feature_importances_
        else:
            coefs = np.ones(len(feature_names)) / len(feature_names)
    elif hasattr(model, 'named_steps'):
        # Es un Pipeline
        classifier = model.named_steps['classifier']
        coefs = np.abs(classifier.coef_[0])
    elif hasattr(model, 'feature_importances_'):
        coefs = model.feature_importances_
    else:
        coefs = np.ones(len(feature_names)) / len(feature_names)

    # Normalizar a porcentajes
    coefs_normalized = coefs / coefs.sum()

    feature_importance = pd.DataFrame({
        'feature': feature_names,
        'importance': coefs_normalized
    }).sort_values('importance', ascending=False)

    for idx, row in feature_importance.head(10).iterrows():
        print(f"   {row['feature']:35s}: {row['importance']:.4f}")

    return metrics, feature_importance


def save_model(model, encoders, output_dir="../models"):
    """
    Guarda el modelo y los encoders

    Args:
        model: Modelo entrenado
        encoders: Diccionario de label encoders
        output_dir: Directorio de salida
    """
    output_dir = Path(output_dir)
    output_dir.mkdir(exist_ok=True)

    print(f"\n Guardando modelo en {output_dir}...")

    # Guardar modelo y encoders juntos
    model_data = {
        'model': model,
        'encoders': encoders,
        'version': '1.0.0',
        'created_at': pd.Timestamp.now().isoformat()
    }

    model_path = output_dir / 'success_predictor.joblib'
    joblib.dump(model_data, model_path)

    print(f"   OK Modelo guardado: {model_path}")


def main():
    """
    Función principal de entrenamiento
    """
    print("\n" + "="*70)
    print(" ENTRENAMIENTO DEL MODELO PREDICTIVO DE ÉXITO")
    print(" Emprendimientos Culinarios - Kennedy, Guayaquil")
    print("="*70 + "\n")

    # 1. Cargar y preparar datos
    script_dir = Path(__file__).resolve().parent
    data_path = script_dir.parent / "data" / "culinary_startups_kennedy.csv"
    X_train, X_test, y_train, y_test, feature_names, encoders = load_and_prepare_data(data_path)

    # 2. Entrenar modelo
    model = train_model(X_train, y_train, X_test, y_test)

    # 3. Evaluar modelo
    metrics, feature_importance = evaluate_model(
        model, X_train, y_train, X_test, y_test, feature_names
    )

    # 4. Guardar modelo
    models_dir = script_dir.parent / "models"
    save_model(model, encoders, output_dir=models_dir)

    # 5. Verificar métricas mínimas
    print("\n[CHECK] Verificación de métricas:")
    checks = {
        'Accuracy > 0.75': metrics['test_accuracy'] > 0.75,
        'Precision > 0.70': metrics['precision'] > 0.70,
        'Recall > 0.70': metrics['recall'] > 0.70,
        'F1-Score > 0.70': metrics['f1_score'] > 0.70,
        'ROC-AUC > 0.80': metrics['roc_auc'] > 0.80
    }

    for check, passed in checks.items():
        status = "OK" if passed else "ERROR"
        print(f"   {status} {check}")

    if all(checks.values()):
        print("\n ¡Modelo entrenado exitosamente! Todas las métricas cumplen los requisitos.")
    else:
        print("\n[WARNING]  Advertencia: Algunas métricas no cumplen los requisitos mínimos.")

    print("\n" + "="*70)
    print(" ENTRENAMIENTO COMPLETADO")
    print("="*70 + "\n")


if __name__ == "__main__":
    main()
