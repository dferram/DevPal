# System Architecture & Technical Specification

## 1. Architectural Overview

DevPal is engineered as a three-tier modular system designed for scalability, low latency, and cross-platform accessibility. The architecture segregates responsibilities across the presentation layer, the application and business logic services layer, and the relational persistence tier.

```
+-----------------------------------------------------------------------------------+
|                                  PRESENTATION LAYER                               |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                 React Native / Expo Application (SDK 52)                    |  |
|  |                                                                             |  |
|  |  +---------------------+  +---------------------+  +---------------------+  |  |
|  |  |    Expo Router      |  |  Auth & State Ctx   |  |   NativeWind UI     |  |  |
|  |  |  (File Navigation)  |  |  (Secure Storage)   |  |   (Design System)   |  |  |
|  |  +---------------------+  +---------------------+  +---------------------+  |  |
|  |  |  Challenge Console  |  |  Event Aggregator   |  |  Gamification Card  |  |  |
|  |  +---------------------+  +---------------------+  +---------------------+  |  |
|  +-----------------------------------------------------------------------------+  |
+------------------------------------------+----------------------------------------+
                                           |
                                           | HTTPS / JSON (Axios HTTP Client)
                                           v
+-----------------------------------------------------------------------------------+
|                               APPLICATION SERVICE LAYER                            |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                   FastAPI ASGI Core Server (Python 3.11+)                   |  |
|  |                                                                             |  |
|  |  +-----------------------------------------------------------------------+  |  |
|  |  | Middlewares: RequestSizeLimit, CORSFilter, CustomRateLimiter          |  |  |
|  |  +-----------------------------------------------------------------------+  |  |
|  |  | REST Routing Controllers:                                             |  |  |
|  |  |   - AuthRouter        - DesafiosRouter      - EventosRouter           |  |  |
|  |  |   - GamificationRouter - NoticiasRouter      - CodeReviewRouter       |  |  |
|  |  +-----------------------------------------------------------------------+  |  |
|  |  | Domain Services:                                                      |  |  |
|  |  |   - CodeExecutionService (Sandbox)                                    |  |  |
|  |  |   - GamificationService (XP, Level Curves, Badge Verification)        |  |  |
|  |  |   - IAService (Google GenAI Gemini Client & Prompt Parsers)           |  |  |
|  |  |   - EventosGeneratorService / NoticiasGeneratorService                |  |  |
|  |  +-----------------------------------------------------------------------+  |  |
|  |  | Schedulers: APScheduler Background Worker (Daily challenge generation)|  |  |
|  |  +-----------------------------------------------------------------------+  |  |
|  +-----------------------------------------------------------------------------+  |
+------------------------------------------+----------------------------------------+
                                           |
                                           | TCP / TLS Connection Pool (psycopg2)
                                           v
+-----------------------------------------------------------------------------------+
|                                  PERSISTENCE LAYER                                |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                      PostgreSQL 15+ Relational Database                     |  |
|  |                                                                             |  |
|  |  [usuarios]               [perfiles_usuario]       [desafios_diarios]       |  |
|  |  [progreso_desafio]       [eventos]                [eventos_guardados]      |  |
|  |  [usuario_eventos]        [noticias]               [badges]                 |  |
|  |  [usuario_badges]         [notificaciones]         [proyectos_usuario]      |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## 2. Component Decomposition

### 2.1. Client Architecture (React Native / Expo)
The client interface is constructed using a declarative component hierarchy structured under Expo Router:
- **Routing Engine:** Utilizes typed file-based navigation grouped logically into route groups:
  - `(auth)`: Isolated authentication layouts for unauthenticated states.
  - `(onboarding)`: Progressive profile configuration pipelines.
  - `(tabs)`: Primary tabbed shell providing root access to Discover, Challenges, Community Maps, and Profile.
- **State and Authentication Synchronization:** Handled through `AuthContext`, which coordinates authentication transitions with `AuthStorage`. `AuthStorage` implements an OS-specific abstraction layer routing credentials to `expo-secure-store` on native targets (iOS Keychain and Android KeyStore) and falls back safely to `AsyncStorage` under browser targets.
- **Design System:** Standardized tokens encapsulated in `constants/designTokens.ts` combined with Tailwind utility compilation via NativeWind for fluid responsive layouts.

### 2.2. Application Server (FastAPI)
The server layer operates asynchronously on the ASGI specification:
- **Middleware Pipeline:**
  1. `RequestSizeLimitMiddleware`: Rejects request bodies exceeding 10 MB with HTTP 413.
  2. `CORSMiddleware`: Enforces configurable origin policies across cross-origin requests.
  3. `CustomRateLimitMiddleware`: Implements in-memory token bucket rate limiting to prevent denial of service and API endpoint abuse.
  4. Global Exception Interceptors: Converts unhandled runtime exceptions and Pydantic validation failures into structured RFC 7807 compliant error payloads.
- **Dependency Injection:** Database connections, service Singletons (`IAService`, `GamificationService`), and request sanitizers are instantiated via FastAPI's `Depends` dependency injection mechanisms.

---

## 3. Data Tier & Relational Schema

The persistence layer relies on PostgreSQL. Primary relational entities and constraints are structured as follows:

### 3.1. Entity Relationship Definitions

```
 +--------------------+          1:1          +--------------------+
 |      usuarios      | --------------------< |  perfiles_usuario  |
 |--------------------|                       |--------------------|
 | id (PK, UUID)      |                       | id (PK, UUID)      |
 | email (UNIQUE)     |                       | usuario_id (FK)    |
 | password_hash      |                       | nivel (INT)        |
 | nombre             |                       | racha_dias (INT)   |
 | apellidos          |                       | eventos_asistidos  |
 | avatar_url         |                       | certificados (INT) |
 | created_at         |                       | logros (INT)       |
 +--------------------+                       +--------------------+
           |
           | 1:N
           +-------------------------------------------------------+
           |                             |                         |
           v 1:N                         v 1:N                     v 1:N
 +----------------------+      +----------------------+   +----------------------+
 |  progreso_desafio    |      |   usuario_eventos    |   |    usuario_badges    |
 |----------------------|      |----------------------|   |----------------------|
 | id (PK, UUID)        |      | id (PK, UUID)        |   | id (PK, UUID)        |
 | usuario_id (FK)      |      | usuario_id (FK)      |   | usuario_id (FK)      |
 | desafio_id (FK)      |      | evento_id (FK)       |   | badge_id (FK)        |
 | estado (ENUM)        |      | estado (VARCHAR)     |   | fecha_obtenido       |
 | completado_at        |      | created_at           |   +----------------------+
 | codigo_enviado       |      +----------------------+
 | lenguaje_usado       |                 | N:1
 +----------------------+                 v
           | N:1               +----------------------+
           v                   |       eventos        |
 +----------------------+      |----------------------|
 |   desafios_diarios   |      | id (PK, UUID)        |
 |----------------------|      | titulo               |
 | id (PK, UUID)        |      | descripcion          |
 | fecha (DATE, UNIQUE) |      | fecha (DATE)         |
 | titulo               |      | hora (TIME)          |
 | definicion_problema  |      | ubicacion            |
 | templates_json       |      | categoria            |
 | casos_prueba_json    |      | imagen_url           |
 | dificultad (ENUM)    |      | latitud / longitud   |
 | xp_recompensa (INT)  |      +----------------------+
 +----------------------+
