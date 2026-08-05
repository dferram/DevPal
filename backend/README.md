# Backend - DevPal API

<div align="center">

**RESTful API built with FastAPI**

![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115.0-009688.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-336791.svg)

</div>

---

## 📋 Tabla de Contenidos

- [Visión General](#-visión-general)
- [Arquitectura](#-arquitectura)
- [Estructura de Carpetas](#-estructura-de-carpetas)
- [Endpoints API](#-endpoints-api)
- [Servicios](#-servicios)
- [Modelos de Datos](#-modelos-de-datos)
- [Configuración](#-configuración)
- [Deployment](#-deployment)

---

## 🎯 Visión General

El backend de DevPal es una API RESTful construida con **FastAPI** que proporciona:

- **Autenticación** - Registro, login, gestión de perfiles
- **Eventos Tech** - CRUD completo, búsqueda, geolocalización
- **Desafíos de Código** - Generación con IA, ejecución, validación
- **Gamificación** - XP, niveles, badges, leaderboards
- **Noticias Tech** - Feed curado y personalizado
- **Code Review IA** - Análisis de código con Gemini

### Características Técnicas

✅ **Validación exhaustiva** - Todos los inputs validados  
✅ **Error handling robusto** - Manejo global de excepciones  
✅ **Rate limiting** - Protección contra abuso  
✅ **SQL Injection prevention** - Prepared statements  
✅ **CORS configurado** - Cross-origin requests seguros  
✅ **Request size limits** - 10MB máximo  
✅ **Documentación auto-generada** - Swagger UI  

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                    FastAPI Application                   │
└─────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐      ┌──────▼──────┐    ┌─────▼─────┐
   │ Routers │      │ Middleware  │    │  Services │
   └────┬────┘      └──────┬──────┘    └─────┬─────┘
        │                  │                  │
        │         ┌────────▼───────┐          │
        │         │ Exception      │          │
        │         │ Handlers       │          │
        │         └────────────────┘          │
        │                                     │
        └──────────────┬──────────────────────┘
                       │
            ┌──────────▼───────────┐
            │   Database Layer     │
            │   (PostgreSQL)       │
            └──────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
   ┌────▼────┐   ┌─────▼─────┐  ┌────▼────┐
   │ Usuarios│   │  Eventos  │  │Desafíos │
   └─────────┘   └───────────┘  └─────────┘
```

### Capas de la Aplicación

1. **Presentation Layer** (Routers)
   - Endpoints HTTP
   - Validación de requests
   - Serialización de responses

2. **Business Logic Layer** (Services)
   - Lógica de negocio
   - Integración con servicios externos (Gemini, Azure)
   - Procesamiento de datos

3. **Data Access Layer** (Database)
   - Queries SQL
   - Transacciones
   - Modelos de datos

4. **Cross-Cutting Concerns** (Middleware)
   - Autenticación
   - Rate limiting
   - CORS
   - Error handling
   - Request size limiting

---

## 📁 Estructura de Carpetas

```
backend/
├── 📂 app/                          # Aplicación principal
│   ├── 📄 __init__.py
│   ├── 📄 main.py                   # Punto de entrada FastAPI
│   ├── 📄 config.py                 # Configuración centralizada
│   ├── 📄 database.py               # Conexión PostgreSQL
│   ├── 📄 db.py                     # Helper SQL functions
│   ├── 📄 credenciales.py           # (legacy, migrado a config)
│   │
│   ├── 📂 routers/                  # Endpoints API
│   │   ├── 📄 __init__.py
│   │   ├── 📄 auth.py               # Autenticación y usuarios
│   │   ├── 📄 eventos.py            # Gestión de eventos
│   │   ├── 📄 desafios.py           # Desafíos de código
│   │   ├── 📄 noticias.py           # Feed de noticias
│   │   ├── 📄 gamification.py       # XP, badges, leaderboard
│   │   └── 📄 code_review.py        # Code review con IA
│   │
│   ├── 📂 services/                 # Lógica de negocio
│   │   ├── 📄 __init__.py
│   │   ├── 📄 ia_service.py         # Integración Gemini
│   │   ├── 📄 gamification_service.py
│   │   ├── 📄 code_execution.py     # Ejecución segura de código
│   │   └── 📄 email_service.py      # (próximamente)
│   │
│   ├── 📂 models/                   # Modelos Pydantic
│   │   ├── 📄 __init__.py
│   │   ├── 📄 usuario.py
│   │   ├── 📄 evento.py
│   │   ├── 📄 desafio.py
│   │   └── 📄 noticia.py
│   │
│   ├── 📂 middleware/               # Middleware personalizado
│   │   ├── 📄 __init__.py
│   │   └── 📄 simple_rate_limiter.py
│   │
│   ├── 📂 utils/                    # Utilidades
│   │   ├── 📄 __init__.py
│   │   ├── 📄 validation.py         # Funciones de validación
│   │   └── 📄 exception_handlers.py # Handlers globales
│   │
│   └── 📂 jobs/                     # Tareas programadas
│       ├── 📄 __init__.py
│       └── 📄 scheduled_jobs.py     # APScheduler jobs
│
├── 📂 scripts/                      # Scripts de utilidad
│   ├── 📄 schema.sql                # Schema PostgreSQL
│   ├── 📄 insert_events.sql         # Datos de eventos
│   └── 📄 test_db_connection.py     # Test conexión DB
│
├── 📂 migrations/                   # Migraciones SQL
│   ├── 📄 update_desafios_global.sql
│   ├── 📄 update_desafios_multilang.sql
│   └── 📄 add_performance_indexes.sql
│
├── 📂 static/                       # Archivos estáticos
│   └── 📂 uploads/                  # Avatares, imágenes
│
├── 📂 tests/                        # Tests unitarios
│   ├── 📄 test_auth.py
│   ├── 📄 test_eventos.py
│   └── 📄 test_desafios.py
│
├── 📄 requirements.txt              # Dependencias Python
├── 📄 requirements_security.txt     # Deps seguridad
├── 📄 Dockerfile                    # Imagen Docker
├── 📄 .env.example                  # Template env vars
├── 📄 poblar_datos_prueba.py        # Poblar DB test
├── 📄 setup_badges.py               # Setup badges iniciales
└── 📄 README.md                     # Este archivo
```

---

## 🔌 Endpoints API

### **Documentación Interactiva**

Una vez iniciado el servidor, accede a:

- **Swagger UI**: `http://localhost:8001/docs`
- **ReDoc**: `http://localhost:8001/redoc`

### **Autenticación** (`/auth`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/auth/register` | Registrar nuevo usuario |
| `POST` | `/auth/login` | Iniciar sesión |
| `GET` | `/auth/profile/{usuario_id}` | Obtener perfil |
| `PUT` | `/auth/profile/{usuario_id}` | Actualizar perfil |
| `POST` | `/auth/profile/{usuario_id}/avatar` | Subir avatar |
| `POST` | `/auth/profile/{usuario_id}/project` | Agregar proyecto |
| `PUT` | `/auth/change-password` | Cambiar contraseña |
| `GET` | `/auth/notifications/{usuario_id}` | Obtener notificaciones |

**Ejemplo Request:**

```json
POST /auth/register
{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "password": "password123",
  "intereses": ["Python", "JavaScript"],
  "nivel_experiencia": "intermediate"
}
```

**Ejemplo Response:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "xp_total": 0,
  "nivel": 1,
  "created_at": "2026-03-03T13:00:00Z"
}
```

### **Eventos** (`/eventos`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/eventos/` | Listar todos los eventos |
| `GET` | `/eventos/{evento_id}` | Detalle de evento |
| `GET` | `/eventos/guardados/{usuario_id}` | Eventos guardados |
| `POST` | `/eventos/guardar` | Guardar evento |
| `DELETE` | `/eventos/eliminar` | Eliminar guardado |
| `POST` | `/eventos/asistencia` | Registrar asistencia |
| `POST` | `/eventos/generar` | Generar eventos (Admin) |

**Query Parameters:**

- `limite` (int, 1-200): Máximo de resultados
- `skip` (int, 0-10000): Paginación offset
- `categoria` (str): Filtrar por categoría

**Ejemplo:**

```
GET /eventos/?limite=10&skip=0&categoria=Hackathon

Response:
[
  {
    "id": "...",
    "titulo": "Hackathon AI 2026",
    "descripcion": "...",
    "fecha_inicio": "2026-04-01T09:00:00Z",
    "ubicacion": "CDMX",
    "latitud": 19.4326,
    "longitud": -99.1332,
    "categoria": "Hackathon",
    "organizador": "TechCorp",
    "capacidad_maxima": 100
  }
]
```

### **Desafíos** (`/desafios`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/desafios/del_dia` | Desafío del día |
| `GET` | `/desafios/historial` | Historial usuario |
| `POST` | `/desafios/{id}/completar` | Marcar completado |
| `POST` | `/desafios/{id}/abandonar` | Abandonar desafío |
| `POST` | `/desafios/{id}/ejecutar` | Ejecutar código |
| `POST` | `/desafios/generar` | Generar nuevo (Admin) |

**Ejecutar Código:**

```json
POST /desafios/{desafio_id}/ejecutar?usuario_id=...
{
  "codigo": "def solution(nums):\\n    return sum(nums)",
  "lenguaje": "python"
}

Response:
{
  "status": "success",
  "resultados": {
    "exito": true,
    "casos_pasados": 5,
    "casos_totales": 5,
    "detalles": [...]
  }
}
```

### **Gamificación** (`/gamification`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/gamification/leaderboard` | Leaderboard global |
| `GET` | `/gamification/ranking/{usuario_id}` | Ranking usuario |
| `GET` | `/gamification/badges/{usuario_id}` | Badges usuario |
| `POST` | `/gamification/badges/verificar/{usuario_id}` | Verificar nuevos badges |
| `GET` | `/gamification/stats/global` | Estadísticas globales |

**Leaderboard:**

```
GET /gamification/leaderboard?limite=100&offset=0&lenguaje=Python

Response:
{
  "status": "success",
  "total": 50,
  "leaderboard": [
    {
      "ranking": 1,
      "usuario_id": "...",
      "nombre": "Ana García",
      "xp_total": 5000,
      "nivel": 5,
      "desafios_completados": 50,
      "lenguaje_preferido": "Python"
    }
  ]
}
```

### **Noticias** (`/noticias`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/noticias/` | Listar noticias |
| `GET` | `/noticias/generales` | Noticias generales |
| `POST` | `/noticias/generar` | Generar noticias (Admin) |

### **Code Review** (`/code_review`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/code_review/analizar` | Analizar código |
| `GET` | `/code_review/historial/{usuario_id}` | Ver historial |
| `POST` | `/code_review/pista` | Solicitar pista |

**Analizar Código:**

```json
POST /code_review/analizar
{
  "codigo": "function add(a, b) { return a + b }",
  "lenguaje": "javascript",
  "usuario_id": "..."
}

Response:
{
  "analisis": "Tu función es correcta pero...",
  "sugerencias": [
    "Agrega validación de tipos",
    "Considera usar arrow function"
  ],
  "calificacion": 8,
  "mejoras": "..."
}
```

---

## 🔧 Servicios

### **IAService** (`ia_service.py`)

Integración con Google Gemini 2.5 Flash para:

- **Generar desafíos de código**
  - Input: Nivel de dificultad, lenguaje
  - Output: Problema + casos de prueba + templates

- **Analizar código (Code Review)**
  - Input: Código + lenguaje
  - Output: Análisis + sugerencias + calificación

- **Generar eventos tech**
  - Input: Ubicación, categoría
  - Output: Evento completo con detalles

- **Generar noticias**
  - Input: Temas de interés
  - Output: Resumen + URL + metadata

**Ejemplo de uso:**

```python
from app.services.ia_service import IAService

ia = IAService()

# Generar desafío
desafio = ia.generar_desafio_diario(
    dificultad="medium",
    lenguaje="python"
)

# Code review
analisis = ia.analizar_codigo(
    codigo="def suma(a,b): return a+b",
    lenguaje="python"
)
```

### **GamificationService** (`gamification_service.py`)

Gestión del sistema de gamificación:

- **Leaderboard global y por lenguaje**
- **Cálculo de rankings**
- **Sistema de badges**
  - Verificación de condiciones
  - Desbloqueo automático
  - Progreso hacia próximo badge

**Badges Disponibles:**

| Badge | Condición |
|-------|-----------|
| 🏁 Primer Paso | Completar 1er desafío |
| 🔥 En Racha | 7 días consecutivos |
| 💯 Perfeccionista | 10 desafíos sin fallos |
| 🌟 Estrella Ascendente | Llegar a nivel 5 |
| 🏆 Campeón | Top 10 del leaderboard |
| 🌍 Explorador | Asistir a 5 eventos |
| 🚀 Cohete | 1000 XP en un día |

**Fórmula de XP:**

```python
# Desafíos
XP_DESAFIO = {
    "easy": 50,
    "medium": 100,
    "hard": 200,
    "expert": 500
}

# Eventos
XP_EVENTO = 150  # Por asistencia

# Niveles
nivel = floor(xp_total / 1000) + 1
```

### **CodeExecutionService** (`code_execution.py`)

Ejecución segura de código de usuarios:

- **Sandbox con RestrictedPython**
- **Timeout de 5 segundos**
- **Captura de stdout/stderr**
- **Validación de casos de prueba**

**Lenguajes soportados:**
- Python 3.11+
- JavaScript (Node.js)
- Java (próximamente)
- C# (próximamente)
- TypeScript (próximamente)

**Restricciones de seguridad:**

```python
# Imports bloqueados
BLOCKED_IMPORTS = [
    'os', 'sys', 'subprocess', 'socket',
    'urllib', 'requests', '__import__'
]

# Funciones bloqueadas
BLOCKED_BUILTINS = [
    'eval', 'exec', 'compile', 'open',
    '__import__', 'input'
]

# Límites
MAX_EXECUTION_TIME = 5  # segundos
MAX_MEMORY = 128  # MB
MAX_OUTPUT = 10000  # caracteres
```

---

## 📊 Modelos de Datos

### **User (Usuario)**

```python
{
    "id": UUID,
    "nombre": str,
    "email": str,  # único
    "password_hash": str,
    "avatar_url": str | None,
    "xp_total": int,
    "nivel": int,
    "intereses": List[str],
    "nivel_experiencia": str,  # beginner | intermediate | advanced
    "lenguaje_preferido": str | None,
    "racha_dias": int,
    "ultima_actividad": datetime,
    "created_at": datetime
}
```

### **Evento**

```python
{
    "id": UUID,
    "titulo": str,
    "descripcion": str,
    "fecha_inicio": datetime,
    "fecha_fin": datetime,
    "ubicacion": str,
    "latitud": float,
    "longitud": float,
    "categoria": str,  # Hackathon | Conferencia | Taller | Meetup
    "organizador": str,
    "url_evento": str | None,
    "imagen_url": str | None,
    "capacidad_maxima": int | None,
    "precio": float | None,
    "tags": List[str],
    "created_at": datetime
}
```

### **Desafío Diario**

```python
{
    "id": UUID,
    "fecha": date,
    "titulo": str,
    "lenguaje_recomendado": str,
    "contexto_negocio": str,
    "definicion_problema": str,
    "templates_lenguajes_json": dict,  # {python: '', javascript: '', ...}
    "restricciones_json": dict,
    "casos_prueba_json": List[dict],
    "pista": str,
    "dificultad": str,  # easy | medium | hard | expert
    "xp_recompensa": int,
    "created_at": datetime
}
```

### **Badge**

```python
{
    "id": UUID,
    "nombre": str,
    "descripcion": str,
    "icono": str,
    "condicion_tipo": str,  # desafios_completados | racha | xp_total | etc
    "condicion_valor": int,
    "xp_recompensa": int,
    "rareza": str  # comun | poco_comun | raro | epico | legendario
}
```

---

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env` en `backend/`:

```env
# ==================== DATABASE ====================
DB_HOST=localhost
DB_NAME=devpal_db
DB_USER=postgres
DB_PASSWORD=tu_password_seguro
DB_PORT=5432

# ==================== API KEYS ====================
GEMINI_API_KEY=tu_api_key_de_gemini

# ==================== AZURE (Opcional) ====================
AZURE_STORAGE_CONNECTION_STRING=

# ==================== APPLICATION ====================
PORT=8001
ENVIRONMENT=development  # development | staging | production
LOG_LEVEL=INFO  # DEBUG | INFO | WARNING | ERROR
DEBUG=true

# ==================== CORS ====================
CORS_ORIGINS=*  # En producción: https://tudominio.com

# ==================== SCHEDULED JOBS ====================
ENABLE_SCHEDULED_JOBS=true

# ==================== RATE LIMITING ====================
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60  # segundos
```

### Configuración de PostgreSQL

**Crear Base de Datos:**

```sql
CREATE DATABASE devpal_db;

-- Extensiones recomendadas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- Para búsqueda full-text
```

**Ejecutar Schema:**

```bash
psql -U postgres -d devpal_db -f backend/scripts/schema.sql
```

**Poblar Datos de Prueba:**

```bash
cd backend
python poblar_datos_prueba.py
```

Esto creará:
- 10 desafíos de código
- 10 noticias tech
- 3 eventos próximos
- Badges iniciales

---

## 🚀 Deployment

### Local Development

```bash
# 1. Activar entorno virtual
cd backend
.\.venv\Scripts\Activate.ps1  # Windows
source .venv/bin/activate  # Linux/Mac

# 2. Iniciar servidor
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001

# Server corriendo en http://localhost:8001
# Docs en http://localhost:8001/docs
```

### Production (Docker)

```dockerfile
# Dockerfile ya incluido
docker build -t devpal-backend .
docker run -d \
  -p 8001:8001 \
  --env-file .env \
  --name devpal-api \
  devpal-backend
```

### Production (Manual)

```bash
# 1. Instalar dependencias
pip install -r requirements.txt

# 2. Iniciar con Gunicorn + Uvicorn workers
gunicorn app.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8001 \
  --timeout 120 \
  --access-logfile - \
  --error-logfile -
```

### Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name api.devpal.com;

    location / {
        proxy_pass http://localhost:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 🧪 Testing

```bash
# Instalar dependencias de testing
pip install pytest pytest-cov pytest-asyncio httpx

# Ejecutar tests
pytest tests/ -v

# Con coverage
pytest tests/ --cov=app --cov-report=html

# Test específico
pytest tests/test_auth.py::test_register_usuario -v
```

---

## 📈 Monitoring & Logging

### Logs

Los logs se escriben a stdout con formato estructurado:

```python
import logging

logger = logging.getLogger(__name__)
logger.info("Usuario registrado", extra={"usuario_id": usuario_id})
logger.error("Error en DB", extra={"error": str(e)})
```

### Health Check

```
GET /health

Response:
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2026-03-03T13:00:00Z"
}
```

---

## 🔐 Seguridad

### Implementado

✅ Password hashing con bcrypt  
✅ Validación exhaustiva de inputs  
✅ SQL injection prevention  
✅ Rate limiting (100 req/min)  
✅ Request size limits (10MB)  
✅ CORS configurado  
✅ Exception handling global  

### Recomendado para Producción

⚠️ JWT con refresh tokens  
⚠️ HTTPS obligatorio  
⚠️ Secrets en Key Vault  
⚠️ WAF (Web Application Firewall)  
⚠️ DDoS protection  
⚠️ Audit logging  

---

## 📚 Recursos

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Google Gemini API](https://ai.google.dev/gemini-api/docs)
- [Pydantic](https://docs.pydantic.dev/)

---

## 🤝 Contribuir

Ver [../docs/DEVELOPMENT_GUIDE.md](../docs/DEVELOPMENT_GUIDE.md)

---

<div align="center">

**Backend desarrollado con ❤️ para DevPal**

[Volver al README principal](../README.md)

</div>
