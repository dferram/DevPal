# DevPal Frontend Client Application

## 1. Overview

The DevPal frontend client is a cross-platform mobile and web application built using React Native and Expo SDK 52. The application provides software engineers with an integrated development companion interface for solving daily coding challenges, discovering technical events, tracking career achievements, and consuming developer news.

---

## 2. Technical Stack

- **Framework:** React Native 0.83.2 / Expo SDK 52
- **Language:** TypeScript 5.3+
- **Navigation:** Expo Router v4 (File-based routing)
- **Styling:** NativeWind (Tailwind CSS v3 compiler for React Native)
- **State Management:** React Context API + Custom Hooks
- **Secure Persistence:** Expo SecureStore (iOS Keychain / Android KeyStore)
- **Web Persistence:** AsyncStorage
- **HTTP Client:** Axios 1.7+ with centralized interceptors
- **Device Capabilities:** Expo Haptics, Expo Location, React Native Maps

---

## 3. Directory Layout

```
frontend/
|-- app/                            # Expo Router routing directory
|   |-- (auth)/                     # Authentication routes (Login, Register, Welcome)
|   |-- (onboarding)/               # Onboarding questionnaires (Languages, Interests)
|   |-- (tabs)/                     # Tab navigation root
|   |   |-- index.tsx               # Main developer dashboard and feed
|   |   |-- map.tsx                 # Tech event map exploration
|   |   |-- saved.tsx               # Bookmarked events and challenges
|   |   `-- profile/                # User profile and stats management
|   |-- challenges.tsx              # Interactive code editor and execution console
|   |-- code-review.tsx             # AI-driven code review interface
|   |-- leaderboard.tsx             # Competitive developer ranking board
|   |-- notifications.tsx           # Activity notification center
|   `-- _layout.tsx                 # Root application wrapper and providers
|-- assets/                         # Static fonts, icons, and vector illustrations
|-- components/                     # Reusable UI component library
|   |-- CodeEditor.tsx              # Syntax-highlighted code editing component
|   |-- AIReviewBottomSheet.tsx     # Bottom sheet modal for code feedback
|   |-- BentoCard.tsx               # Bento-grid dashboard container
|   |-- BadgeCard.tsx               # Gamification badge visualizer
|   |-- EventCard.tsx               # Standardized event preview item
|   `-- skeletons/                  # Loading skeleton placeholders
|-- constants/                      # Application constants and design tokens
|   |-- Colors.ts                   # Light and dark color palettes
|   |-- Config.ts                   # API base URLs and endpoint map
|   `-- designTokens.ts             # Spacing, typography, and elevation tokens
|-- contexts/                       # Application state context providers
|   `-- AuthContext.tsx             # Session state and authorization lifecycle
|-- hooks/                          # Custom reusable React hooks
|-- services/                       # Remote API integration services
|   |-- api.ts                      # Axios instance with request/response interceptors
|   |-- authService.ts              # Authentication API operations
|   |-- challengesService.ts        # Coding challenges API operations
|   |-- eventsService.ts            # Tech events API operations
|   `-- gamificationService.ts      # Leaderboard and badge API operations
|-- utils/                          # Cross-platform utility functions
|   |-- AuthStorage.ts              # Platform-aware secure token storage
|   |-- HapticManager.ts            # Tactile feedback coordinator
|   `-- errorHandler.ts             # API error normalization
|-- app.json                        # Expo configuration manifest
|-- eas.json                        # Expo Application Services build profiles
|-- package.json                    # JavaScript dependencies manifest
|-- tailwind.config.js              # Tailwind styling configuration
`-- tsconfig.json                   # TypeScript compiler configuration
```

---

## 4. Environment Configuration

Create a `.env` file in the `frontend/` directory to configure the target backend endpoint:

```ini
# For Localhost / Web execution:
EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:8001

# For Android Emulator (maps to host localhost):
# EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:8001

# For Physical Mobile Devices (use your workstation LAN IP):
# EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:8001
```

---

## 5. Development & Execution

### 5.1. Install Dependencies

```bash
cd frontend
npm install
```

### 5.2. Start Metro Development Server

```bash
# Start Expo development server
npx expo start

# Start directly on web browser:
npx expo start --web

# Start directly on Android emulator or connected device:
npx expo start --android

# Start directly on iOS simulator (macOS required):
npx expo start --ios
```

---

## 6. Build and Distribution

Production builds are configured via EAS Build (`eas.json`):

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Build Android production bundle (AAB)
eas build --platform android --profile production

# Build iOS production archive (IPA)
eas build --platform ios --profile production
```

---

## 7. Code Quality and Linting

```bash
# Execute TypeScript type validation
npx tsc --noEmit

# Execute ESLint static code analysis
npm run lint
```