```

---

## 4. Code Execution and Sandboxing Architecture

When a client submits code for validation via `/api/desafios/{id}/ejecutar`, the request undergoes the following lifecycle:

```
[Client] -> POST /api/desafios/{id}/ejecutar (code, language)
    |
    v
[DesafiosRouter]
    |-- 1. Input sanitization (UUID validation, 100KB payload threshold)
    |-- 2. Fetch test suites (`casos_prueba_json`) from database
    v
[CodeExecutionService]
    |
    |-- Target Language Inspection
    |
    +---> Python Executor:
    |       - Sanitizes quotation artifacts and syntax formatting
    |       - Executes function in sandboxed namespace
    |       - Asserts outputs against test vector cases
    |
    +---> JavaScript / TypeScript Executor:
    |       - Allocates ephemeral execution script via tempfile
    |       - Subprocesses Node.js runtime with strict execution timeout (5000ms)
    |       - Captures and parses stdout JSON assertions
    |       - Purges temporary disk artifacts post-execution
    |
    v
[Results Formatter] -> Computes passed count, execution time, tracebacks
    |
    v
[Database Updater] -> Updates `progreso_desafio_diario` to 'en_progreso' or 'completado'
    |
    v
[Client Response] -> Returns execution diagnostics and test case telemetry
```

---

## 5. Gamification Mechanics & Progression Formulas

The progression subsystem computes developer progression deterministically using calibrated point yields.

### 5.1. Experience Points (XP) Formulation

$$\text{XP}_{\text{Total}} = \text{BaseXP} + \sum (\text{Events} \times 150) + \sum (\text{Certs} \times 500) + \sum (\text{Badges} \times 200) + (\text{StreakDays} \times 20) + \sum (\text{Projects} \times 300)$$

### 5.2. Level Curve Computation

$$\text{Level} = \left\lfloor \frac{\text{XP}_{\text{Total}}}{1000} \right\rfloor + 1$$

$$\text{XP}_{\text{CurrentLevelProgress}} = \text{XP}_{\text{Total}} \pmod{1000}$$

$$\text{XP}_{\text{RemainingToNextLevel}} = 1000 - \text{XP}_{\text{CurrentLevelProgress}}$$

### 5.3. Badge Verification Matrix

Badge issuance is evaluated through `GamificationService.verificar_y_desbloquear_badges()` based on the following predicate rules:
- **First Blood:** Awarded upon completing $\ge 1$ daily challenge.
- **Streak Novice:** Awarded when active streak satisfies $\text{racha\_dias} \ge 3$.
- **Streak Master:** Awarded when active streak satisfies $\text{racha\_dias} \ge 7$.
- **Event Explorer:** Awarded when attended events count $\ge 1$.
- **Centurion:** Awarded when total accumulated XP exceeds $1000$.

---

## 6. AI Integration Pipeline (Google GenAI Gemini)

The platform integrates Google's Gemini models for programmatic generation of technical challenges, news curation, and automated code review.

```
+--------------------------------------------------------------------+
|                         IAService Pipeline                         |
+--------------------------------------------------------------------+
                                 |
           +---------------------+---------------------+
           |                                           |
           v                                           v
