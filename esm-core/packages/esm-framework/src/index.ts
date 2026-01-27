/**
 * ZS Health ESM Framework
 * Main entry point that re-exports all framework packages
 * 
 * Import from this package to get all framework utilities:
 * 
 * import { 
 *   getConfig, 
 *   api, 
 *   useAuthStore, 
 *   Button, 
 *   useApi 
 * } from '@zs-health/esm-framework';
 */

// ============================================
// Configuration
// ============================================
export {
    type AppConfig,
    type Config,
    type FeatureFlags,
    type LoggingConfig,
    initConfig,
    getConfig,
    getApiUrl,
    getFhirUrl,
    isFeatureEnabled,
    isProduction,
    isDevelopment,
} from '@zs-health/esm-config';

// ============================================
// API Client
// ============================================
export {
    type ApiResponse,
    type PaginationMeta,
    type PaginatedResponse,
    type RequestOptions,
    ApiError,
    api,
    get,
    post,
    put,
    patch,
    del,
    setAccessToken,
    getAccessToken,
} from '@zs-health/esm-api';

// ============================================
// State Management
// ============================================
export {
    // Auth
    type User,
    type AuthState,
    type AuthActions,
    type AuthStore,
    useAuthStore,

    // Notifications
    type NotificationType,
    type Notification,
    type NotificationState,
    type NotificationActions,
    type NotificationStore,
    useNotificationStore,

    // UI
    type UIState,
    type UIActions,
    type UIStore,
    useUIStore,

    // Convenience hooks
    useUser,
    useIsAuthenticated,
    useTheme,
    useLocale,
} from '@zs-health/esm-state';

// ============================================
// Styleguide (Carbon Components)
// ============================================
export * from '@zs-health/esm-styleguide';

// ============================================
// React Utilities
// ============================================
export {
    type UseApiOptions,
    type UseApiResult,
    useApi,
    useAuth,
    useDebounce,
    usePrevious,
    useToggle,
    useLocalStorage,
    useMediaQuery,
    useWindowSize,
    useClickOutside,
    useInterval,
    useDocumentTitle,
} from '@zs-health/esm-react-utils';

// ============================================
// Navigation
// ============================================
export {
    // React Router re-exports
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    useNavigate,
    useLocation,
    useParams,
    useSearchParams,
    Outlet,
    Link,
    NavLink,

    // Route types
    type RouteConfig,

    // Protected routes
    ProtectedRoute,
    PublicRoute,

    // Navigation hooks
    useConfirmNavigation,
    useNavigateBack,
    useQueryParams,
    useUpdateQueryParams,

    // Route registry
    registerRoute,
    getRegisteredRoutes,
    getNavigationItems,

    // Breadcrumbs
    type BreadcrumbItem,
    useBreadcrumbs,
} from '@zs-health/esm-navigation';

// ============================================
// Error Handling
// ============================================
export {
    ErrorBoundary,
    DefaultErrorFallback,
    reportError,
    AppError,
    isAppError,
    getErrorMessage,
    tryCatch,
} from '@zs-health/esm-error-handling';

// ============================================
// Translations (i18n)
// ============================================
export {
    SUPPORTED_LANGUAGES,
    type SupportedLanguage,
    initI18n,
    getCurrentLanguage,
    changeLanguage,
    getLanguageInfo,
    isRTL,
    addTranslations,
    useTranslation,
    Trans,
    i18n,
} from '@zs-health/esm-translations';

// ============================================
// Extensions
// ============================================
export {
    type ExtensionDefinition,
    type ExtensionSlotProps,
    registerExtension,
    unregisterExtension,
    getExtensionsForSlot,
    getExtension,
    getAllSlots,
    ExtensionSlot,
    loadModule,
    isModuleLoaded,
    getLoadedModules,
    useExtensions,
    useHasExtensions,
    SLOTS,
    type SlotName,
} from '@zs-health/esm-extensions';

// ============================================
// Framework Version
// ============================================
export const FRAMEWORK_VERSION = '1.0.0';
