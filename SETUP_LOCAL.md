# 🚀 DevPal - Guía de Configuración Local

## 📋 Índice
1. [Visión General de la Aplicación](#visión-general)
2. [Arquitectura del Sistema](#arquitectura)
3. [Requisitos Previos](#requisitos-previos)
4. [Configuración de Base de Datos](#configuración-de-base-de-datos)
5. [Configuración del Backend](#configuración-del-backend)
6. [Configuración del Frontend](#configuración-del-frontend)
7. [Ejecutar la Aplicación](#ejecutar-la-aplicación)
8. [Funcionalidades de IA (Bloqueadas)](#funcionalidades-de-ia)

---

## 🎯 Visión General

**DevPal** es una plataforma móvil (React Native + Expo) para desarrollo profesional de programadores, que incluye:

- 📅 **Eventos tecnológicos**: Hackathons, conferencias, talleres
- 📰 **Noticias**: Últimas novedades del mundo tech
- 🎯 **Desafíos diarios**: Problemas de programación para practicar
- 🏆 **Gamificación**: Sistema de badges, XP, rachas y leaderboards
- 🔍 **Code Review**: Revisión de código con IA (próximamente)
- 💬 **Chat IA**: Asistente para dudas de programación (próximamente)

---

## 🏗️ Arquitectura

```
DevPal/
│
├── backend/                    # FastAPI (Python 3.11+)
│   ├── app/
│   │   ├── main.py            # Aplicación principal
│   │   ├── config.py          # Configuración centralizada
│   │   ├── database.py        # SQLAlchemy setup
│   │   ├── db.py              # Conexiones raw PostgreSQL
│   │   │
│   │   ├── models/            # Modelos de datos (SQLAlchemy)
│   │   │   └── db_models.py   # 17 tablas del sistema
│   │   │
│   │   ├── routers/           # Endpoints de API
│   │   │   ├── auth.py        # Login, registro
│   │   │   ├── eventos.py     # Eventos CRUD
│   │   │   ├── noticias.py    # Noticias
│   │   │   ├── desafios.py    # Desafíos diarios
│   │   │   ├── code_review.py # Revisión de código (bloqueado)
│   │   │   └── gamification.py # Badges, leaderboard
│   │   │
│   │   ├── services/          # Lógica de negocio
│   │   │   ├── ia_service.py  # Servicio de IA (Google Gemini)
│   │   │   └── code_executor.py # Ejecución segura de código
│   │   │
│   │   └── middleware/        # Rate limiting, CORS
│   │
│   ├── migrations/            # Scripts SQL de migración
│   ├── database_init.sql      # Script completo de BD
│   ├── requirements.txt       # Dependencias Python
│   └── .env.example          # Variables de entorno
│
└── frontend/                  # React Native + Expo
    ├── app/                   # Screens (navegación basada en archivos)
    │   ├── (tabs)/           # Navegación por tabs
    │   ├── (auth)/           # Login/Registro
    │   └── settings/         # Configuración
    │
    ├── components/           # Componentes reutilizables
    ├── services/             # Clientes de API
    ├── contexts/             # Estado global (AuthContext)
    └── constants/            # Configuración (API URLs)
```

### Stack Tecnológico

**Backend:**
- FastAPI (framework web)
- PostgreSQL (base de datos)
- SQLAlchemy (ORM)
- Google Gemini API (IA - opcional)
- Bcrypt (hash de contraseñas)
- APScheduler (tareas programadas)

**Frontend:**
- React Native (Expo Router)
- TypeScript
- NativeWind (Tailwind CSS)
- Expo (framework)
- Axios (HTTP client)

---

## ✅ Requisitos Previos

### Software Necesario

1. **Python 3.11+**
   ```bash
   python --version
   ```

2. **PostgreSQL 14+**
   - [Descarga PostgreSQL](https://www.postgresql.org/download/)
   - O usa Docker:
   ```bash
   docker run --name devpal-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15
   ```

3. **Node.js 18+**
   ```bash
   node --version
   npm --version
   ```

4. **Expo CLI**
   ```bash
   npm install -g expo-cli
   ```

5. **Editor de código**: VS Code recomendado

---

## 🗄️ Configuración de Base de Datos

### Paso 1: Crear la base de datos

```bash
# Conectar a PostgreSQL
psql -U postgres

# Crear base de datos
CREATE DATABASE devpal_db;

# Salir de psql
\q
```

### Paso 2: Ejecutar el script de inicialización

```bash
# Ejecutar el script completo
psql -U postgres -d devpal_db -f backend/database_init.sql
```

Este script crea:
- ✅ 17 tablas
- ✅ Constraints (CHECK, UNIQUE, FOREIGN KEY)
- ✅ 30+ índices de performance
- ✅ Extensiones (uuid-ossp, pg_trgm)

### Paso 3: Verificar la instalación

```bash
psql -U postgres -d devpal_db -c "\dt"
```

Deberías ver todas las tablas creadas.

---

## ⚙️ Configuración del Backend

### Paso 1: Crear entorno virtual

```bash
cd backend

# Windows
python -m venv .venv
.venv\Scripts\activate

# Linux/Mac
python3 -m venv .venv
source .venv/bin/activate
```

### Paso 2: Instalar dependencias

```bash
pip install -r requirements.txt
```

### Paso 3: Configurar variables de entorno

```bash
# Copiar el archivo ejemplo
cp .env.example .env

# Editar .env con tus credenciales
```

Contenido de `.env` para desarrollo local:

```env
# Database Local
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=devpal_db

# API Keys (OPCIONAL - para funciones de IA)
GEMINI_API_KEY=opcional_para_desarrollo

# Application Settings
ENVIRONMENT=development
LOG_LEVEL=INFO
PORT=8001
ENABLE_SCHEDULED_JOBS=false

# CORS
CORS_ORIGINS=*
```

### Paso 4: Verificar la conexión

```bash
python -c "from app.config import get_settings; print(get_settings().database_url)"
```

### Paso 5: Ejecutar el servidor

```bash
# Modo desarrollo (con hot-reload)
uvicorn app.main:app --reload --port 8001

# O usando Python
python -m app.main
```

Visita: http://localhost:8001/docs para ver la documentación interactiva (Swagger)

---

## 📱 Configuración del Frontend

### Paso 1: Instalar dependencias

```bash
cd frontend
npm install
```

### Paso 2: Configurar URL del backend

El archivo `frontend/constants/Config.ts` ya está configurado para desarrollo local:

```typescript
const DEFAULT_API_BASE_URL = 'http://127.0.0.1:8001';
```

Si tu computadora tiene una IP diferente o usas un dispositivo físico:

```bash
# Encuentra tu IP local
# Windows
ipconfig

# Linux/Mac
ifconfig
```

Luego actualiza `Config.ts`:
```typescript
const DEFAULT_API_BASE_URL = 'http://192.168.x.x:8001';
```

### Paso 3: Ejecutar la aplicación

```bash
# Iniciar Expo
npx expo start

# Opciones:
# - Presiona 'w' para abrir en navegador web
# - Presiona 'a' para abrir en Android emulator
# - Presiona 'i' para abrir en iOS simulator
# - Escanea el QR con la app Expo Go en tu teléfono
```

---

## 🎮 Ejecutar la Aplicación

### Terminal 1: Backend
```bash
cd backend
.venv\Scripts\activate  # Windows
uvicorn app.main:app --reload --port 8001
```

### Terminal 2: Frontend
```bash
cd frontend
npx expo start
```

### Verificación
1. Backend: http://localhost:8001/docs
2. Frontend: http://localhost:8081 (o Expo app)

---

## 🤖 Funcionalidades de IA (Bloqueadas)

Las siguientes funcionalidades están **temporalmente bloqueadas** y marcan "Próximamente":

### Endpoints Bloqueados (HTTP 503)

| Endpoint | Funcionalidad | Estado |
|----------|--------------|--------|
| `POST /api/code-review` | Revisión de código con IA | 🚧 Próximamente |
| `POST /api/code-review/pistas/generar` | Generar pistas | 🚧 Próximamente |
| `POST /api/desafios/generar` | Generar desafíos con IA | 🚧 Próximamente |
| `POST /api/noticias/generar` | Generar noticias con IA | 🚧 Próximamente |
| `POST /api/eventos/generar` | Generar eventos con IA | 🚧 Próximamente |

### Comportamiento Bloqueado

Si intentas usar estas funciones, recibirás:

```json
{
  "detail": {
    "message": "Funcionalidad próximamente disponible",
    "feature": "Code Review con IA",
    "status": "coming_soon"
  }
}
```

### ¿Por qué están bloqueadas?

- Requieren API key de Google Gemini (costo)
- Opcional para desarrollo local
- Puedes agregar datos manualmente a la BD

### Desbloquear Funcionalidades de IA

Si deseas activarlas:

1. Obtén una API key de Google Gemini: https://makersuite.google.com/app/apikey
2. Agrega la key a `.env`:
   ```env
   GEMINI_API_KEY=tu_api_key_real
   ```
3. Revierte los cambios en los routers:
   - `backend/app/routers/code_review.py`
   - `backend/app/routers/desafios.py`
   - `backend/app/routers/noticias.py`
   - `backend/app/routers/eventos.py`

---

## 🛠️ Datos de Prueba

### Crear un usuario de prueba

```bash
# Usando la API directamente
curl -X POST http://localhost:8001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test",
    "apellidos": "User",
    "email": "test@devpal.com",
    "password": "password123"
  }'
```

O usa la pantalla de registro en la app móvil.

### Agregar datos manualmente

Puedes insertar datos de prueba directamente en PostgreSQL:

```sql
-- Insertar un evento de prueba
INSERT INTO eventos (id, titulo, descripcion, fecha, hora, ubicacion, categoria, cupos_disponibles)
VALUES (
  gen_random_uuid(),
  'Hackathon DevPal 2026',
  'Competencia de programación de 48 horas',
  '2026-04-15',
  '09:00:00',
  'Centro de Convenciones',
  'Hackathon',
  100
);

-- Insertar una noticia de prueba
INSERT INTO noticias (id, titulo_resumen, url, fecha_publicacion, fuente, relevancia)
VALUES (
  gen_random_uuid(),
  'Nueva versión de Python lanzada',
  'https://python.org/news',
  CURRENT_DATE,
  'Python.org',
  'Alta'
);

-- Insertar un desafío de prueba
INSERT INTO desafios_diarios (
  id, fecha, titulo, lenguaje_recomendado, 
  definicion_problema, dificultad, xp_recompensa,
  templates_lenguajes_json, casos_prueba_json
)
VALUES (
  gen_random_uuid(),
  CURRENT_DATE,
  'FizzBuzz Clásico',
  'Python',
  'Imprime números del 1 al 100. Para múltiplos de 3 imprime "Fizz", para múltiplos de 5 imprime "Buzz", y para múltiplos de ambos imprime "FizzBuzz".',
  'Fácil',
  50,
  '{"Python": "def fizzbuzz():\n    # Tu código aquí\n    pass", "JavaScript": "function fizzbuzz() {\n    // Tu código aquí\n}"}',
  '[]'
);
```

---

## 📚 Recursos Adicionales

### Documentación de API
- Swagger UI: http://localhost:8001/docs
- ReDoc: http://localhost:8001/redoc

### Scripts Útiles

```bash
# Backend: Resetear base de datos
psql -U postgres -d devpal_db -f backend/reset_events_db.py

# Backend: Ejecutar tests
cd backend
pytest

# Frontend: Limpiar cache
cd frontend
npx expo start -c
```

### Estructura de Datos

Revisa `backend/app/models/db_models.py` para ver todos los modelos de datos.

---

## ❓ Troubleshooting

### Error: "Connection refused" en el backend

```bash
# Verificar que PostgreSQL esté corriendo
# Windows
sc query postgresql-x64-15

# Linux/Mac
sudo systemctl status postgresql
```

### Error: "Cannot connect to API" en el frontend

1. Verifica que el backend esté corriendo en el puerto 8001
2. Si usas un dispositivo físico, usa la IP local en lugar de `localhost`
3. Desactiva el firewall temporalmente para pruebas

### Error: "Module not found" en Python

```bash
# Asegúrate de estar en el entorno virtual
cd backend
.venv\Scripts\activate
pip install -r requirements.txt
```

---

## 🎉 ¡Listo!

Ahora tienes DevPal corriendo completamente en local. 

**Próximos pasos:**
1. Explora la API en http://localhost:8001/docs
2. Crea un usuario en la app móvil
3. Agrega eventos y noticias de prueba
4. Experimenta con el sistema de gamificación

**Para activar las funciones de IA:**
- Obtén una API key de Google Gemini
- Actualiza el archivo `.env`
- Desbloquea los endpoints en los routers

---

## 📝 Notas Importantes

- **Base de datos**: PostgreSQL 14+ requerido
- **Puerto del backend**: 8001 (configurable en `.env`)
- **Puerto del frontend**: 8081 (Expo por defecto)
- **IA**: Opcional para desarrollo local
- **SSL**: Desactivado automáticamente para localhost

---

¿Dudas? Revisa los archivos de código o consulta la documentación de:
- [FastAPI](https://fastapi.tiangolo.com/)
- [Expo](https://docs.expo.dev/)
- [PostgreSQL](https://www.postgresql.org/docs/)
