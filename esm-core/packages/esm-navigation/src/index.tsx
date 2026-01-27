/**
 * Routing and navigation utilities for ZS Health
 * Route guards, protected routes, and navigation helpers
 */

import { ReactNode } from 'react';
import {
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
    Location,
} from 'react-router-dom';
import { useAuthStore } from '@zs-health/esm-state';

// Re-export React Router primitives
export {
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
};

// ============================================
// Route Types
// ============================================

export interface RouteConfig {
    path: string;
    element: ReactNode;
    /** Route requires authentication */
    protected?: boolean;
    /** Required roles for this route */
    roles?: string[];
    /** Child routes */
    children?: RouteConfig[];
    /** Route metadata */
    meta?: {
        title?: string;
        icon?: string;
        showInNav?: boolean;
    };
}

// ============================================
// Protected Route Component
// ============================================

interface ProtectedRouteProps {
    children: ReactNode;
    roles?: string[];
    redirectTo?: string;
}

/**
 * Protected route wrapper that redirects unauthenticated users
 */
export function ProtectedRoute({
    children,
    roles = [],
    redirectTo = '/login',
}: ProtectedRouteProps) {
    const { isAuthenticated, user, isLoading } = useAuthStore();
    const location = useLocation();

    if (isLoading) {
        return null;
    }

    if (!isAuthenticated) {
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    if (roles.length > 0 && user) {
        const hasRequiredRole = roles.some((role) => (user.roles as string[]).includes(role));
        if (!hasRequiredRole) {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    return <>{children}</>;
}

// ============================================
// Public Route Component
// ============================================

interface PublicRouteProps {
    children: ReactNode;
    redirectTo?: string;
}

/**
 * Public route that redirects authenticated users away
 */
export function PublicRoute({
    children,
    redirectTo = '/',
}: PublicRouteProps) {
    const { isAuthenticated, isLoading } = useAuthStore();
    const location = useLocation();

    if (isLoading) {
        return null;
    }

    if (isAuthenticated) {
        const from = (location.state as { from?: Location })?.from?.pathname || redirectTo;
        return <Navigate to={from} replace />;
    }

    return <>{children}</>;
}

// ============================================
// Navigation Hooks
// ============================================

/**
 * Navigate with confirmation
 */
export function useConfirmNavigation(
    message: string = 'You have unsaved changes. Are you sure you want to leave?'
) {
    const navigate = useNavigate();

    const confirmNavigate = (to: string) => {
        if (window.confirm(message)) {
            navigate(to);
        }
    };

    return confirmNavigate;
}

/**
 * Navigate back or to fallback
 */
export function useNavigateBack(fallback: string = '/') {
    const navigate = useNavigate();

    const goBack = () => {
        if (window.history.length > 2) {
            navigate(-1);
        } else {
            navigate(fallback);
        }
    };

    return goBack;
}

/**
 * Get query params as object
 */
export function useQueryParams<T extends Record<string, string>>(): T {
    const [searchParams] = useSearchParams();
    const params: Record<string, string> = {};

    searchParams.forEach((value, key) => {
        params[key] = value;
    });

    return params as T;
}

/**
 * Update query params
 */
export function useUpdateQueryParams() {
    const [searchParams, setSearchParams] = useSearchParams();

    const updateParams = (updates: Record<string, string | null>) => {
        const newParams = new URLSearchParams(searchParams);

        Object.entries(updates).forEach(([key, value]) => {
            if (value === null) {
                newParams.delete(key);
            } else {
                newParams.set(key, value);
            }
        });

        setSearchParams(newParams);
    };

    return updateParams;
}

// ============================================
// Route Registry
// ============================================

const routeRegistry = new Map<string, RouteConfig>();

/**
 * Register a route
 */
export function registerRoute(route: RouteConfig): void {
    routeRegistry.set(route.path, route);
}

/**
 * Get all registered routes
 */
export function getRegisteredRoutes(): RouteConfig[] {
    return Array.from(routeRegistry.values());
}

/**
 * Get navigation items (routes marked for nav display)
 */
export function getNavigationItems(): RouteConfig[] {
    return getRegisteredRoutes().filter((route) => route.meta?.showInNav);
}

// ============================================
// Breadcrumb Hook
// ============================================

export interface BreadcrumbItem {
    label: string;
    path: string;
    current?: boolean;
}

/**
 * Generate breadcrumbs from current location
 */
export function useBreadcrumbs(): BreadcrumbItem[] {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter(Boolean);

    return pathnames.map((segment, index) => {
        const path = `/${pathnames.slice(0, index + 1).join('/')}`;
        const route = routeRegistry.get(path);

        return {
            label: route?.meta?.title || segment.charAt(0).toUpperCase() + segment.slice(1),
            path,
            current: index === pathnames.length - 1,
        };
    });
}
