<div align="center">

  <img src="assets/informatica.png" alt="Facultad de Informatica Logo" height="110px" style="margin-right: 25px;">
  <img src="assets/devpal-mascot.png" alt="DevPal Logo" height="110px" style="margin-right: 25px;">

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

<a href="https://indautor.gob.mx/"><img src="https://img.shields.io/badge/Intellectual_Property-Registered-005C3B?style=flat-square&logo=libreofficewriter&logoColor=white"/></a>

---

## Table of Contents

- [Objective](#objective)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [REST API Specification](#rest-api-specification)
- [Security Architecture](#security-architecture)

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


## Security Architecture

1. **Credential Hashing:** Salted Bcrypt one-way password hashing via Passlib.
2. **SQL Injection Mitigation:** Parameterized SQL prepared statements across all database queries.
3. **Payload Inspection:** Strict 10 MB payload limits enforced via `RequestSizeLimitMiddleware`.
4. **Client Secret Protection:** Session tokens stored in platform-native encrypted storage (`Expo SecureStore`) on iOS and Android.
5. **Rate Limiting:** Token-bucket rate limiting to mitigate denial-of-service attempts.

---

## Useful Resources

- [Comprehensive System Architecture Specification](docs/ARCHITECTURE.md)
- [FastAPI Official Documentation](https://fastapi.tiangolo.com/)
- [Expo SDK Documentation](https://docs.expo.dev/)
- [React Native Official Documentation](https://reactnative.dev/docs/getting-started)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
