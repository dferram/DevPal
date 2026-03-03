# Arquitectura de DevPal

**Documento de Arquitectura Técnica v1.0**

---

## 📋 Tabla de Contenidos

- [Visión General](#visión-general)
- [Arquitectura de Alto Nivel](#arquitectura-de-alto-nivel)
- [Arquitectura del Backend](#arquitectura-del-backend)
- [Arquitectura del Frontend](#arquitectura-del-frontend)
- [Base de Datos](#base-de-datos)
- [Servicios Externos](#servicios-externos)
- [Seguridad](#seguridad)
- [Escalabilidad](#escalabilidad)
- [Patrones de Diseño](#patrones-de-diseño)
- [Diagrama de Despliegue](#diagrama-de-despliegue)

---

## Visión General

DevPal es una plataforma de desarrollo profesional construida con una arquitectura de **microservicios ligera**, separando claramente frontend (aplicación móvil) y backend (API REST).

### Principios Arquitectónicos

1. **Separación de Responsabilidades** - Frontend, backend y datos claramente separados
2. **API First** - Backend expone API RESTful consumida por múltiples clientes
3. **Stateless** - Backend sin estado para facilitar escalabilidad
4. **Event-Driven** - Jobs programados para tareas asíncronas
5. **Security by Design** - Seguridad considerada en cada capa

### Stack Tecnológico

```
┌────────────────────────────────────────────────────┐
│               DevPal Tech Stack                    │
├────────────────────────────────────────────────────┤
│ Frontend:  React Native + Expo + TypeScript       │
│ Backend:   FastAPI + Python 3.11                  │
│ Database:  PostgreSQL 17 + PostGIS                │
│ IA:        Google Gemini 2.5 Flash                │
│ Storage:   Azure Blob Storage (opcional)          │
│ Cache:     (Próximamente: Redis)                  │
│ Jobs:      APScheduler                            │
└────────────────────────────────────────────────────┘
```

---

## Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────────────────┐
│                        DevPal Platform                          │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   iOS App    │    │ Android App  │    │   Web App    │
│ (React Native)    │(React Native)│    │  (Expo Web)  │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
                  HTTPS/REST API (JSON)
                           │
       ┌───────────────────▼────────────────────┐
       │         Load Balancer (Nginx)          │
       │        (Producción - opcional)         │
       └───────────────────┬────────────────────┘
                           │
       ┌───────────────────▼────────────────────┐
       │         FastAPI Application            │
       │                                        │
       │  ┌──────────────────────────────────┐  │
       │  │      Presentation Layer          │  │
       │  │  (Routers - API Endpoints)       │  │
       │  └─────────────┬────────────────────┘  │
       │                │                        │
       │  ┌─────────────▼────────────────────┐  │
       │  │      Business Logic Layer        │  │
       │  │  (Services - Domain Logic)       │  │
       │  └─────────────┬────────────────────┘  │
       │                │                        │
       │  ┌─────────────▼────────────────────┐  │
       │  │      Data Access Layer           │  │
       │  │  (DB Queries - SQL)              │  │
       │  └─────────────┬────────────────────┘  │
       └────────────────┼────────────────────────┘
                        │
       ┌────────────────▼────────────────────┐
       │       PostgreSQL Database           │
       │  ┌──────────────────────────────┐   │
       │  │ Tables: usuarios, eventos,   │   │
       │  │ desafios, noticias, badges   │   │
       │  └──────────────────────────────┘   │
       └─────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│            External Services                       │
├────────────────────────────────────────────────────┤
│  • Google Gemini (IA Generativa)                  │
│  • Azure Blob Storage (File Storage)              │
│  • (Futuro) SendGrid (Email)                      │
│  • (Futuro) Twilio (SMS/WhatsApp)                 │
└────────────────────────────────────────────────────┘
```

---

## Arquitectura del Backend

### Capas de la Aplicación

```
┌─────────────────────────────────────────────────────┐
│                API Layer (Routers)                  │
│  • Rate Limiting                                    │
│  • Request Validation                               │
│  • Response Serialization                           │
│  • Error Handling                                   │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│           Business Logic Layer (Services)           │
│  • Domain Logic                                     │
│  • External Service Integration                     │
│  • Data Processing                                  │
│  • Complex Validations                              │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│           Data Access Layer (DB)                    │
│  • SQL Queries (Prepared Statements)                │
│  • Transaction Management                           │
│  • Connection Pooling                               │
└─────────────────────────────────────────────────────┘
```

### Request Flow

```
1. Client Request
   ↓
2. Middleware Chain
   ├─ CORS
   ├─ Rate Limiter
   ├─ Request Size Limiter
   └─ Request Logger
   ↓
3. Router (Endpoint)
   ├─ Parameter Validation
   ├─ Body Validation
   └─ Auth Check
   ↓
4. Service Layer
   ├─ Business Logic
   ├─ Data Validation
   ├─ External API Calls
   └─ Data Processing
   ↓
5. Data Layer
   ├─ SQL Query Execution
   ├─ Transaction Management
   └─ Result Mapping
   ↓
6. Response Serialization
   ├─ Pydantic Models
   ├─ JSON Encoding
   └─ HTTP Headers
   ↓
7. Error Handling (if error)
   ├─ Exception Catching
   ├─ Logging
   ├─ User-Friendly Message
   └─ Status Code
   ↓
8. Client Response
```

### Módulos del Backend

#### **1. Authentication Module**

```
auth.py (Router)
    ↓
    • POST /register
    • POST /login
    • GET /profile/{id}
    • PUT /profile/{id}
    • POST /avatar
    • PUT /change-password

Responsabilidades:
- Hash de passwords (bcrypt)
- Validación de credenciales
- Gestión de sesiones
- Actualización de perfil
```

#### **2. Events Module**

```
eventos.py (Router)
    ↓
    • GET /eventos/
    • GET /eventos/{id}
    • POST /eventos/guardar
    • DELETE /eventos/eliminar
    • POST /eventos/asistencia
    • POST /eventos/generar (Admin)

Responsabilidades:
- CRUD de eventos
- Geolocalización
- Guardados de usuario
- Registro de asistencia
```

#### **3. Challenges Module**

```
desafios.py (Router)
    ↓
code_execution.py (Service)
ia_service.py (Service)
    ↓
    • GET /desafios/del_dia
    • POST /desafios/{id}/ejecutar
    • GET /desafios/historial
    • POST /desafios/generar (Admin)

Responsabilidades:
- Generación de desafíos (IA)
- Ejecución segura de código
- Validación de soluciones
- Gestión de historial
```

#### **4. Gamification Module**

```
gamification.py (Router)
    ↓
gamification_service.py (Service)
    ↓
    • GET /leaderboard
    • GET /ranking/{id}
    • GET /badges/{id}
    • POST /badges/verificar/{id}

Responsabilidades:
- Cálculo de XP y niveles
- Rankings dinámicos
- Sistema de badges
- Verificación de logros
```

#### **5. News Module**

```
noticias.py (Router)
    ↓
ia_service.py (Service)
    ↓
    • GET /noticias/
    • GET /noticias/generales
    • POST /noticias/generar (Admin)

Responsabilidades:
- Feed de noticias
- Personalización
- Generación con IA
```

#### **6. Code Review Module**

```
code_review.py (Router)
    ↓
ia_service.py (Service)
    ↓
    • POST /code_review/analizar
    • GET /code_review/historial/{id}
    • POST /code_review/pista

Responsabilidades:
- Análisis de código con IA
- Sugerencias de mejora
- Historial de reviews
```

---

## Arquitectura del Frontend

### Estructura de Componentes

```
┌─────────────────────────────────────────────┐
│           App Component (_layout.tsx)       │
│  • AuthProvider                             │
│  • ErrorBoundary                            │
│  • Theme Provider                           │
└────────────┬────────────────────────────────┘
             │
   ┌─────────┴─────────┐
   │                   │
┌──▼──────────┐  ┌─────▼────────┐
│ Auth Stack  │  │  Main Stack  │
│             │  │              │
│ • Login     │  │  • (tabs)    │
│ • Register  │  │  • Modals    │
│ • Onboard   │  │  • Settings  │
└─────────────┘  └──────┬───────┘
                        │
              ┌─────────┴─────────┐
              │                   │
        ┌─────▼─────┐      ┌──────▼──────┐
        │  Screens  │      │ Components  │
        │           │      │             │
        │ • Home    │      │ • EventCard │
        │ • Map     │      │ • BadgeCard │
        │ • Profile │      │ • CodeEditor│
        └───────────┘      └─────────────┘
```

### State Management

```
┌─────────────────────────────────────────────┐
│            Global State (Context)           │
│                                             │
│  • AuthContext (user, login, logout)        │
│  • (Futuro) ThemeContext                    │
│  • (Futuro) NotificationsContext            │
└────────────┬────────────────────────────────┘
             │
   ┌─────────┴─────────┐
   │                   │
┌──▼──────────┐  ┌─────▼────────┐
│ Local State │  │ Server State │
│ (useState)  │  │ (API calls)  │
│             │  │              │
│ • UI state  │  │ • Events     │
│ • Forms     │  │ • Challenges │
│ • Toggles   │  │ • Leaderboard│
└─────────────┘  └──────────────┘
```

### Navigation Structure

```
App
├── (auth)
│   ├── login
│   └── register
│
├── (onboarding)
│   ├── welcome
│   ├── interests
│   └── languages
│
├── (tabs)
│   ├── index (Home)
│   ├── map
│   ├── saved
│   └── profile
│
├── event/[id]
├── challenges
├── code-review
├── leaderboard
├── notifications
├── search
│
└── settings
    ├── index
    ├── edit-profile
    ├── change-password
    ├── privacy
    └── terms
```

---

## Base de Datos

### Diagrama Entidad-Relación

```
┌─────────────────┐        ┌──────────────────┐
│    usuarios     │        │     eventos      │
├─────────────────┤        ├──────────────────┤
│ id (PK)         │        │ id (PK)          │
│ nombre          │        │ titulo           │
│ email (UK)      │        │ descripcion      │
│ password_hash   │        │ fecha_inicio     │
│ avatar_url      │        │ fecha_fin        │
│ xp_total        │        │ ubicacion        │
│ nivel           │        │ latitud          │
│ intereses       │        │ longitud         │
│ racha_dias      │        │ categoria        │
│ created_at      │        │ organizador      │
└────────┬────────┘        └─────────┬────────┘
         │                           │
         │    ┌──────────────────────┤
         │    │                      │
         │    │  usuario_eventos     │
         │    │  ├──────────────────┐│
         └────┼──┤ usuario_id (FK)  ││
              │  │ evento_id (FK)   │├─┘
              │  │ estado           ││
              │  │ guardado_at      ││
              │  └──────────────────┘│
              └──────────────────────┘

┌─────────────────┐        ┌──────────────────┐
│ desafios_diarios│        │ progreso_desafio │
├─────────────────┤        ├──────────────────┤
│ id (PK)         │        │ id (PK)          │
│ fecha           │        │ usuario_id (FK)  │
│ titulo          │        │ desafio_id (FK)  │
│ lenguaje_rec    │        │ estado           │
│ problema        │        │ codigo_enviado   │
│ casos_prueba    │        │ completado_at    │
│ dificultad      │        └──────────────────┘
│ xp_recompensa   │
└─────────────────┘

┌─────────────────┐        ┌──────────────────┐
│     badges      │        │ usuario_badges   │
├─────────────────┤        ├──────────────────┤
│ id (PK)         │        │ id (PK)          │
│ nombre          │        │ usuario_id (FK)  │
│ descripcion     │        │ badge_id (FK)    │
│ icono           │        │ desbloqueado_at  │
│ condicion_tipo  │        │ progreso_actual  │
│ condicion_valor │        └──────────────────┘
│ rareza          │
└─────────────────┘

┌─────────────────┐
│    noticias     │
├─────────────────┤
│ id (PK)         │
│ usuario_id (FK) │ (null para generales)
│ titulo_resumen  │
│ url             │
│ fecha_pub       │
│ imagen_url      │
│ fuente          │
│ relevancia      │
└─────────────────┘
```

### Índices de Rendimiento

```sql
-- Usuarios
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_xp_nivel ON usuarios(xp_total, nivel);

-- Eventos
CREATE INDEX idx_eventos_fecha ON eventos(fecha_inicio);
CREATE INDEX idx_eventos_categoria ON eventos(categoria);
CREATE INDEX idx_eventos_ubicacion ON eventos(latitud, longitud);

-- Desafíos
CREATE INDEX idx_desafios_fecha ON desafios_diarios(fecha);
CREATE INDEX idx_progreso_usuario ON progreso_desafio_diario(usuario_id, estado);

-- Gamificación
CREATE INDEX idx_usuarios_xp ON usuarios(xp_total DESC);
CREATE INDEX idx_usuario_badges_usuario ON usuario_badges(usuario_id);
```

---

## Servicios Externos

### Google Gemini 2.5 Flash

**Propósito:** IA Generativa

**Usos:**
- Generación de desafíos de código
- Análisis de código (code review)
- Generación de eventos tech
- Curación de noticias

**Integración:**

```python
# ia_service.py
import google.generativeai as genai

class IAService:
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-2.5-flash')

    def generar_desafio(self, dificultad: str):
        prompt = f"Genera un desafío de código de dificultad {dificultad}..."
        response = self.model.generate_content(prompt)
        return self._parse_response(response)
```

**Rate Limits:**
- 60 requests/minuto (tier gratuito)
- Caching de respuestas comunes
- Retry logic con exponential backoff

### Azure Blob Storage (Opcional)

**Propósito:** Almacenamiento de archivos

**Usos:**
- Avatares de usuario
- Imágenes de eventos
- Archivos adjuntos

**Alternativa Local:**
- `backend/static/uploads/` (desarrollo)

---

## Seguridad

### Capas de Seguridad

```
1. Network Layer
   ├─ HTTPS/TLS (producción)
   ├─ Firewall rules
   └─ DDoS protection

2. Application Layer
   ├─ CORS configurado
   ├─ Rate limiting (100 req/min)
   ├─ Request size limits (10MB)
   ├─ Exception handling global
   └─ Input validation exhaustiva

3. Authentication Layer
   ├─ Password hashing (bcrypt)
   ├─ JWT tokens (próximamente)
   ├─ Session management
   └─ Token refresh

4. Database Layer
   ├─ Prepared statements (SQL injection prevention)
   ├─ Row-level security (próximamente)
   ├─ Encrypted connections
   └─ Backup automático

5. Data Layer
   ├─ Sensitive data encryption
   ├─ PII minimization
   └─ Data retention policies
```

### Validación de Inputs

```python
# Todas las entradas validadas
from app.utils.validation import (
    validate_uuid,
    validate_email,
    validate_positive_integer,
    validate_choice
)

# Ejemplo
@router.get("/eventos/{evento_id}")
async def get_evento(evento_id: str):
    evento_id = validate_uuid(evento_id, "ID de evento")
    # ... continuar
```

### Error Handling

```python
# Exception handlers globales
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

# Nunca exponer stack traces en producción
# Loggear errores internamente
# Retornar mensajes user-friendly
```

---

## Escalabilidad

### Horizontal Scaling

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  API Server  │    │  API Server  │    │  API Server  │
│   Instance 1 │    │   Instance 2 │    │   Instance N │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
                  ┌────────▼─────────┐
                  │  Load Balancer   │
                  │   (Nginx/ALB)    │
                  └──────────────────┘
                           │
                  ┌────────▼─────────┐
                  │   PostgreSQL     │
                  │ (Read Replicas)  │
                  └──────────────────┘
```

### Caching Strategy

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ CDN (Static)│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ API Gateway │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Redis Cache │ ◄── Cache de:
└──────┬──────┘     - Leaderboard
       │            - Eventos próximos
       │            - Noticias recientes
       ▼            - Desafío del día
┌─────────────┐
│  Database   │
└─────────────┘
```

### Performance Optimizations

1. **Database**
   - Connection pooling
   - Índices estratégicos
   - Query optimization
   - Materialized views (leaderboard)

2. **API**
   - Paginación en todos los endpoints
   - Lazy loading
   - Response compression (gzip)
   - Async/await operations

3. **Frontend**
   - Code splitting
   - Image optimization
   - React.memo para componentes
   - Virtual lists (leaderboard)

---

## Patrones de Diseño

### 1. Repository Pattern

```python
# Abstracción de acceso a datos
class EventoRepository:
    def get_all(self, limite, skip, categoria):
        query = "SELECT * FROM eventos..."
        return execute_query(query, params)

    def get_by_id(self, evento_id):
        query = "SELECT * FROM eventos WHERE id = %s"
        return execute_one(query, (evento_id,))
```

### 2. Service Layer Pattern

```python
# Lógica de negocio separada
class GamificationService:
    def calculate_level(self, xp):
        return (xp // 1000) + 1

    def check_badge_unlock(self, usuario_id):
        # Lógica compleja de badges
        pass
```

### 3. Dependency Injection

```python
# FastAPI Depends
@router.get("/leaderboard")
async def get_leaderboard(
    service: Annotated[GamificationService, Depends(get_gamification_service)]
):
    return service.get_leaderboard()
```

### 4. Factory Pattern

```python
# Creación de objetos complejos
class DesafioFactory:
    @staticmethod
    def create_from_ia_response(response):
        # Parse response y crear desafío
        pass
```

### 5. Error Handler Pattern

```typescript
// Frontend error handling centralizado
try {
  const data = await api.get('/eventos/');
  return handleApiError(() => ensureArray(data));
} catch (error) {
  // Manejo centralizado
}
```

---

## Diagrama de Despliegue

### Desarrollo Local

```
Developer Machine
├── Frontend (Expo Dev Server)
│   └── Port: 8081
│
├── Backend (Uvicorn)
│   └── Port: 8001
│
└── PostgreSQL
    └── Port: 5432
```

### Producción (Propuesto)

```
┌─────────────────────────────────────────────┐
│              Internet                       │
└────────────────┬────────────────────────────┘
                 │
         ┌───────▼────────┐
         │  Cloudflare    │
         │  (CDN + WAF)   │
         └───────┬────────┘
                 │
    ┌────────────▼──────────────┐
    │     Load Balancer         │
    │  (AWS ALB / Azure LB)     │
    └────────────┬──────────────┘
                 │
     ┌───────────┴───────────┐
     │                       │
┌────▼─────┐          ┌──────▼────┐
│ Web App  │          │  API      │
│ (S3/CDN) │          │ (ECS/AKS) │
└──────────┘          └─────┬─────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
       ┌──────▼─────┐ ┌────▼────┐ ┌──────▼──────┐
       │ PostgreSQL │ │  Redis  │ │   Azure     │
       │   (RDS)    │ │ (Cache) │ │ Blob Storage│
       └────────────┘ └─────────┘ └─────────────┘
```

---

## Decisiones Arquitectónicas

### ADR-001: FastAPI como Backend Framework

**Contexto:** Necesitamos un framework Python moderno y performante.

**Decisión:** Usar FastAPI

**Razones:**
- Performance comparable a Node.js/Go
- Async/await nativo
- Validación automática con Pydantic
- Documentación auto-generada (Swagger)
- Type hints nativos

### ADR-002: Expo para Mobile Development

**Contexto:** Necesitamos desarrollar para iOS, Android y Web.

**Decisión:** Usar Expo + React Native

**Razones:**
- Write once, run everywhere
- Ecosystem maduro
- Hot reload para desarrollo rápido
- EAS Build para CI/CD
- Expo Router para navegación moderna

### ADR-003: PostgreSQL como Base de Datos

**Contexto:** Necesitamos almacenamiento relacional confiable.

**Decisión:** Usar PostgreSQL 17

**Razones:**
- ACID compliant
- Soporte para JSON (flexibilidad)
- PostGIS para geolocalización
- Performance excelente
- Comunidad grande

### ADR-004: Gemini para IA

**Contexto:** Necesitamos IA generativa para desafíos y code review.

**Decisión:** Usar Google Gemini 2.5 Flash

**Razones:**
- Mejor costo/beneficio
- Multimodal (texto, código, imágenes)
- Respuestas rápidas (~2s)
- Rate limits generosos
- API simple

---

## Próximos Pasos Arquitectónicos

### Corto Plazo

1. **JWT Authentication**
   - Implementar tokens JWT
   - Refresh token mechanism
   - Revocación de tokens

2. **Redis Caching**
   - Cache de leaderboard
   - Cache de desafío del día
   - Session storage

3. **WebSockets**
   - Notificaciones en tiempo real
   - Live leaderboard updates
   - Multiplayer challenges

### Mediano Plazo

4. **Event Sourcing**
   - Registro de eventos del usuario
   - Analytics detallado
   - Audit trail

5. **Microservices Full**
   - Separar módulos en microservicios
   - API Gateway
   - Service mesh

6. **ML Pipeline**
   - Personalización con ML
   - Recommendation engine
   - Fraud detection

---

<div align="center">

**Documentación de Arquitectura - DevPal v1.0**

*Última actualización: Marzo 2026*

[Volver al README principal](../README.md)

</div>