+-----------------------+                   +-----------------------+
|  Challenge Generator  |                   |   Code Review Engine  |
+-----------------------+                   +-----------------------+
           |                                           |
           | Ingests Domain Prompts                    | Ingests User Code &
           | (Algorithms, Data Structs)                | Target Language
           v                                           v
+--------------------------------------------------------------------+
|               Google GenAI Client (Gemini Pro Model)               |
|                                                                    |
|  - Temperature: 0.2 (High determinism for code generation)         |
|  - Output Schema: Explicit JSON Enforced Structure                 |
+--------------------------------------------------------------------+
                                 |
                                 v
+--------------------------------------------------------------------+
|                         Response Sanitizer                         |
|                                                                    |
|  - Strips Markdown Code Fences (```json ... ```)                   |
|  - Validates JSON payload schema and test case assertions          |
|  - Applies static fallbacks if API limits or timeouts occur        |
+--------------------------------------------------------------------+
```

---

## 7. Deployment & Infrastructure Strategy

### 7.1. Local Development Topology
- **Backend:** Uvicorn ASGI process serving on `http://127.0.0.1:8001`.
- **Database:** Local PostgreSQL server on port `5432`.
- **Frontend:** Metro Development Server serving bundle assets to Web, Android, or iOS clients.

### 7.2. Production Containerization (Docker)
The backend service includes a multi-stage Docker build specification:

```dockerfile
FROM python:3.11-slim as base
WORKDIR /app
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1
RUN apt-get update && apt-get install -y --no-install-recommends libpq-dev gcc && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8001
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
```

### 7.3. Cloud Infrastructure
- **API Runtime:** Azure Container Apps / AWS ECS / Google Cloud Run.
- **Relational Data:** Managed PostgreSQL (Azure Database for PostgreSQL with SSL Enforced).
- **Static Assets:** Cloud Object Storage (Azure Blob Storage / AWS S3) for user-uploaded avatars.
- **Mobile Distribution:** Expo Application Services (EAS Build) generating signed `.aab` (Google Play) and `.ipa` (Apple App Store) binaries.
