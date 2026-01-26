# Documentación Completa del Sistema
## Plataforma de Emprendimientos Culinarios

---

## Tabla de Contenidos

1. [Visión General](#1-visión-general)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Tecnologías Utilizadas](#3-tecnologías-utilizadas)
4. [Estructura de Carpetas](#4-estructura-de-carpetas)
5. [Backend (Node.js/Express)](#5-backend-nodejsexpress)
6. [Frontend (React/Vite)](#6-frontend-reactvite)
7. [ML Service (Python/FastAPI)](#7-ml-service-pythonfastapi)
8. [Base de Datos (MongoDB)](#8-base-de-datos-mongodb)
9. [Comunicación en Tiempo Real (Socket.io)](#9-comunicación-en-tiempo-real-socketio)
10. [Flujos de Datos](#10-flujos-de-datos)
11. [Variables de Entorno](#11-variables-de-entorno)
12. [Despliegue en Railway](#12-despliegue-en-railway)
13. [Endpoints de la API](#13-endpoints-de-la-api)

---

## 1. Visión General

### ¿Qué es esta plataforma?

Es una aplicación web que conecta **emprendedores culinarios** con **inversionistas** en la zona de Kennedy, Guayaquil. La plataforma incluye:

- **Sistema de usuarios**: Registro e inicio de sesión para emprendedores e inversionistas
- **Perfiles**: Cada tipo de usuario tiene un perfil especializado
- **Mensajería en tiempo real**: Chat entre usuarios usando WebSockets
- **Predicción de éxito con ML**: Un modelo de Machine Learning que analiza emprendimientos y predice su probabilidad de éxito

### Tipos de Usuario

| Tipo | Descripción |
|------|-------------|
| **Emprendedor** | Persona con un proyecto culinario que busca financiamiento |
| **Inversionista** | Persona interesada en invertir en emprendimientos culinarios |

---

## 2. Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              USUARIO                                     │
│                           (Navegador Web)                                │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                    │
│                    React + Vite + Material UI                            │
│              https://sparkling-imagination-production.up.railway.app     │
│                                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Login   │  │Dashboard │  │ Profile  │  │ Messages │  │ Analysis │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                    │                                    │
                    │ HTTP (REST API)                    │ WebSocket
                    ▼                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              BACKEND                                     │
│                    Node.js + Express + Socket.io                         │
│          https://plataforma-emprendimientos-production.up.railway.app    │
│                                                                          │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐             │
│  │  Auth Routes   │  │  User Routes   │  │ Message Routes │             │
│  │  /api/auth/*   │  │  /api/users/*  │  │ /api/messages/*│             │
│  └────────────────┘  └────────────────┘  └────────────────┘             │
│                                                                          │
│  ┌────────────────┐  ┌────────────────┐                                 │
│  │Prediction Route│  │  Socket.io     │                                 │
│  │/api/predictions│  │  (WebSocket)   │                                 │
│  └────────────────┘  └────────────────┘                                 │
└─────────────────────────────────────────────────────────────────────────┘
          │                                           │
          │ HTTP                                      │ MongoDB Protocol
          ▼                                           ▼
┌─────────────────────────┐              ┌─────────────────────────────────┐
│       ML SERVICE        │              │           MONGODB               │
│   Python + FastAPI      │              │     (Base de datos NoSQL)       │
│   XGBoost Model         │              │                                 │
│                         │              │  ┌─────────┐  ┌───────────────┐ │
│  Endpoints:             │              │  │  Users  │  │Entrepreneur   │ │
│  - POST /predict        │              │  │         │  │   Profiles    │ │
│  - GET /health          │              │  └─────────┘  └───────────────┘ │
│  - GET /model/info      │              │  ┌─────────┐  ┌───────────────┐ │
│                         │              │  │Investor │  │ Conversations │ │
│ melodious-patience-     │              │  │Profiles │  │  & Messages   │ │
│ production.up.railway   │              │  └─────────┘  └───────────────┘ │
└─────────────────────────┘              └─────────────────────────────────┘
```

### Flujo de Comunicación

1. **Usuario** interactúa con el **Frontend** (React)
2. **Frontend** hace peticiones HTTP al **Backend** (Express)
3. **Backend** consulta/guarda datos en **MongoDB**
4. Para predicciones, **Backend** llama al **ML Service** (FastAPI)
5. Para chat en tiempo real, **Frontend** se conecta vía **WebSocket** al **Backend**

---

## 3. Tecnologías Utilizadas

### Frontend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React | 19.2.0 | Biblioteca de UI |
| Vite | 7.2.4 | Build tool y dev server |
| Material UI (MUI) | 7.3.6 | Componentes de diseño |
| React Router DOM | 7.11.0 | Navegación SPA |
| Axios | 1.13.2 | Cliente HTTP |
| Socket.io-client | 4.8.3 | WebSocket cliente |
| Formik + Yup | - | Formularios y validación |
| Recharts | 3.6.0 | Gráficos |
| React Toastify | 11.0.5 | Notificaciones |

### Backend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Node.js | 20+ | Runtime JavaScript |
| Express | 4.x | Framework web |
| Mongoose | 9.x | ODM para MongoDB |
| Socket.io | 4.x | WebSocket servidor |
| JWT | - | Autenticación |
| bcryptjs | - | Hash de contraseñas |
| Axios | - | Cliente HTTP (para ML) |

### ML Service
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Python | 3.x | Lenguaje |
| FastAPI | 0.115.0 | Framework web |
| Uvicorn | 0.32.0 | Servidor ASGI |
| scikit-learn | - | Machine Learning |
| XGBoost | - | Modelo de predicción |
| Pandas/NumPy | - | Procesamiento de datos |
| Pydantic | 2.10.3 | Validación de datos |

### Base de Datos
| Tecnología | Propósito |
|------------|-----------|
| MongoDB | Base de datos NoSQL |
| MongoDB Atlas / Railway | Hosting en la nube |

---

## 4. Estructura de Carpetas

```
plataforma-emprendimientos/
│
├── backend/                    # Servidor Node.js/Express
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js     # Conexión a MongoDB
│   │   ├── controllers/
│   │   │   ├── authController.js       # Lógica de autenticación
│   │   │   ├── userController.js       # Lógica de usuarios
│   │   │   ├── messageController.js    # Lógica de mensajes
│   │   │   └── predictionController.js # Lógica de predicciones
│   │   ├── middleware/
│   │   │   └── auth.js         # Middleware de autenticación JWT
│   │   ├── models/
│   │   │   ├── User.js                 # Modelo de usuario
│   │   │   ├── EntrepreneurProfile.js  # Perfil de emprendedor
│   │   │   ├── InvestorProfile.js      # Perfil de inversionista
│   │   │   ├── Conversation.js         # Conversaciones
│   │   │   └── Message.js              # Mensajes
│   │   ├── routes/
│   │   │   ├── auth.js         # Rutas de autenticación
│   │   │   ├── users.js        # Rutas de usuarios
│   │   │   ├── messages.js     # Rutas de mensajes
│   │   │   └── predictionRoutes.js # Rutas de predicciones
│   │   ├── services/
│   │   │   └── predictionService.js # Comunicación con ML Service
│   │   ├── socket/
│   │   │   └── socketHandlers.js # Manejadores de Socket.io
│   │   └── server.js           # Punto de entrada
│   ├── package.json
│   └── railway.toml            # Configuración Railway
│
├── frontend/                   # Cliente React/Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx           # Formulario de login
│   │   │   │   ├── Register.jsx        # Formulario de registro
│   │   │   │   └── ProtectedRoute.jsx  # Rutas protegidas
│   │   │   ├── messages/
│   │   │   │   ├── ChatWindow.jsx      # Ventana de chat
│   │   │   │   ├── ConversationList.jsx # Lista de conversaciones
│   │   │   │   └── UserSearchDialog.jsx # Buscar usuarios
│   │   │   ├── prediction/
│   │   │   │   ├── PredictionCard.jsx  # Tarjeta de predicción
│   │   │   │   └── PredictionCharts.jsx # Gráficos
│   │   │   ├── profile/
│   │   │   │   ├── EntrepreneurProfileForm.jsx
│   │   │   │   └── InvestorProfileForm.jsx
│   │   │   └── search/
│   │   │       └── UserCard.jsx        # Tarjeta de usuario
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Contexto de autenticación
│   │   ├── hooks/
│   │   │   └── useSocket.js    # Hook para Socket.io
│   │   ├── pages/
│   │   │   ├── HomePage.jsx    # Página de inicio
│   │   │   ├── DashboardPage.jsx # Dashboard
│   │   │   ├── ProfilePage.jsx # Perfil
│   │   │   ├── MessagesPage.jsx # Mensajes
│   │   │   └── AnalysisPage.jsx # Análisis/Predicciones
│   │   ├── services/
│   │   │   ├── api.js          # Cliente Axios configurado
│   │   │   └── predictionService.js # Servicios de predicción
│   │   ├── App.jsx             # Componente principal
│   │   └── main.jsx            # Punto de entrada
│   ├── package.json
│   ├── vite.config.js
│   ├── .npmrc
│   ├── .nvmrc
│   └── railway.toml
│
├── ml-service/                 # Servicio de Machine Learning
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py             # Aplicación FastAPI
│   │   ├── predictor.py        # Clase de predicción
│   │   └── schemas.py          # Schemas Pydantic
│   ├── models/
│   │   └── success_predictor.joblib # Modelo entrenado
│   ├── config.py               # Configuración
│   ├── requirements.txt        # Dependencias Python
│   └── railway.toml
│
└── docs/                       # Documentación adicional
```

---

## 5. Backend (Node.js/Express)

### 5.1 Punto de Entrada (server.js)

El archivo `server.js` es el punto de entrada del backend:

```javascript
// Cargar variables de entorno
require('dotenv').config();

// Importaciones
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const connectDB = require('./config/database');

// Crear aplicación
const app = express();
const server = http.createServer(app);

// Configurar Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true
  }
});

// Middlewares
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

// Conectar a MongoDB
connectDB();

// Montar rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/predictions', predictionRoutes);

// Iniciar servidor
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
```

### 5.2 Conexión a MongoDB (config/database.js)

```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGODB_URI);
  console.log(`MongoDB conectado: ${conn.connection.host}`);
};

module.exports = connectDB;
```

### 5.3 Middleware de Autenticación (middleware/auth.js)

El middleware `protect` verifica el token JWT:

```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  // 1. Obtener token del header Authorization
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No autorizado' });
  }

  // 2. Verificar token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // 3. Buscar usuario
  req.user = await User.findById(decoded.id);

  next();
};
```

### 5.4 Modelos de Datos

#### User (Usuario)
```javascript
{
  name: String,           // Nombre completo
  email: String,          // Email único
  password: String,       // Contraseña hasheada
  userType: 'emprendedor' | 'inversionista',
  phone: String,
  location: String,
  bio: String,
  profileImage: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### EntrepreneurProfile (Perfil de Emprendedor)
```javascript
{
  userId: ObjectId,              // Referencia al User
  projectName: String,           // Nombre del proyecto
  projectDescription: String,    // Descripción
  sector: String,                // Sector (culinario por defecto)
  fundingNeeded: Number,         // Financiamiento necesario
  stage: 'idea' | 'desarrollo' | 'operando',
  yearsInBusiness: Number,
  numberOfEmployees: Number,

  // Campos para ML
  educationLevel: 'secundaria' | 'tecnico' | 'universitario' | 'postgrado',
  previousExperienceYears: Number,
  hasBusinessPlan: Boolean,
  marketValidationLevel: 'ninguna' | 'encuestas' | 'mvp' | 'clientes_activos',
  initialCapital: Number,
  projectedMonthlyRevenue: Number,

  // Resultado de predicción
  predictionScore: {
    successScore: Number,
    classification: 'BAJO' | 'MEDIO' | 'ALTO',
    lastUpdated: Date,
    keyFactors: Object,
    recommendations: [String]
  }
}
```

#### InvestorProfile (Perfil de Inversionista)
```javascript
{
  userId: ObjectId,
  companyName: String,
  investmentRange: { min: Number, max: Number },
  sectorsOfInterest: [String],
  investmentCriteria: String,
  portfolioSize: Number
}
```

#### Conversation (Conversación)
```javascript
{
  participants: [ObjectId],    // Referencias a Users
  lastMessage: {
    content: String,
    sender: ObjectId,
    timestamp: Date
  },
  unreadCount: Map             // { odId: Number }
}
```

#### Message (Mensaje)
```javascript
{
  conversationId: ObjectId,
  sender: ObjectId,
  content: String,
  readBy: [ObjectId],
  createdAt: Date
}
```

---

## 6. Frontend (React/Vite)

### 6.1 Estructura de la Aplicación (App.jsx)

```jsx
function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Rutas protegidas */}
            <Route path="/dashboard" element={
              <ProtectedRoute><DashboardPage /></ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute><ProfilePage /></ProtectedRoute>
            } />
            <Route path="/messages" element={
              <ProtectedRoute><MessagesPage /></ProtectedRoute>
            } />
            <Route path="/analysis" element={
              <ProtectedRoute><AnalysisPage /></ProtectedRoute>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
```

### 6.2 Contexto de Autenticación (AuthContext.jsx)

El AuthContext maneja el estado de autenticación globalmente:

```jsx
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Verificar token al cargar
  useEffect(() => {
    if (token) {
      fetchUser();
    }
  }, [token]);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    setToken(response.data.token);
    setUser(response.data.user);
    localStorage.setItem('token', response.data.token);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 6.3 Cliente HTTP (services/api.js)

```javascript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Interceptor para agregar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 6.4 Hook de Socket.io (hooks/useSocket.js)

```javascript
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

export const useSocket = (token) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token) return;

    // Crear conexión
    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socketRef.current.on('connect', () => setIsConnected(true));
    socketRef.current.on('disconnect', () => setIsConnected(false));

    return () => socketRef.current?.disconnect();
  }, [token]);

  // Métodos para emitir eventos
  const sendMessage = (conversationId, messageText) => {
    socketRef.current?.emit('send_message', { conversationId, messageText });
  };

  const joinConversation = (conversationId) => {
    socketRef.current?.emit('join_conversation', conversationId);
  };

  return { isConnected, sendMessage, joinConversation, ... };
};
```

### 6.5 Páginas Principales

| Página | Ruta | Descripción |
|--------|------|-------------|
| HomePage | `/` | Landing page pública |
| Login | `/login` | Formulario de inicio de sesión |
| Register | `/register` | Formulario de registro |
| DashboardPage | `/dashboard` | Panel principal del usuario |
| ProfilePage | `/profile` | Edición de perfil |
| MessagesPage | `/messages` | Sistema de mensajería |
| AnalysisPage | `/analysis` | Análisis y predicciones ML |

---

## 7. ML Service (Python/FastAPI)

### 7.1 Aplicación Principal (app/main.py)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import config
from app.predictor import get_predictor

app = FastAPI(
    title="Success Predictor API",
    version=config.MODEL_VERSION
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/health")
async def health_check():
    predictor = get_predictor()
    return {
        "status": "healthy",
        "model_loaded": predictor.is_loaded
    }

@app.post("/predict")
async def predict_success(request: PredictionRequest):
    predictor = get_predictor()
    result = predictor.predict(request.model_dump())
    return result
```

### 7.2 Clase Predictor (app/predictor.py)

```python
class SuccessPredictor:
    def __init__(self):
        self.model = None
        self.encoders = None
        self.is_loaded = False
        self.load_model()

    def load_model(self):
        """Carga el modelo XGBoost desde disco"""
        model_data = joblib.load(config.MODEL_PATH)
        self.model = model_data['model']
        self.encoders = model_data['encoders']
        self.is_loaded = True

    def predict(self, data: dict) -> dict:
        """Realiza predicción de éxito"""
        # Preprocesar datos
        features = self.preprocess_input(data)

        # Obtener probabilidad
        probability = self.model.predict_proba(features)[0][1]
        score = probability * 100

        # Clasificar
        if score >= 70:
            classification = "ALTO"
        elif score >= 50:
            classification = "MEDIO"
        else:
            classification = "BAJO"

        # Analizar factores y generar recomendaciones
        key_factors = self._analyze_key_factors(data)
        recommendations = self._generate_recommendations(data, score)

        return {
            "success_score": round(score, 2),
            "classification": classification,
            "confidence": abs(probability - 0.5) * 2,
            "key_factors": key_factors,
            "recommendations": recommendations
        }
```

### 7.3 Features del Modelo ML

El modelo XGBoost utiliza las siguientes características (en orden):

| Feature | Tipo | Descripción |
|---------|------|-------------|
| stage_encoded | Categórico | Etapa del proyecto (0=idea, 1=desarrollo, 2=operando) |
| years_in_business | Numérico | Años de operación |
| number_of_employees | Numérico | Cantidad de empleados |
| funding_needed | Numérico | Financiamiento requerido (USD) |
| education_level_encoded | Categórico | Nivel educativo (0-3) |
| previous_experience_years | Numérico | Años de experiencia previa |
| has_business_plan | Binario | ¿Tiene plan de negocios? |
| market_validation_encoded | Categórico | Nivel de validación de mercado |
| initial_capital | Numérico | Capital inicial (USD) |
| projected_monthly_revenue | Numérico | Ingresos proyectados (USD/mes) |

### 7.4 Esquemas de Validación (app/schemas.py)

```python
class PredictionRequest(BaseModel):
    sector: str
    stage: str  # idea, desarrollo, operando
    years_in_business: int
    number_of_employees: int
    funding_needed: float
    education_level: str  # secundaria, tecnico, universitario, postgrado
    previous_experience_years: int
    has_business_plan: bool
    market_validation_level: str  # ninguna, encuestas, mvp, clientes_activos
    initial_capital: float
    projected_monthly_revenue: float

class PredictionResponse(BaseModel):
    success_score: float      # 0-100
    classification: str       # BAJO, MEDIO, ALTO
    confidence: float         # 0-1
    key_factors: dict         # { positive: [...], negative: [...] }
    recommendations: list     # Lista de strings
```

---

## 8. Base de Datos (MongoDB)

### 8.1 Colecciones

| Colección | Descripción |
|-----------|-------------|
| `users` | Usuarios del sistema |
| `entrepreneurprofiles` | Perfiles de emprendedores |
| `investorprofiles` | Perfiles de inversionistas |
| `conversations` | Conversaciones entre usuarios |
| `messages` | Mensajes individuales |

### 8.2 Relaciones

```
User (1) ──────── (1) EntrepreneurProfile
  │
  └── userType: 'emprendedor'

User (1) ──────── (1) InvestorProfile
  │
  └── userType: 'inversionista'

User (N) ──────── (N) Conversation
                        │
                        └── (1) ──── (N) Message
```

### 8.3 Índices

```javascript
// Users
{ email: 1 }      // Búsqueda rápida por email
{ userType: 1 }   // Filtrar por tipo

// EntrepreneurProfiles
{ userId: 1 }     // Relación con User
{ sector: 1 }     // Filtrar por sector
{ stage: 1 }      // Filtrar por etapa

// Messages
{ conversationId: 1, createdAt: -1 }  // Mensajes de una conversación
```

---

## 9. Comunicación en Tiempo Real (Socket.io)

### 9.1 Eventos del Servidor → Cliente

| Evento | Datos | Descripción |
|--------|-------|-------------|
| `connect` | - | Conexión establecida |
| `disconnect` | - | Conexión perdida |
| `users_online` | `[userId, ...]` | Lista de usuarios conectados |
| `new_message` | `{ message, conversationId }` | Nuevo mensaje recibido |
| `user_typing` | `{ conversationId, userId }` | Usuario escribiendo |
| `message_read` | `{ conversationId, userId }` | Mensaje leído |

### 9.2 Eventos del Cliente → Servidor

| Evento | Datos | Descripción |
|--------|-------|-------------|
| `join_conversation` | `conversationId` | Unirse a una sala de chat |
| `leave_conversation` | `conversationId` | Salir de una sala |
| `send_message` | `{ conversationId, messageText }` | Enviar mensaje |
| `typing` | `{ conversationId }` | Indicar que está escribiendo |
| `stop_typing` | `{ conversationId }` | Dejó de escribir |
| `mark_as_read` | `{ conversationId }` | Marcar como leído |

### 9.3 Autenticación Socket.io

```javascript
// Cliente
const socket = io(SOCKET_URL, {
  auth: { token: 'jwt-token-aqui' }
});

// Servidor
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  socket.userId = decoded.id;
  next();
});
```

---

## 10. Flujos de Datos

### 10.1 Flujo de Registro

```
1. Usuario llena formulario de registro
   ↓
2. Frontend POST /api/auth/register
   { name, email, password, userType }
   ↓
3. Backend valida datos
   ↓
4. Backend hashea contraseña con bcrypt
   ↓
5. Backend crea User en MongoDB
   ↓
6. Backend crea perfil vacío (Entrepreneur o Investor)
   ↓
7. Backend genera JWT token
   ↓
8. Backend responde { token, user }
   ↓
9. Frontend guarda token en localStorage
   ↓
10. Frontend redirige a /dashboard
```

### 10.2 Flujo de Login

```
1. Usuario ingresa email y password
   ↓
2. Frontend POST /api/auth/login
   ↓
3. Backend busca usuario por email
   ↓
4. Backend compara password con hash (bcrypt)
   ↓
5. Backend genera JWT token
   ↓
6. Backend responde { token, user }
   ↓
7. Frontend guarda token y actualiza estado
```

### 10.3 Flujo de Predicción ML

```
1. Usuario abre página de Análisis
   ↓
2. Frontend GET /api/predictions/my-prediction
   ↓
3. Backend obtiene perfil del emprendedor
   ↓
4. Backend prepara datos para ML Service
   {
     sector, stage, years_in_business,
     education_level, has_business_plan, ...
   }
   ↓
5. Backend POST ML_SERVICE_URL/predict
   ↓
6. ML Service preprocesa datos
   - Codifica variables categóricas
   - Construye array de features
   ↓
7. ML Service ejecuta modelo XGBoost
   - model.predict_proba(features)
   ↓
8. ML Service analiza factores clave
   ↓
9. ML Service genera recomendaciones
   ↓
10. ML Service responde {
      success_score: 72.5,
      classification: "ALTO",
      confidence: 0.82,
      key_factors: { positive: [...], negative: [...] },
      recommendations: [...]
    }
   ↓
11. Backend guarda predicción en perfil
   ↓
12. Backend responde al Frontend
   ↓
13. Frontend muestra resultados con gráficos
```

### 10.4 Flujo de Mensajería en Tiempo Real

```
┌─────────────┐                    ┌─────────────┐                    ┌─────────────┐
│  Usuario A  │                    │   Backend   │                    │  Usuario B  │
└──────┬──────┘                    └──────┬──────┘                    └──────┬──────┘
       │                                  │                                  │
       │ 1. join_conversation(id)         │                                  │
       │─────────────────────────────────>│                                  │
       │                                  │                                  │
       │                                  │ 2. join_conversation(id)         │
       │                                  │<─────────────────────────────────│
       │                                  │                                  │
       │ 3. send_message(id, "Hola")      │                                  │
       │─────────────────────────────────>│                                  │
       │                                  │                                  │
       │                                  │ 4. Guardar en MongoDB            │
       │                                  │                                  │
       │                                  │ 5. new_message(mensaje)          │
       │                                  │─────────────────────────────────>│
       │                                  │                                  │
       │ 6. new_message (confirmación)    │                                  │
       │<─────────────────────────────────│                                  │
       │                                  │                                  │
```

---

## 11. Variables de Entorno

### 11.1 Backend

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `PORT` | Puerto del servidor | (Railway lo asigna automáticamente) |
| `NODE_ENV` | Entorno de ejecución | `production` |
| `MONGODB_URI` | URL de conexión a MongoDB | `mongodb://...` |
| `JWT_SECRET` | Clave secreta para tokens | `mi-clave-secreta-larga` |
| `CLIENT_URL` | URL del frontend (CORS) | `https://sparkling-imagination-production.up.railway.app` |
| `ML_SERVICE_URL` | URL del servicio ML | `https://melodious-patience-production.up.railway.app` |

### 11.2 Frontend

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_API_URL` | URL base del backend | `https://plataforma-emprendimientos-production.up.railway.app/api` |
| `VITE_SOCKET_URL` | URL para WebSocket | `https://plataforma-emprendimientos-production.up.railway.app` |

**Nota:** Las variables de Vite deben empezar con `VITE_` para ser accesibles en el código.

### 11.3 ML Service

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `PORT` | Puerto del servidor | (Railway lo asigna automáticamente) |
| `HOST` | Host del servidor | `0.0.0.0` |
| `ENVIRONMENT` | Entorno de ejecución | `production` |
| `MODEL_VERSION` | Versión del modelo | `1.0.0` |
| `ALLOWED_ORIGINS` | URLs permitidas (CORS) | `https://frontend.url,https://backend.url` |

---

## 12. Despliegue en Railway

### 12.1 URLs de Producción

| Servicio | URL |
|----------|-----|
| Frontend | `https://sparkling-imagination-production.up.railway.app` |
| Backend | `https://plataforma-emprendimientos-production.up.railway.app` |
| ML Service | `https://melodious-patience-production.up.railway.app` |
| MongoDB | (conexión interna de Railway) |

### 12.2 Archivos de Configuración

#### backend/railway.toml
```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm start"
healthcheckPath = "/"
restartPolicyType = "on_failure"
```

#### frontend/railway.toml
```toml
[build]
builder = "nixpacks"
buildCommand = "rm -f package-lock.json && npm install && npm run build"

[deploy]
startCommand = "npx serve dist -s -l $PORT"

[build.env]
NIXPACKS_NODE_VERSION = "lts"
```

#### ml-service/railway.toml
```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "uvicorn app.main:app --host 0.0.0.0 --port $PORT"
healthcheckPath = "/health"
restartPolicyType = "on_failure"
```

### 12.3 Proceso de Despliegue

1. **Crear proyecto en Railway**
   - Conectar repositorio de GitHub

2. **Crear servicio MongoDB**
   - New → Database → MongoDB
   - Copiar `MONGO_URL`

3. **Crear servicio Backend**
   - New → GitHub Repo → seleccionar carpeta `backend`
   - Agregar variables: `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV`, `CLIENT_URL`
   - Generar dominio público

4. **Crear servicio Frontend**
   - New → GitHub Repo → seleccionar carpeta `frontend`
   - Agregar variables: `VITE_API_URL`, `VITE_SOCKET_URL`
   - Generar dominio público

5. **Crear servicio ML**
   - New → GitHub Repo → seleccionar carpeta `ml-service`
   - Agregar variables: `ENVIRONMENT`, `ALLOWED_ORIGINS`
   - Generar dominio público
   - Agregar `ML_SERVICE_URL` al backend

---

## 13. Endpoints de la API

### 13.1 Autenticación (`/api/auth`)

| Método | Ruta | Descripción | Autenticación |
|--------|------|-------------|---------------|
| POST | `/register` | Registrar usuario | No |
| POST | `/login` | Iniciar sesión | No |
| GET | `/me` | Obtener usuario actual | Sí |
| PUT | `/update-password` | Cambiar contraseña | Sí |

#### POST /api/auth/register
```json
// Request
{
  "name": "Juan Pérez",
  "email": "juan@email.com",
  "password": "123456",
  "userType": "emprendedor"
}

// Response
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "...",
    "name": "Juan Pérez",
    "email": "juan@email.com",
    "userType": "emprendedor"
  }
}
```

### 13.2 Usuarios (`/api/users`)

| Método | Ruta | Descripción | Autenticación |
|--------|------|-------------|---------------|
| GET | `/profile` | Obtener perfil propio | Sí |
| PUT | `/profile` | Actualizar perfil | Sí |
| GET | `/search` | Buscar usuarios | Sí |
| GET | `/:id` | Obtener usuario por ID | Sí |

### 13.3 Mensajes (`/api/messages`)

| Método | Ruta | Descripción | Autenticación |
|--------|------|-------------|---------------|
| GET | `/conversations` | Listar conversaciones | Sí |
| POST | `/conversations` | Crear conversación | Sí |
| GET | `/conversations/:id` | Obtener conversación | Sí |
| POST | `/conversations/:id/messages` | Enviar mensaje | Sí |
| PUT | `/conversations/:id/read` | Marcar como leído | Sí |

### 13.4 Predicciones (`/api/predictions`)

| Método | Ruta | Descripción | Autenticación |
|--------|------|-------------|---------------|
| GET | `/my-prediction` | Obtener mi predicción | Sí |
| GET | `/profile/:id` | Predicción de un perfil | Sí |
| GET | `/health` | Estado del servicio ML | No |
| GET | `/model-info` | Info del modelo ML | No |

#### GET /api/predictions/my-prediction
```json
// Response
{
  "success": true,
  "data": {
    "success_score": 72.5,
    "classification": "ALTO",
    "confidence": 0.82,
    "key_factors": {
      "positive": [
        { "factor": "Cuenta con plan de negocios", "impact": 0.21 },
        { "factor": "Amplia experiencia en el sector", "impact": 0.10 }
      ],
      "negative": [
        { "factor": "Validar el mercado aumentaría la confianza", "impact": -0.05 }
      ]
    },
    "recommendations": [
      "Valida tu idea con un MVP antes de buscar inversión",
      "Continúa desarrollando tu plan de negocios"
    ]
  }
}
```

---

## Resumen Final

Esta plataforma es un sistema completo que incluye:

1. **Frontend React** con Material UI para una interfaz moderna
2. **Backend Express** con autenticación JWT y API REST
3. **MongoDB** para persistencia de datos
4. **Socket.io** para comunicación en tiempo real
5. **Microservicio ML** con FastAPI y XGBoost para predicciones

Todo desplegado en **Railway** con:
- 4 servicios independientes
- Variables de entorno configuradas
- Dominios públicos generados
- Healthchecks activos

La arquitectura de microservicios permite escalar cada componente de forma independiente y mantener el código organizado por responsabilidades.
