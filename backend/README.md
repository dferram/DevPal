# DevPal Backend API Service

## 1. Overview

The DevPal backend service is an asynchronous RESTful API built on the FastAPI framework and Python 3.11+. It serves as the core business logic, persistence coordinator, code evaluation engine, and AI processing layer for the DevPal platform.

---

## 2. Technical Stack

- **Runtime:** Python 3.11+
- **Framework:** FastAPI 0.115.0
- **ASGI Server:** Uvicorn 0.32.0
- **Persistence:** PostgreSQL 15+, SQLAlchemy 2.0.36, psycopg2-binary 2.9.10
- **Data Validation:** Pydantic v2 (BaseSettings, BaseModel)
- **Password Hashing:** Passlib with Bcrypt algorithm
- **Background Scheduler:** APScheduler 3.10.4
- **AI Integration:** Google GenAI SDK (Gemini Pro)
- **Rate Limiting:** SlowAPI / Custom In-Memory Token Bucket Middleware
- **Testing:** Pytest 8.3.3, Pytest-AsyncIO 0.24.0, HTTPX 0.27.2

---

## 3. Directory Layout

```
backend/
|-- app/
|   |-- jobs/
|   |   `-- scheduled_tasks.py      # Background cron jobs for daily generation
|   |-- middleware/
|   |   |-- rate_limiter.py         # SlowAPI rate limiter integration
|   |   `-- simple_rate_limiter.py  # In-memory sliding window rate limiter
|   |-- models/
|   |   |-- db_models.py            # Declarative SQLAlchemy database models
|   |   `-- schemas.py              # Pydantic request and response schemas
|   |-- routers/
|   |   |-- auth.py                 # User authentication, registration, profiles
|   |   |-- code_review.py          # AI code review analysis endpoints
|   |   |-- desafios.py             # Daily challenge lifecycle and execution
|   |   |-- eventos.py              # Tech events CRUD and bookmarking
|   |   |-- gamification.py         # Leaderboards, user ranking, and badges
|   |   `-- noticias.py             # Curated technical news feed
|   |-- services/
|   |   |-- code_executor.py        # Code execution and test verification
|   |   |-- code_executor_seguro.py # RestrictedPython sandboxed execution
|   |   |-- gamification_service.py # XP calculus and badge unlock criteria
|   |   |-- ia_service.py           # Google Gemini AI client integration
|   |   `-- eventos_generator.py    # Automated event scraping and seeding
|   |-- utils/
|   |   |-- exception_handlers.py   # Global HTTP error formatting
|   |   `-- validation.py           # UUID, email, and input constraint validators
|   |-- config.py                   # Centralized application settings
|   |-- database.py                 # SQLAlchemy engine and session provider
|   |-- db.py                       # Connection pooling utility (psycopg2)
|   `-- main.py                     # Application bootstrap and middleware setup
|-- tests/                          # Automated unit and integration tests
|-- Dockerfile                      # Production container image definition
`-- requirements.txt                # Pinned dependency manifest
```

---

## 4. Configuration & Environment Variables

All configuration parameters are defined within `app/config.py` using Pydantic's `BaseSettings`. Create a `.env` file in the `backend/` directory:

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `DB_HOST` | String | (Required) | PostgreSQL host address |
| `DB_NAME` | String | (Required) | Target database name |
| `DB_USER` | String | (Required) | Database user account |
| `DB_PASSWORD` | String | (Required) | Database password |
| `DB_PORT` | String | `5432` | Database port number |
| `GEMINI_API_KEY` | String | (Required) | Google Gemini API key |
| `PORT` | Integer | `8001` | ASGI server port |
| `ENVIRONMENT` | String | `development` | Environment tier (`development`, `production`) |
| `CORS_ORIGINS` | String | `*` | Allowed CORS origins (comma-separated) |
| `ENABLE_SCHEDULED_JOBS`| Boolean| `True` | Activates background challenge generator |
| `RATE_LIMIT_ENABLED` | Boolean| `True` | Enables request throttling |

---

## 5. Local Setup & Execution

### 5.1. Setup Virtual Environment

```bash
cd backend
python -m venv .venv

# Activate:
# On Windows PowerShell:
.venv\Scripts\Activate.ps1
# On Linux / macOS:
source .venv/bin/activate
```

### 5.2. Install Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 5.3. Start the Server

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

Interactive API documentation will be available at:
- **Swagger Documentation:** `http://localhost:8001/docs`
- **ReDoc Documentation:** `http://localhost:8001/redoc`

---

## 6. Primary REST Endpoints

### 6.1. Authentication Router (`/api/auth`)
- `POST /register`: Registers a new account with validated email and bcrypt hashed credentials.
- `POST /login`: Validates user credentials and returns user identity metadata.
- `GET /me/{user_id}`: Retrieves profile details, computed XP level, and recent activity.
- `PUT /me/{user_id}`: Updates user details (first name, last name, email).
- `POST /me/{user_id}/avatar`: Handles profile image uploads via `multipart/form-data`.
- `POST /me/{user_id}/projects`: Associates developer portfolio projects with user profile.

### 6.2. Challenges Router (`/api/desafios`)
- `GET /hoy`: Retrieves the active daily challenge and current user submission progress.
- `GET /historial`: Fetches paginated history of user challenge attempts.
- `POST /{id}/ejecutar`: Runs user-submitted code against predefined test suites.
- `POST /{id}/completar`: Marks challenge as solved and updates gamification state.
- `POST /{id}/abandonar`: Marks active challenge attempt as abandoned.

### 6.3. Events Router (`/api/eventos`)
- `GET /`: Lists upcoming technical conferences, workshops, and hackathons.
- `GET /guardados`: Lists events saved by a specific user.
- `GET /{id}`: Returns detailed information and location metadata for an event.
- `POST /{id}/guardar`: Bookmarks an event to user favorites.
- `DELETE /{id}/guardar`: Removes an event from user bookmarks.
- `POST /{id}/registrar`: Confirms user attendance registration.

### 6.4. Gamification Router (`/api/gamification`)
- `GET /leaderboard`: Returns global ranked standings filtered by language and XP.
- `GET /ranking/{user_id}`: Computes and returns specific rank standing for a user.
- `GET /badges/{user_id}`: Returns unlocked badges and upcoming badge milestones.
- `POST /badges/verificar/{user_id}`: Evaluates eligibility and issues new badges.
- `GET /stats/global`: Aggregates total platform metrics (users, challenges, events, XP).

---

## 7. Testing

Execute automated unit and integration tests using `pytest`:

```bash
# Run entire test suite
pytest

# Run with verbose output and test coverage report
pytest -v --cov=app --cov-report=term-missing
```
