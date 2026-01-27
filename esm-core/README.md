# ESM Core

> **ZS Health** Framework & Foundation Monorepo

The core framework powering the ZS Health platform - an enterprise-grade Health Information System (HIS), Electronic Medical Records (EMR), and Electronic Health Records (EHR) platform.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build all packages
pnpm build

# Run linting
pnpm lint

# Type checking
pnpm typecheck
```

## 📦 Structure

```
esm-core/
├── apps/                    # Applications
│   ├── shell/               # Main application shell
│   ├── esm-login-app/       # Authentication UI
│   ├── esm-primary-navigation-app/  # Navigation
│   └── esm-home-app/        # Dashboard
│
├── packages/                # Framework packages
│   ├── esm-framework/       # Main entry point
│   ├── esm-api/             # REST API client
│   ├── esm-config/          # Configuration system
│   ├── esm-state/           # Zustand state management
│   ├── esm-styleguide/      # Carbon Design components
│   ├── esm-react-utils/     # React hooks
│   ├── esm-navigation/      # Routing utilities
│   ├── esm-error-handling/  # Error boundaries
│   ├── esm-translations/    # i18n support
│   └── esm-extensions/      # Extension system
│
└── configs/                 # Shared configurations
    ├── typescript-config/
    └── eslint-config/
```

## 🛠 Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.x | UI Framework |
| **TypeScript** | 5.x | Type Safety |
| **Vite** | 6.x | Build Tool |
| **Turbo** | 2.x | Monorepo Task Runner |
| **pnpm** | 9.x | Package Manager |
| **Carbon Design** | 11.x | UI Components |
| **Zustand** | 5.x | State Management |
| **React Router** | 7.x | Routing |
| **i18next** | 24.x | Internationalization |

## 📚 Framework Packages

### `@zs-health/esm-framework`

Main entry point that re-exports all packages:

```tsx
import {
  // Configuration
  initConfig, getConfig, isProduction,
  
  // API
  api, get, post, ApiError,
  
  // State
  useAuthStore, useNotificationStore, useUser,
  
  // UI Components (Carbon)
  Button, TextInput, DataTable, Modal,
  
  // Hooks
  useApi, useAuth, useDebounce, useLocalStorage,
  
  // Navigation
  BrowserRouter, ProtectedRoute, useNavigate,
  
  // Error Handling
  ErrorBoundary, reportError,
  
  // i18n
  useTranslation, changeLanguage,
  
  // Extensions
  ExtensionSlot, registerExtension,
} from '@zs-health/esm-framework';
```

### Individual Packages

- **`@zs-health/esm-config`** - Environment-based configuration
- **`@zs-health/esm-api`** - REST API client with auth handling
- **`@zs-health/esm-state`** - Zustand stores (auth, notifications, UI)
- **`@zs-health/esm-styleguide`** - Carbon Design + custom theme
- **`@zs-health/esm-react-utils`** - Custom React hooks
- **`@zs-health/esm-navigation`** - Route guards & navigation
- **`@zs-health/esm-error-handling`** - Error boundaries
- **`@zs-health/esm-translations`** - i18n with English & Bengali
- **`@zs-health/esm-extensions`** - Plugin/extension system

## 🎨 Theming

Uses IBM Carbon Design System with ZS Health customizations:

```css
:root {
  --zs-color-primary: #0f62fe;
  --zs-color-success: #24a148;
  --zs-color-warning: #f1c21b;
  --zs-color-danger: #da1e28;
}
```

## 🌐 i18n Support

Built-in support for:
- 🇬🇧 English (en)
- 🇧🇩 Bengali (bn)
- 🇲🇲 Burmese (my)
- 🇹🇭 Thai (th)
- 🇮🇳 Hindi (hi)
- 🇵🇰 Urdu (ur)
- 🇸🇦 Arabic (ar) - RTL
- 🇫🇷 French (fr)
- 🇪🇸 Spanish (es)

## 🔌 Extension System

Register extensions for dynamic module loading:

```tsx
import { registerExtension, ExtensionSlot, SLOTS } from '@zs-health/esm-framework';

// Register extension
registerExtension({
  id: 'my-widget',
  slot: SLOTS.DASHBOARD_WIDGETS,
  load: () => import('./MyWidget'),
});

// Render extensions
<ExtensionSlot name={SLOTS.DASHBOARD_WIDGETS} />
```

## 📝 Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build all packages |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | TypeScript type checking |
| `pnpm clean` | Clean build artifacts |
| `pnpm format` | Format code with Prettier |

## 🏗 Development

### Adding a new package

1. Create directory in `packages/`
2. Add `package.json` with workspace dependencies
3. Add `tsconfig.json` extending shared config
4. Add to root `turbo.json` if needed

### Environment Variables

Create `.env.local` in `apps/shell/`:

```env
VITE_API_URL=http://localhost:8080/api/v1
VITE_FHIR_URL=http://localhost:8080/fhir
VITE_AUTH_URL=http://localhost:8080/auth
```

## 📄 License

© 2026 ZS Health. All rights reserved.
