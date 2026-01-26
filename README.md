# Plataforma de Emprendimientos Culinarios

Plataforma web que conecta emprendedores culinarios con inversionistas en Kennedy, Guayaquil. Incluye sistema de mensajería en tiempo real y predicciones de éxito mediante Machine Learning.

## URLs de Producción

| Servicio | URL |
|----------|-----|
| Frontend | https://sparkling-imagination-production.up.railway.app |
| Backend | https://plataforma-emprendimientos-production.up.railway.app |
| ML Service | https://melodious-patience-production.up.railway.app |

## Tecnologías

- **Frontend**: React 19, Vite, Material UI, Socket.io-client
- **Backend**: Node.js, Express, MongoDB, Socket.io
- **ML Service**: Python, FastAPI, XGBoost, scikit-learn
- **Base de datos**: MongoDB
- **Despliegue**: Railway

## Estructura del Proyecto

```
├── backend/        # API REST + WebSocket (Node.js/Express)
├── frontend/       # Interfaz de usuario (React/Vite)
├── ml-service/     # Servicio de predicciones (Python/FastAPI)
└── docs/           # Documentación adicional
```

## Instalación Local

### 1. Clonar repositorio
```bash
git clone https://github.com/itamar6531/plataforma-emprendimientos.git
cd plataforma-emprendimientos
```

### 2. Backend
```bash
cd backend
cp .env.example .env
# Editar .env con tus credenciales
npm install
npm run dev
```

### 3. Frontend
```bash
cd frontend
cp .env.example .env
# Editar .env con las URLs
npm install
npm run dev
```

### 4. ML Service
```bash
cd ml-service
cp .env.example .env
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Variables de Entorno

Ver archivos `.env.example` en cada carpeta para las variables necesarias.

## Documentación

Para documentación detallada del sistema, ver [DOCUMENTACION_COMPLETA_SISTEMA.md](./DOCUMENTACION_COMPLETA_SISTEMA.md)

## Características

- Registro e inicio de sesión (JWT)
- Perfiles de emprendedor e inversionista
- Mensajería en tiempo real (Socket.io)
- Predicción de éxito con Machine Learning (XGBoost)
- Dashboard con análisis y recomendaciones

## Licencia

ISC
