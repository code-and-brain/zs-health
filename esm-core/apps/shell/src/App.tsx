import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    ProtectedRoute,
    PublicRoute,
    ErrorBoundary,
    useUIStore,
} from '@zs-health/esm-framework';
import { LoginPage } from '@zs-health/esm-login-app';
import { PrimaryNavigation } from '@zs-health/esm-primary-navigation-app';
import { HomePage } from '@zs-health/esm-home-app';

/**
 * Main App Component
 */
export default function App() {
    return (
        <ErrorBoundary>
            <BrowserRouter>
                <div className="zs-app">
                    <AppRoutes />
                </div>
            </BrowserRouter>
        </ErrorBoundary>
    );
}

/**
 * Application Routes
 */
function AppRoutes() {

    return (
        <Routes>
            {/* Public routes */}
            <Route
                path="/login"
                element={
                    <PublicRoute redirectTo="/">
                        <LoginPage />
                    </PublicRoute>
                }
            />

            {/* Protected routes with layout */}
            <Route
                path="/*"
                element={
                    <ProtectedRoute>
                        <AuthenticatedLayout />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}

/**
 * Layout for authenticated users
 */
function AuthenticatedLayout() {
    const sidebarOpen = useUIStore((state) => state.sidebarOpen);

    return (
        <>
            <PrimaryNavigation />
            <div className="zs-app-layout">
                <main
                    className={`zs-main-content ${sidebarOpen
                        ? 'zs-main-content--with-sidebar'
                        : 'zs-main-content--sidebar-collapsed'
                        }`}
                >
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/dashboard" element={<HomePage />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>
            </div>
        </>
    );
}
