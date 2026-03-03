# DevPal 🤖💻

**Tu compañero de desarrollo impulsado por IA** — Una aplicación móvil que conecta desarrolladores con eventos tech, desafíos de código diarios y revisiones de código inteligentes.

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)

---

## 🚀 Configuración Local Rápida

```powershell
# 1. Clonar el repositorio
git clone https://github.com/dferram/DevPal.git
cd DevPal

# 2. Ejecutar script de configuración automática (Windows)
.\setup.ps1

# 3. Ver documentación completa
# Abre SETUP_LOCAL.md para instrucciones detalladas
```

**📚 [Guía Completa de Configuración Local](SETUP_LOCAL.md)**

**Nota:** Las funcionalidades de IA están temporalmente **bloqueadas** para desarrollo local. La aplicación funciona completamente sin ellas.

---

## Inspiration

La comunidad de desarrolladores a menudo se siente fragmentada. Encontrar eventos tech relevantes, mantenerse motivado para practicar código, y obtener feedback constructivo sobre tu código puede ser abrumador. Nos inspiramos en la idea de crear un **compañero digital** que centralice estas necesidades en una sola experiencia gamificada.

Queríamos resolver tres problemas principales:

- 🗺️ **Descubrimiento de eventos**: Los hackathons, conferencias y talleres están dispersos en múltiples plataformas
- 📚 **Práctica consistente**: Mantener una rutina de coding es difícil sin estructura ni motivación
- 🔍 **Feedback accesible**: Obtener revisiones de código de calidad no siempre está al alcance de todos

---

## What it does

**DevPal** es una aplicación móvil que actúa como tu compañero de desarrollo personal:

### 🗓️ Descubrimiento de Eventos Tech

- Explora hackathons, conferencias y talleres en un mapa interactivo
- Filtra eventos por categoría y ubicación
- Guarda eventos de interés y recibe notificaciones

### 💻 Desafíos Diarios de Código

- Un nuevo desafío de programación cada día generado por IA
- Editor de código integrado con soporte multi-lenguaje (Python, JavaScript, etc.)
- Ejecución de código en tiempo real con casos de prueba
- Feedback instantáneo con IA que analiza tu solución

### 🤖 Revisión de Código con IA

- Pega cualquier fragmento de código y recibe análisis detallado
- Identificación de bugs, mejoras de rendimiento y buenas prácticas
- Sugerencias contextuales adaptadas a tu nivel

### 🏆 Sistema de Gamificación

- Gana XP por completar desafíos y asistir a eventos
- Sube de nivel y desbloquea badges exclusivos
- Compite en el leaderboard global
- Mantén tu racha de días consecutivos

---

## How we built it

### Frontend (Mobile App)

- **React Native + Expo** para desarrollo cross-platform (iOS, Android, Web)
- **Expo Router** para navegación file-based con typed routes
- **NativeWind/TailwindCSS** para estilos consistentes y responsivos
- **React Native Maps + Leaflet** para visualización de eventos en mapa
- **Expo Secure Store** para almacenamiento seguro de credenciales
- **React Native Reanimated** para animaciones fluidas

### Backend (API)

- **FastAPI** como framework web de alto rendimiento
- **PostgreSQL** con SQLAlchemy ORM para persistencia de datos
- **Google Gemini 2.5 Flash** para todas las funcionalidades de IA:
  - Generación de desafíos de código diarios
  - Análisis y revisión de código
  - Generación de eventos tech relevantes
  - Creación de noticias del ecosistema dev
- **APScheduler** para tareas programadas (generación diaria de contenido)
- **RestrictedPython** para ejecución segura de código de usuarios

### Arquitectura

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Mobile App    │────▶│   FastAPI       │────▶│   PostgreSQL    │
│   (Expo/RN)     │     │   Backend       │     │   Database      │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │  Google Gemini  │
                        │  2.5 Flash AI   │
                        └─────────────────┘
