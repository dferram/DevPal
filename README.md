<div align="center">

  <img src="assets/informatica.png" alt="Facultad de Informatica Logo" height="110px" style="margin-right: 25px;">
  <img src="assets/devpal-mascot.png" alt="DevPal Logo" height="110px" style="margin-right: 25px;">
  <img src="assets/Logo_INDAUTOR.png" alt="INDAUTOR Logo" height="110px">

### DevPal — Full-Stack Developer Companion Platform

[![React Native](https://img.shields.io/badge/React_Native-0.83-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK_52-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

A high-performance full-stack ecosystem engineered to accelerate developer competency through daily algorithmic challenges, automated code evaluation, localized tech event discovery, gamified progress metrics, and technical news curation.

</div>

---

## Table of Contents

- [Objective](#objective)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Step-by-Step Setup Guide](#step-by-step-setup-guide)
  - [Step 1: Repository Cloning](#step-1--repository-cloning)
  - [Step 2: Backend Configuration & Execution](#step-2--backend-configuration--execution)
  - [Step 3: Frontend Client Configuration & Execution](#step-3--frontend-client-configuration--execution)
- [REST API Specification](#rest-api-specification)
- [Testing & Quality Assurance](#testing--quality-assurance)
- [Security Architecture](#security-architecture)
- [Common Troubleshooting](#common-troubleshooting)
- [Useful Resources](#useful-resources)

---

## Objective

DevPal provides software engineers with an integrated environment designed to track learning progression, sharpen algorithmic problem-solving abilities, and engage with the broader technical community. The platform unites:

- **Automated Coding Challenges:** Dynamic problem generation and test-driven code execution.
- **AI-Powered Code Review:** Automated syntax and architectural feedback powered by Google GenAI.
- **Tech Community Map:** Geolocation-aware conference, workshop, and hackathon discovery.
- **Deterministic Gamification:** Mathematical progression formulas for experience points (XP), ranks, and achievement badges.
- **Curated Technical News:** Aggregated feed tailored to software engineering specializations.

---

## System Architecture

The platform implements a decoupled three-tier architecture:

```
+-----------------------------------------------------------------------+
|                           Client Tier                                 |
|      React Native (Expo SDK 52) / TypeScript / NativeWind CSS         |
|      Platforms: Android, iOS, Web (Single Unified Codebase)           |
+-----------------------------------+-----------------------------------+
                                    |
                                    | HTTPS / REST / JSON (Axios)
                                    v
+-----------------------------------+-----------------------------------+
|                         Application Tier                              |
|             FastAPI (Python 3.11+) / Uvicorn ASGI Server              |
|                                                                       |
|  +-------------+  +-------------+  +---------------+  +------------+  |
|  | Auth Router |  | Code Review |  | Gamification  |  | Events/News|  |
|  +-------------+  +-------------+  +---------------+  +------------+  |
|  | Sandboxed Code Executor      |  | Google GenAI (Gemini) Engine  |  |
|  +-----------------------------+  +-------------------------------+  |
+-----------------------------------+-----------------------------------+
                                    |
                                    | Connection Pool (psycopg2 / SQLAlchemy)
                                    v
+-----------------------------------+-----------------------------------+
|                            Data Tier                                  |
|         PostgreSQL 15+ (Azure Database / Local Instance)              |
|         Tables: Users, Profiles, Challenges, Events, Badges, Progress |
+-----------------------------------------------------------------------+
```

---

## Project Structure

```text
DevPal/
|-- assets/                        # Corporate and institutional branding assets
|   |-- informatica.png            # Facultad de Informatica UAQ logo
|   |-- Logo_INDAUTOR.png          # INDAUTOR official registration seal
|   `-- devpal-mascot.png          # DevPal platform mascot logo
|
|-- backend/                       # FastAPI application tier
|   |-- app/
|   |   |-- jobs/                  # Background schedulers (APScheduler)
|   |   |-- middleware/            # Rate limiting and payload size guards
|   |   |-- models/                # Declarative SQLAlchemy models and Pydantic schemas
|   |   |-- routers/               # REST API route handlers
|   |   |   |-- auth.py            # User authentication, registration, profiles
|   |   |   |-- code_review.py     # AI code analysis endpoints
|   |   |   |-- desafios.py        # Daily coding challenges and execution
|   |   |   |-- eventos.py         # Tech event aggregation and tracking
|   |   |   |-- gamification.py    # Leaderboards, user levels, badge verification
|   |   |   `-- noticias.py        # Curated technical news feed
|   |   |-- services/              # Business logic, sandboxing, AI integrations
|   |   |-- utils/                 # Exception handlers and validation helpers
|   |   |-- config.py              # Application settings (Pydantic BaseSettings)
|   |   |-- db.py                  # Database connection pooling (psycopg2)
|   |   |-- database.py            # SQLAlchemy engine and session provider
|   |   `-- main.py                # ASGI entrypoint and middleware orchestration
|   |-- tests/                     # Automated unit and integration test suites
|   |-- Dockerfile                 # Container build specification
|   `-- requirements.txt           # Python dependency manifest
|
|-- frontend/                      # Mobile and web client application
|   |-- app/                       # Expo Router file-based routing
|   |   |-- (auth)/                # Authentication screens (Login, Register)
|   |   |-- (onboarding)/          # User onboarding and interest selection
|   |   |-- (tabs)/                # Main tab navigation (Feed, Map, Profile)
|   |   |-- challenges.tsx         # Interactive challenge execution workspace
|   |   |-- code-review.tsx        # AI Code review console
|   |   `-- leaderboard.tsx        # Global competitive ranking view
|   |-- components/                # Reusable presentation and layout components
|   |-- constants/                 # Design tokens, color palettes, API endpoints
|   |-- contexts/                  # React Context providers (AuthContext)
|   |-- hooks/                     # Custom React hooks (Theming, Navigation)
|   |-- services/                  # HTTP clients and remote API adapters (Axios)
|   |-- utils/                     # Secure storage abstractions (SecureStore)
|   |-- app.json                   # Expo application manifest
|   |-- package.json               # Node.js dependency manifest
|   `-- tailwind.config.js         # NativeWind utility classes configuration
|
|-- docs/                          # In-depth technical architecture documentation
|   `-- ARCHITECTURE.md            # Detailed system design specification
|
`-- .gitignore                     # Repository exclusion rules
```

---

## Prerequisites

The following software packages must be installed on the host machine:

- **Node.js:** `>= 18.18.0` (LTS recommended)
- **Package Manager:** `npm` `>= 9.0.0` or `yarn` `>= 1.22.0`
- **Python:** `>= 3.11.0`
- **PostgreSQL:** `>= 15.0`
- **Git:** `>= 2.40.0`

---

## Step-by-Step Setup Guide

### Step 1 — Repository Cloning

Open your terminal and clone the repository:

```bash
git clone https://github.com/dferram/DevPal.git
cd DevPal
```

---

### Step 2 — Backend Configuration & Execution

#### 2.1 — Create and Activate Python Virtual Environment

**On Windows (PowerShell):**
```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
```

**On macOS / Linux:**
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
```

#### 2.2 — Install Backend Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

#### 2.3 — Configure Environment Variables

Create a file named `.env` inside the `backend/` directory:

```ini
# PostgreSQL Connection Parameters
DB_HOST=localhost
DB_NAME=devpal_db
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_PORT=5432

# External API Integrations
GEMINI_API_KEY=your_google_gemini_api_key

# Runtime Parameters
PORT=8001
ENVIRONMENT=development
LOG_LEVEL=INFO
DEBUG=True
CORS_ORIGINS=*
ENABLE_SCHEDULED_JOBS=True
RATE_LIMIT_ENABLED=True
```

#### 2.4 — Initialize Database Schema

```bash
python poblar_datos_prueba.py
```

#### 2.5 — Launch Backend Server

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

Interactive API documentation will be available at `http://localhost:8001/docs`.

---

### Step 3 — Frontend Client Configuration & Execution

#### 3.1 — Install Frontend Dependencies

Open a new terminal window:

```bash
cd frontend
npm install
```

#### 3.2 — Configure Frontend Environment Variables

Create a file named `.env` inside the `frontend/` directory:

```ini
# Backend API Base URL
# For Web / Browser testing:
EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:8001

# For Android Emulator:
# EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:8001

# For Physical Mobile Devices on the same LAN:
# EXPO_PUBLIC_API_BASE_URL=http://192.168.1.X:8001
```

#### 3.3 — Launch Metro Bundler

```bash
# Start Expo development server
npx expo start

# Alternatively, target a specific platform directly:
npx expo start --web       # Browser execution
npx expo start --android   # Android emulator / physical device
npx expo start --ios       # iOS simulator (macOS required)
```

---

## REST API Specification

| Module | Method | Endpoint | Description |
|---|---|---|---|
| **Auth** | `POST` | `/api/auth/register` | Register a new developer account |
| | `POST` | `/api/auth/login` | Authenticate user credentials |
| | `GET` | `/api/auth/me/{user_id}` | Retrieve profile metadata, stats, and badges |
| | `PUT` | `/api/auth/me/{user_id}` | Update personal information |
| | `POST` | `/api/auth/me/{user_id}/avatar` | Upload profile image (`multipart/form-data`) |
| **Challenges** | `GET` | `/api/desafios/hoy` | Retrieve active daily challenge |
| | `GET` | `/api/desafios/historial` | Paginated challenge attempt history |
| | `POST` | `/api/desafios/{id}/ejecutar` | Execute user code against assertion test suite |
| | `POST` | `/api/desafios/{id}/completar` | Mark challenge completed and credit XP |
| **Events** | `GET` | `/api/eventos/` | List upcoming developer conferences and hackathons |
| | `GET` | `/api/eventos/{id}` | Retrieve comprehensive event details |
| | `POST` | `/api/eventos/{id}/guardar` | Bookmark event to user saved list |
| | `POST` | `/api/eventos/{id}/registrar` | Register user attendance |
| **Gamification** | `GET` | `/api/gamification/leaderboard` | Global developer leaderboard ranking |
| | `GET` | `/api/gamification/ranking/{id}` | Computed standing for target user |
| | `GET` | `/api/gamification/badges/{id}` | List user earned badges |
| | `POST` | `/api/gamification/badges/verificar/{id}` | Evaluate progression rules and unlock badges |
| **News** | `GET` | `/api/noticias/` | Retrieve technical news feed |
| **Review** | `GET` | `/api/code-review/historial` | Historical AI code assessment reports |

---

## Testing & Quality Assurance

### Backend Test Suite Execution

```bash
cd backend
# Execute Pytest test suites with code coverage metrics
pytest -v --cov=app --cov-report=term-missing
```

### Frontend Static Analysis & Type Checking

```bash
cd frontend
# TypeScript compiler type validation
npx tsc --noEmit

# ESLint static code analysis
npm run lint
```

---

## Security Architecture

1. **Credential Hashing:** Salted Bcrypt one-way password hashing via Passlib.
2. **SQL Injection Mitigation:** Parameterized SQL prepared statements across all database queries.
3. **Payload Inspection:** Strict 10 MB payload limits enforced via `RequestSizeLimitMiddleware`.
4. **Client Secret Protection:** Session tokens stored in platform-native encrypted storage (`Expo SecureStore`) on iOS and Android.
5. **Rate Limiting:** Token-bucket rate limiting to mitigate denial-of-service attempts.

---

## Common Troubleshooting

| Issue | Root Cause | Solution |
|---|---|---|
| Frontend cannot connect to backend on mobile | `127.0.0.1` points to the mobile device itself, not the host machine | Update `frontend/.env` to use your computer's LAN IP (e.g., `http://192.168.1.50:8001`) or `10.0.2.2` on Android emulator |
| Database connection refused | PostgreSQL service is stopped or port 5432 is blocked | Verify PostgreSQL service status and confirm credentials in `backend/.env` |
| Missing Python modules | Virtual environment not activated prior to command execution | Activate `.venv` using `.venv\Scripts\Activate.ps1` (Windows) or `source .venv/bin/activate` (macOS/Linux) |
| Git tracks `node_modules` | Files were cached before `.gitignore` was registered | Run `git rm -r --cached .` followed by `git add .` |
| Expo bundler caching issues | Stale Metro bundler cache | Run `npx expo start -c` to clear the bundler cache |

---

## Useful Resources

- [Comprehensive System Architecture Specification](docs/ARCHITECTURE.md)
- [FastAPI Official Documentation](https://fastapi.tiangolo.com/)
- [Expo SDK Documentation](https://docs.expo.dev/)
- [React Native Official Documentation](https://reactnative.dev/docs/getting-started)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
