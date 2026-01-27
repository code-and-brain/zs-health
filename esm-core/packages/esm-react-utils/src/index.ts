/**
 * React hooks and utilities for ZS Health
 * Custom hooks for common patterns
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { api, supabase } from '@zs-health/esm-api';
import { useAuthStore, useNotificationStore } from '@zs-health/esm-state';

// ============================================
// Data Fetching Hooks
// ============================================

export interface UseApiOptions<T> {
    /** Initial data value */
    initialData?: T;
    /** Skip initial fetch */
    skip?: boolean;
    /** Refetch on window focus */
    refetchOnFocus?: boolean;
    /** Dependencies to trigger refetch */
    deps?: unknown[];
}

export interface UseApiResult<T> {
    data: T | undefined;
    error: Error | null;
    isLoading: boolean;
    isError: boolean;
    refetch: () => Promise<void>;
}

/**
 * Hook for fetching data from API
 */
export function useApi<T>(
    path: string,
    options: UseApiOptions<T> = {}
): UseApiResult<T> {
    const { initialData, skip = false, refetchOnFocus = false, deps = [] } = options;
    const [data, setData] = useState<T | undefined>(initialData);
    const [error, setError] = useState<Error | null>(null);
    const [isLoading, setIsLoading] = useState(!skip);

    const fetchData = useCallback(async () => {
        if (skip) return;

        setIsLoading(true);
        setError(null);

        try {
            const result = await api.get<T>(path);
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setIsLoading(false);
        }
    }, [path, skip]);

    useEffect(() => {
        fetchData();
    }, [fetchData, ...deps]);

    // Refetch on window focus
    useEffect(() => {
        if (!refetchOnFocus) return;

        const handleFocus = () => fetchData();
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [refetchOnFocus, fetchData]);

    return {
        data,
        error,
        isLoading,
        isError: error !== null,
        refetch: fetchData,
    };
}

// ============================================
// Auth Hooks
// ============================================

/**
 * Hook for authentication actions
 */
export function useAuth() {
    const { user, isAuthenticated, login, logout, setLoading } = useAuthStore();
    const { addNotification } = useNotificationStore();

    // Sync Supabase session with Store
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any, session: any) => {
            if (event === 'SIGNED_IN' && session) {
                const userData = session.user;
                const mappedUser = {
                    id: userData.id,
                    username: userData.email?.split('@')[0] || 'user',
                    email: userData.email || '',
                    firstName: userData.user_metadata?.first_name || 'ZS',
                    lastName: userData.user_metadata?.last_name || 'User',
                    roles: userData.user_metadata?.roles || ['practitioner'],
                };
                login(mappedUser, session.access_token, session.refresh_token);
                api.setAccessToken(session.access_token);
            } else if (event === 'SIGNED_OUT') {
                logout();
                api.setAccessToken(null);
            }
        });

        return () => subscription.unsubscribe();
    }, [login, logout]);

    const handleLogin = useCallback(
        async (email: string, password: string) => {
            setLoading(true);
            try {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) throw error;

                if (data.user && data.session) {
                    addNotification({
                        type: 'success',
                        title: 'Login successful',
                        message: `Welcome back!`,
                    });
                    return true;
                }
                return false;
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Login failed';
                addNotification({
                    type: 'error',
                    title: 'Login failed',
                    message,
                });
                return false;
            } finally {
                setLoading(false);
            }
        },
        [setLoading, addNotification]
    );

    const handleLogout = useCallback(async () => {
        await supabase.auth.signOut();
        addNotification({
            type: 'info',
            title: 'Logged out',
            message: 'You have been logged out successfully.',
        });
    }, [addNotification]);

    return {
        user,
        isAuthenticated,
        login: handleLogin,
        logout: handleLogout,
    };
}

// ============================================
// Utility Hooks
// ============================================

/**
 * Debounce a value
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}

/**
 * Track previous value
 */
export function usePrevious<T>(value: T): T | undefined {
    const ref = useRef<T>(null);

    useEffect(() => {
        ref.current = value;
    }, [value]);

    return ref.current ?? undefined;
}

/**
 * Boolean toggle state
 */
export function useToggle(initialValue = false): [boolean, () => void] {
    const [value, setValue] = useState(initialValue);
    const toggle = useCallback(() => setValue((v) => !v), []);
    return [value, toggle];
}

/**
 * Local storage state
 */
export function useLocalStorage<T>(
    key: string,
    initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch {
            return initialValue;
        }
    });

    const setValue = useCallback(
        (value: T | ((prev: T) => T)) => {
            setStoredValue((prev) => {
                const valueToStore = value instanceof Function ? value(prev) : value;
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
                return valueToStore;
            });
        },
        [key]
    );

    return [storedValue, setValue];
}

/**
 * Media query hook
 */
export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(() => {
        if (typeof window === 'undefined') return false;
        return window.matchMedia(query).matches;
    });

    useEffect(() => {
        const mediaQuery = window.matchMedia(query);
        const handler = (event: MediaQueryListEvent) => setMatches(event.matches);

        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, [query]);

    return matches;
}

/**
 * Window size hook
 */
export function useWindowSize() {
    const [size, setSize] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 0,
        height: typeof window !== 'undefined' ? window.innerHeight : 0,
    });

    useEffect(() => {
        const handleResize = () => {
            setSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return size;
}

/**
 * Click outside hook
 */
export function useClickOutside<T extends HTMLElement>(
    callback: () => void
): React.RefObject<T | null> {
    const ref = useRef<T>(null);

    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                callback();
            }
        };

        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [callback]);

    return ref;
}

/**
 * Interval hook
 */
export function useInterval(callback: () => void, delay: number | null): void {
    const savedCallback = useRef<() => void>(null);

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        if (delay === null) return;

        const tick = () => {
            if (savedCallback.current) {
                savedCallback.current();
            }
        };
        const id = setInterval(tick, delay);
        return () => clearInterval(id);
    }, [delay]);
}

/**
 * Document title hook
 */
export function useDocumentTitle(title: string): void {
    useEffect(() => {
        const previousTitle = document.title;
        document.title = `${title} | ZS Health`;
        return () => {
            document.title = previousTitle;
        };
    }, [title]);
}
