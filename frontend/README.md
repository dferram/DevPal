# Frontend - DevPal Mobile App

<div align="center">

**Cross-platform mobile app built with React Native & Expo**

![React Native](https://img.shields.io/badge/React_Native-0.81.5-61DAFB.svg)
![Expo](https://img.shields.io/badge/Expo-~54.0-000020.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-Latest-3178C6.svg)

</div>

---

## 📋 Tabla de Contenidos

- [Visión General](#-visión-general)
- [Arquitectura](#-arquitectura)
- [Estructura de Carpetas](#-estructura-de-carpetas)
- [Navegación](#-navegación)
- [Componentes](#-componentes)
- [Servicios](#-servicios)
- [Estado Global](#-estado-global)
- [Utilidades](#-utilidades)
- [Configuración](#-configuración)
- [Build & Deploy](#-build--deploy)

---

## 🎯 Visión General

La aplicación móvil de DevPal es una app React Native cross-platform que funciona en:

- **iOS** (iPhone, iPad)
- **Android** (phones, tablets)
- **Web** (responsive)

### Características Principales

✨ **Navegación file-based** con Expo Router  
🎨 **Diseño glassmorphism** con NativeWind  
🗺️ **Mapas interactivos** con React Native Maps + Leaflet  
💾 **Almacenamiento seguro** con Expo Secure Store  
🎯 **TypeScript** para type safety  
📱 **Responsive design** para todos los tamaños  
⚡ **Performance optimizado** con React.memo y lazy loading  

---

## 🏗️ Arquitectura

```
┌───────────────────────────────────────────────────────┐
│              DevPal Mobile App                        │
└───────────────────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
   ┌────▼────┐     ┌─────▼─────┐    ┌────▼────┐
   │  Views  │     │  Services │    │ Context │
   │ (Screens)     │  (API)    │    │ (State) │
   └────┬────┘     └─────┬─────┘    └────┬────┘
        │                │                │
        │         ┌──────▼──────┐         │
        └────────►│ Components  │◄────────┘
                  │  (Reusable) │
                  └─────────────┘
                         │
                  ┌──────▼──────┐
                  │   Utils     │
                  │  Helpers    │
                  └─────────────┘

┌───────────────────────────────────────────────────────┐
│            External Dependencies                      │
├───────────────────────────────────────────────────────┤
│  • Expo Router (navegación)                          │
│  • NativeWind (estilos)                              │
│  • Axios (HTTP client)                               │
│  • React Native Maps (mapas)                         │
│  • Expo Secure Store (almacenamiento seguro)         │
└───────────────────────────────────────────────────────┘
```

### Flujo de Datos

```
User Action
    │
    ▼
Screen/Component
    │
    ▼
Service (API call)
    │
    ▼
Backend API
    │
    ▼
Response
    │
    ▼
Error Handler
    │
    ▼
State Update
    │
    ▼
UI Re-render
```

---

## 📁 Estructura de Carpetas

```
frontend/
├── 📂 app/                          # Expo Router (file-based routing)
│   │
│   ├── 📄 _layout.tsx               # Root layout con providers
│   ├── 📄 +html.tsx                 # HTML template (web)
│   ├── 📄 +not-found.tsx            # 404 page
│   ├── 📄 modal.tsx                 # Modal genérico
│   │
│   ├── 📂 (auth)/                   # Auth flow
│   │   ├── 📄 _layout.tsx           # Auth layout
│   │   ├── 📄 login.tsx             # Login screen
│   │   └── 📄 register.tsx          # Register screen
│   │
│   ├── 📂 (onboarding)/             # Onboarding flow
│   │   ├── 📄 _layout.tsx
│   │   ├── 📄 welcome.tsx           # Pantalla bienvenida
│   │   ├── 📄 interests.tsx         # Seleccionar intereses
│   │   └── 📄 languages.tsx         # Seleccionar lenguajes
│   │
│   ├── 📂 (tabs)/                   # Main app (tab navigation)
│   │   ├── 📄 _layout.tsx           # Tab bar layout
│   │   ├── 📄 index.tsx             # 🏠 Home/Feed
│   │   ├── 📄 map.tsx               # 🗺️ Mapa de eventos
│   │   ├── 📄 saved.tsx             # ⭐ Eventos guardados
│   │   └── 📄 profile.tsx           # 👤 Perfil de usuario
│   │
│   ├── 📂 event/                    # Detalles de evento
│   │   └── 📄 [id].tsx              # Event detail (dynamic route)
│   │
│   ├── 📂 settings/                 # Configuración
│   │   ├── 📄 index.tsx             # Menu settings
│   │   ├── 📄 edit-profile.tsx      # Editar perfil
│   │   ├── 📄 change-password.tsx   # Cambiar contraseña
│   │   ├── 📄 privacy.tsx           # Privacidad
│   │   └── 📄 terms.tsx             # Términos
│   │
│   ├── 📂 components/               # Componentes específicos de pantalla
│   │   ├── 📄 ActiveHeader.tsx
│   │   ├── 📄 EventDetailHeader.tsx
│   │   └── 📄 ProfileStats.tsx
│   │
│   ├── 📄 challenges.tsx            # Desafíos de código
│   ├── 📄 code-review.tsx           # Code review IA
│   ├── 📄 leaderboard.tsx           # Ranking global
│   ├── 📄 notifications.tsx         # Notificaciones
│   └── 📄 search.tsx                # Búsqueda de eventos
│
├── 📂 components/                   # Componentes reutilizables globales
│   ├── 📄 AIChatBubble.tsx          # Bubble chat IA
│   ├── 📄 AIReviewBottomSheet.tsx   # Sheet code review
│   ├── 📄 AnimatedToggle.tsx        # Toggle animado
│   ├── 📄 BackgroundDecoration.tsx  # Fondo decorativo
│   ├── 📄 BadgeCard.tsx             # Card de badge
│   ├── 📄 BentoCard.tsx             # Card estilo bento
│   ├── 📄 BlueListCard.tsx          # Card lista azul
│   ├── 📄 ChubbyButton.tsx          # Botón redondeado
│   ├── 📄 CodeEditor.tsx            # Editor de código
│   ├── 📄 ErrorBoundary.tsx         # Error boundary
│   ├── 📄 EventCard.tsx             # Card de evento
│   ├── 📄 ExpandableEventCard.tsx   # Card evento expandible
│   ├── 📄 FilterCard.tsx            # Card de filtro
│   ├── 📄 LanguageSelector.tsx      # Selector de lenguaje
│   ├── 📄 LeaderboardCard.tsx       # Card de leaderboard
│   ├── 📄 MapView.tsx               # Vista de mapa
│   ├── 📄 OutlinedInput.tsx         # Input con outline
│   ├── 📄 ProgressCircle.tsx        # Círculo de progreso
│   ├── 📄 RoundedInput.tsx          # Input redondeado
│   ├── 📄 TestResultsBottomSheet.tsx # Sheet resultados tests
│   ├── 📄 Themed.tsx                # Componentes con theme
│   ├── 📄 useClientOnlyValue.ts     # Hook client-only
│   ├── 📄 useColorScheme.ts         # Hook color scheme
│   │
│   └── 📂 skeletons/                # Loading skeletons
│       ├── 📄 EventCardSkeleton.tsx
│       ├── 📄 LeaderboardSkeleton.tsx
│       └── 📄 ProfileSkeleton.tsx
│
├── 📂 services/                     # API clients
│   ├── 📄 api.ts                    # Axios config base
│   ├── 📄 authService.ts            # Auth endpoints
│   ├── 📄 challengesService.ts      # Desafíos endpoints
│   ├── 📄 codeReviewService.ts      # Code review endpoints
│   ├── 📄 eventsService.ts          # Eventos endpoints
│   ├── 📄 gamificationService.ts    # Gamificación endpoints
│   └── 📄 newsService.ts            # Noticias endpoints
│
├── 📂 contexts/                     # React Context providers
│   └── 📄 AuthContext.tsx           # Autenticación global
│
├── 📂 hooks/                        # Custom hooks
│   ├── 📄 use-color-scheme.ts       # Hook theme
│   └── 📄 use-theme-color.ts        # Hook theme color
│
├── 📂 utils/                        # Utilidades
│   └── 📄 errorHandler.ts           # Error handling global
│
├── 📂 constants/                    # Constantes y configuración
│   ├── 📄 Colors.ts                 # Paleta de colores
│   ├── 📄 Config.ts                 # Configuración app
│   ├── 📄 designTokens.ts           # Design tokens
│   └── 📄 MockData.ts               # Datos mock (desarrollo)
│
├── 📂 assets/                       # Assets estáticos
│   ├── 📂 fonts/                    # Fuentes custom
│   │   └── 📄 SpaceMono-Regular.ttf
│   └── 📂 images/                   # Imágenes
│       ├── 📄 icon.png              # App icon
│       ├── 📄 splash.png            # Splash screen
│       └── 📄 adaptive-icon.png     # Android adaptive icon
│
├── 📂 android/                      # Configuración Android
│   ├── 📂 app/
│   │   ├── 📄 build.gradle
│   │   └── 📂 src/main/
│   └── 📄 build.gradle
│
├── 📄 app.json                      # Expo config
├── 📄 eas.json                      # EAS Build config
├── 📄 package.json                  # Dependencies
├── 📄 tsconfig.json                 # TypeScript config
├── 📄 tailwind.config.js            # NativeWind config
├── 📄 metro.config.cjs              # Metro bundler config
└── 📄 README.md                     # Este archivo
```

---

## 🧭 Navegación

DevPal usa **Expo Router** con navegación file-based.

### Estructura de Rutas

```
app/
├── (auth)/              → Stack: Auth flow
│   ├── login           → /login
│   └── register        → /register
│
├── (onboarding)/       → Stack: Onboarding
│   ├── welcome         → /welcome
│   ├── interests       → /interests
│   └── languages       → /languages
│
├── (tabs)/             → Tabs: Main app
│   ├── index           → / (Home)
│   ├── map             → /map
│   ├── saved           → /saved
│   └── profile         → /profile
│
├── event/[id]          → /event/123 (Dynamic)
├── settings/           → /settings/*
├── challenges          → /challenges
├── code-review         → /code-review
├── leaderboard         → /leaderboard
├── notifications       → /notifications
└── search              → /search
```

### Navegación Programática

```tsx
import { useRouter } from 'expo-router';

function MyComponent() {
  const router = useRouter();

  // Navegar a pantalla
  router.push('/challenges');

  // Navegar con parámetros
  router.push(`/event/${eventId}`);

  // Ir atrás
  router.back();

  // Replace (sin historial)
  router.replace('/login');
}
```

### Obtener Parámetros de Ruta

```tsx
import { useLocalSearchParams } from 'expo-router';

export default function EventDetail() {
  const { id } = useLocalSearchParams();

  // Usar id del evento
  const loadEvent = async () => {
    const event = await EventsService.getById(id as string);
  };
}
```

---

## 🧩 Componentes

### Componentes de Pantalla

#### **EventCard**

Card para mostrar evento en lista.

```tsx
<EventCard
  event={{
    id: '123',
    titulo: 'Hackathon AI',
    fecha_inicio: '2026-04-01',
    ubicacion: 'CDMX',
    categoria: 'Hackathon'
  }}
  onPress={() => router.push(`/event/${event.id}`)}
/>
```

**Props:**
- `event`: Objeto evento
- `onPress`: Callback al presionar
- `showSaveButton`: Mostrar botón guardar (default: true)

#### **BadgeCard**

Muestra un badge/logro del usuario.

```tsx
<BadgeCard
  badge={{
    nombre: 'Primer Paso',
    descripcion: 'Completaste tu primer desafío',
    icono: '🏁',
    desbloqueado: true,
    progreso: 1,
    objetivo: 1
  }}
/>
```

**Props:**
- `badge`: Objeto badge
- `small`: Tamaño pequeño (default: false)

#### **CodeEditor**

Editor de código con syntax highlighting.

```tsx
<CodeEditor
  value={codigo}
  onChange={setCodigo}
  language="python"
  placeholder="Escribe tu código aquí..."
  readOnly={false}
/>
```

**Props:**
- `value`: Código actual
- `onChange`: Callback al cambiar
- `language`: Lenguaje (python | javascript | java | etc)
- `placeholder`: Texto placeholder
- `readOnly`: Solo lectura

#### **MapView**

Mapa interactivo con eventos.

```tsx
<MapView
  events={eventos}
  onEventPress={(event) => router.push(`/event/${event.id}`)}
  initialRegion={{
    latitude: 19.4326,
    longitude: -99.1332,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5
  }}
/>
```

**Props:**
- `events`: Array de eventos con lat/lng
- `onEventPress`: Callback al presionar marcador
- `initialRegion`: Región inicial del mapa

#### **LeaderboardCard**

Card para mostrar usuario en leaderboard.

```tsx
<LeaderboardCard
  usuario={{
    ranking: 1,
    nombre: 'Ana García',
    xp_total: 5000,
    nivel: 5,
    avatar_url: '...'
  }}
  isCurrentUser={false}
/>
```

#### **TestResultsBottomSheet**

Bottom sheet con resultados de tests de código.

```tsx
<TestResultsBottomSheet
  visible={showResults}
  onClose={() => setShowResults(false)}
  resultados={{
    exito: true,
    casos_pasados: 5,
    casos_totales: 5,
    detalles: [...]
  }}
/>
```

### Componentes de UI

#### **ChubbyButton**

Botón estilizado principal.

```tsx
<ChubbyButton
  title="Ejecutar Código"
  onPress={ejecutar}
  variant="primary"  // primary | secondary | outline
  size="large"       // small | medium | large
  loading={false}
  disabled={false}
  icon={<Ionicons name="play" size={20} />}
/>
```

#### **RoundedInput**

Input de texto estilizado.

```tsx
<RoundedInput
  placeholder="Email"
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
  autoCapitalize="none"
  secureTextEntry={false}
  icon={<Ionicons name="mail-outline" size={20} />}
/>
```

#### **ProgressCircle**

Círculo de progreso animado.

```tsx
<ProgressCircle
  progress={0.75}      // 0-1
  size={100}
  strokeWidth={8}
  color="#22D3EE"
  backgroundColor="#1E293B"
  showPercentage={true}
/>
```

#### **AnimatedToggle**

Toggle switch animado.

```tsx
<AnimatedToggle
  value={enabled}
  onValueChange={setEnabled}
  activeColor="#22D3EE"
  inactiveColor="#64748B"
/>
```

---

## 🔌 Servicios

### **API Base Configuration** (`api.ts`)

```typescript
import axios from 'axios';
import { API_BASE_URL } from '@/constants/Config';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);

export default api;
```

### **AuthService** (`authService.ts`)

```typescript
export const AuthService = {
  // Login
  async login(email: string, password: string) {
    const response = await api.post('/auth/login', { email, password });
    return handleApiError(() => response.data);
  },

  // Register
  async register(userData: RegisterData) {
    const response = await api.post('/auth/register', userData);
    return handleApiError(() => response.data);
  },

  // Get profile
  async getProfile(userId: string) {
    const response = await api.get(`/auth/profile/${userId}`);
    return handleApiError(() => response.data);
  },

  // Update profile
  async updateProfile(userId: string, data: ProfileData) {
    const response = await api.put(`/auth/profile/${userId}`, data);
    return handleApiError(() => response.data);
  }
};
```

### **EventsService** (`eventsService.ts`)

```typescript
export const EventsService = {
  // Get all events
  async getAll(categoria?: string, limite = 50, skip = 0) {
    const params = new URLSearchParams();
    if (categoria) params.append('categoria', categoria);
    params.append('limite', limite.toString());
    params.append('skip', skip.toString());

    const response = await api.get(`/eventos/?${params}`);
    return handleApiError(() => ensureArray(response.data));
  },

  // Get event by ID
  async getById(eventoId: string) {
    const response = await api.get(`/eventos/${eventoId}`);
    return handleApiError(() => response.data);
  },

  // Save event
  async save(usuarioId: string, eventoId: string) {
    const response = await api.post('/eventos/guardar', {
      usuario_id: usuarioId,
      evento_id: eventoId
    });
    return handleApiError(() => response.data);
  },

  // Get saved events
  async getSaved(usuarioId: string) {
    const response = await api.get(`/eventos/guardados/${usuarioId}`);
    return handleApiError(() => ensureArray(response.data));
  }
};
```

### **ChallengesService** (`challengesService.ts`)

```typescript
export const ChallengesService = {
  // Get challenge of the day
  async getDailyChallenge(usuarioId: string) {
    const response = await api.get(`/desafios/del_dia?usuario_id=${usuarioId}`);
    return handleApiError(() => response.data);
  },

  // Execute code
  async executeCode(desafioId: string, usuarioId: string, codigo: string, lenguaje: string) {
    const response = await api.post(
      `/desafios/${desafioId}/ejecutar?usuario_id=${usuarioId}`,
      { codigo, lenguaje }
    );
    return handleApiError(() => response.data);
  },

  // Get history
  async getHistory(usuarioId: string, estado?: string) {
    const params = new URLSearchParams({ usuario_id: usuarioId });
    if (estado) params.append('estado', estado);

    const response = await api.get(`/desafios/historial?${params}`);
    return handleApiError(() => ensureArray(response.data));
  }
};
```

### **GamificationService** (`gamificationService.ts`)

```typescript
export const GamificationService = {
  // Get leaderboard
  async getLeaderboard(limite = 100, offset = 0, lenguaje?: string) {
    const params = new URLSearchParams();
    params.append('limite', limite.toString());
    params.append('offset', offset.toString());
    if (lenguaje) params.append('lenguaje', lenguaje);

    const response = await api.get(`/gamification/leaderboard?${params}`);
    return handleApiError(() => ({
      ...response.data,
      leaderboard: ensureArray(response.data.leaderboard)
    }));
  },

  // Get user badges
  async getUserBadges(usuarioId: string) {
    const response = await api.get(`/gamification/badges/${usuarioId}`);
    return handleApiError(() => ({
      desbloqueados: ensureArray(response.data.desbloqueados),
      proximos: ensureArray(response.data.proximos)
    }));
  }
};
```

---

## 🌐 Estado Global

### **AuthContext** (`AuthContext.tsx`)

Gestiona el estado de autenticación global.

```tsx
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

// En _layout.tsx
export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

// En cualquier componente
function MyComponent() {
  const {
    user,           // Usuario actual
    isLoading,      // Cargando auth
    isAuthenticated,// Autenticado?
    login,          // Función login
    logout,         // Función logout
    updateUser      // Actualizar usuario
  } = useAuth();

  if (isLoading) return <Splash />;

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return <View>...</View>;
}
```

**API del Context:**

```typescript
interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}
```

---

## 🛠️ Utilidades

### **Error Handler** (`errorHandler.ts`)

Manejo centralizado de errores.

```typescript
// Handle API errors
export function handleApiError<T>(fn: () => T): T {
  try {
    return fn();
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.detail || error.message;

      // Log error
      console.error(`API Error [${status}]:`, message);

      // Throw custom error
      throw new AppError(
        message,
        status === 401 ? ErrorCode.UNAUTHORIZED :
        status === 404 ? ErrorCode.NOT_FOUND :
        ErrorCode.SERVER_ERROR
      );
    }
    throw error;
  }
}

// Ensure array (safe default)
export function ensureArray<T>(value: any): T[] {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined) return [];
  return [value];
}

// Custom error class
export class AppError extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
    public originalError?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export enum ErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR'
}
```

**Uso:**

```typescript
// En servicios
async getEvents() {
  const response = await api.get('/eventos/');
  return handleApiError(() => ensureArray(response.data));
}

// En componentes
try {
  const events = await EventsService.getAll();
  setEvents(ensureArray(events));
} catch (error) {
  if (error instanceof AppError) {
    if (error.code === ErrorCode.UNAUTHORIZED) {
      router.push('/login');
    } else {
      Alert.alert('Error', error.message);
    }
  }
  setEvents([]); // Safe default
}
```

---

## ⚙️ Configuración

### **Config.ts**

```typescript
export const API_BASE_URL = 'http://TU_IP_LOCAL:8001';

export const APP_CONFIG = {
  name: 'DevPal',
  version: '1.0.0',
  defaultLanguage: 'python',
  maxFileSize: 5 * 1024 * 1024, // 5MB
  supportedLanguages: ['python', 'javascript', 'java', 'typescript', 'csharp']
};
```

**⚠️ IMPORTANTE:** Actualizar `API_BASE_URL` con tu IP local para testing.

```bash
# En Windows
ipconfig

# Buscar IPv4 de tu adaptador WiFi/Ethernet
# Ejemplo: 192.168.1.100

# Actualizar Config.ts
export const API_BASE_URL = 'http://192.168.1.100:8001';
```

### **Colors.ts**

```typescript
const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const GLASS = {
  bg: 'rgba(30, 41, 59, 0.7)',
  border: 'rgba(255, 255, 255, 0.1)',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  accent: '#22D3EE',
  inputBg: 'rgba(15, 23, 42, 0.6)',
};
```

---

## 📱 Build & Deploy

### Development

```bash
cd frontend

# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web
npm run web
```

### Production Build

#### **Android APK (Local)**

```bash
cd android
./gradlew assembleRelease

# APK en: android/app/build/outputs/apk/release/app-release.apk
```

#### **EAS Build (Cloud)**

```bash
# Login EAS
eas login

# Configure project
eas build:configure

# Build Android
eas build -p android --profile production

# Build iOS
eas build -p ios --profile production
```

**eas.json:**

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      },
      "ios": {
        "resourceClass": "m1-medium"
      }
    }
  }
}
```

### Submit to Stores

```bash
# Android Play Store
eas submit -p android

# iOS App Store
eas submit -p ios
```

---

## 🧪 Testing

```bash
# Run tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

---

## 🎨 Styling

### NativeWind (Tailwind CSS)

```tsx
import { View, Text } from 'react-native';

function MyComponent() {
  return (
    <View className="flex-1 bg-slate-900 p-4">
      <Text className="text-white text-2xl font-bold">
        Hello DevPal!
      </Text>
    </View>
  );
}
```

### StyleSheet (Traditional)

```tsx
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 16
  },
  title: {
    color: '#F8FAFC',
    fontSize: 24,
    fontWeight: 'bold'
  }
});
```

---

## 🔒 Seguridad

### Secure Storage

```typescript
import * as SecureStore from 'expo-secure-store';

// Guardar token
await SecureStore.setItemAsync('userToken', token);

// Obtener token
const token = await SecureStore.getItemAsync('userToken');

// Eliminar token
await SecureStore.deleteItemAsync('userToken');
```

### Best Practices

✅ Nunca hardcodear API keys  
✅ Usar HTTPS en producción  
✅ Validar inputs del usuario  
✅ Sanitizar datos antes de renderizar  
✅ Implementar rate limiting en requests  
✅ Usar SecureStore para datos sensibles  

---

## 📚 Recursos

- [Expo Docs](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [Expo Router Docs](https://docs.expo.dev/router/introduction/)
- [NativeWind Docs](https://www.nativewind.dev/)

---

<div align="center">

**Frontend desarrollado con ❤️ para DevPal**

[Volver al README principal](../README.md)

</div>