```

---

## Challenges we ran into

### 🔐 Ejecución Segura de Código

Ejecutar código de usuarios de forma segura fue un desafío crítico. Implementamos **RestrictedPython** para sandboxear la ejecución y prevenir acceso a recursos del sistema, imports peligrosos y loops infinitos.

### 🧠 Prompts de IA Consistentes

Lograr que Gemini genere desafíos de código con el formato correcto (descripción, casos de prueba, templates multi-lenguaje) requirió iteración extensiva en los prompts y validación de respuestas JSON.

### 🗺️ Integración de Mapas Cross-Platform

React Native Maps no funciona bien en web, así que implementamos una solución híbrida usando Leaflet para web y react-native-maps para móvil.

### ⚡ Rate Limiting y Costos de API

Balancear la experiencia del usuario con los costos de API de Gemini nos llevó a implementar caching inteligente y rate limiting con SlowAPI.

### 📱 Rendimiento en Dispositivos Diversos

Optimizar las animaciones y la carga de imágenes para que funcionen fluidamente en dispositivos de gama baja fue un proceso iterativo con React Native Reanimated.

---

## Accomplishments that we're proud of

✅ **Sistema completo de gamificación** con XP, niveles, badges y leaderboard funcional

✅ **Editor de código móvil** con syntax highlighting y ejecución en tiempo real

✅ **Integración profunda con Gemini** para múltiples casos de uso (challenges, reviews, eventos, noticias)

✅ **Arquitectura escalable** con separación clara entre frontend y backend

✅ **UI/UX pulida** con diseño glassmorphism, animaciones fluidas y feedback háptico

✅ **Sistema de autenticación completo** con registro, login, y gestión de sesiones seguras

✅ **Onboarding personalizado** que adapta la experiencia según intereses y lenguajes preferidos

---

## What we learned

### Técnico

- 🔧 Cómo estructurar prompts efectivos para obtener respuestas JSON consistentes de LLMs
- 🔧 Patrones de seguridad para ejecutar código no confiable en un backend
- 🔧 Optimización de rendimiento en React Native con memorización y lazy loading
- 🔧 Diseño de sistemas de gamificación que incentiven comportamiento positivo

### Producto

- 💡 La importancia de feedback inmediato para mantener engagement
- 💡 Cómo la gamificación puede transformar tareas rutinarias en experiencias motivantes
- 💡 El valor de personalizar la experiencia desde el onboarding

### Equipo

- 🤝 Comunicación constante entre frontend y backend para definir contratos de API
- 🤝 Iteración rápida con testing en dispositivos reales

---

## What's next for DevPal

### Corto Plazo (v1.1)

- 🚀 **Modo multijugador**: Desafíos de código en tiempo real contra otros usuarios
- 🚀 **Más lenguajes**: Soporte para Rust, Go, y TypeScript
- 🚀 **Push notifications**: Recordatorios de desafíos diarios y eventos cercanos

### Mediano Plazo (v2.0)

- 🌟 **Comunidad integrada**: Foros de discusión y compartir soluciones
- 🌟 **Rutas de aprendizaje**: Paths personalizados según nivel y objetivos
- 🌟 **Integración con GitHub**: Importar repos para análisis de código más profundo
- 🌟 **Mentorías**: Conectar juniors con seniors de la comunidad

### Largo Plazo

- 🎯 **DevPal Pro**: Tier premium con desafíos de empresas reales y prep de entrevistas
- 🎯 **API pública**: Permitir a empresas integrar desafíos de DevPal en sus procesos
- 🎯 **Expansión global**: Localización a múltiples idiomas y eventos de más regiones

---

## Tech Stack

| Capa        | Tecnologías                                |
| ----------- | ------------------------------------------ |
| **Mobile**  | React Native, Expo, TypeScript, NativeWind |
| **Backend** | FastAPI, Python, SQLAlchemy, PostgreSQL    |
| **AI**      | Google Gemini 2.5 Flash                    |
| **DevOps**  | Docker, EAS Build                          |
| **Auth**    | JWT, Expo Secure Store, bcrypt             |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- PostgreSQL
- Expo CLI (`npm install -g expo-cli`)

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# Run on Android/iOS
npm run android
npm run ios
```

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv
# Windows: .venv\Scripts\activate
# Linux/Mac: source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Add your GEMINI_API_KEY and DATABASE_URL

# Run server
uvicorn app.main:app --reload
```

---

## License

Este proyecto está bajo la licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

---

<p align="center">
  Hecho con ❤️ para la comunidad dev
</p>
