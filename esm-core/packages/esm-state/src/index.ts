/**
 * Zustand state management for ZS Health applications
 * Provides global stores for auth, user, and notifications
 */

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

// ============================================
// Auth Store
// ============================================

export interface User {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    facilityId?: string;
    avatar?: string;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    accessToken: string | null;
    refreshToken: string | null;
}

export interface AuthActions {
    login: (user: User, accessToken: string, refreshToken?: string) => void;
    logout: () => void;
    setLoading: (isLoading: boolean) => void;
    updateUser: (user: Partial<User>) => void;
    setTokens: (accessToken: string, refreshToken?: string) => void;
}

export type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
    devtools(
        persist(
            (set) => ({
                // State
                user: null,
                isAuthenticated: false,
                isLoading: false,
                accessToken: null,
                refreshToken: null,

                // Actions
                login: (user, accessToken, refreshToken) =>
                    set({
                        user,
                        isAuthenticated: true,
                        isLoading: false,
                        accessToken,
                        refreshToken: refreshToken || null,
                    }),

                logout: () =>
                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                        accessToken: null,
                        refreshToken: null,
                    }),

                setLoading: (isLoading) => set({ isLoading }),

                updateUser: (userData) =>
                    set((state) => ({
                        user: state.user ? { ...state.user, ...userData } : null,
                    })),

                setTokens: (accessToken, refreshToken) =>
                    set({
                        accessToken,
                        refreshToken: refreshToken || null,
                    }),
            }),
            {
                name: 'zs-health-auth',
                partialize: (state) => ({
                    user: state.user,
                    accessToken: state.accessToken,
                    refreshToken: state.refreshToken,
                }),
            }
        ),
        { name: 'AuthStore' }
    )
);

// ============================================
// Notification Store
// ============================================

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message?: string;
    duration?: number;
    dismissible?: boolean;
}

export interface NotificationState {
    notifications: Notification[];
}

export interface NotificationActions {
    addNotification: (notification: Omit<Notification, 'id'>) => string;
    removeNotification: (id: string) => void;
    clearNotifications: () => void;
}

export type NotificationStore = NotificationState & NotificationActions;

let notificationId = 0;

export const useNotificationStore = create<NotificationStore>()(
    devtools(
        (set) => ({
            notifications: [],

            addNotification: (notification) => {
                const id = `notification-${++notificationId}`;
                const newNotification: Notification = {
                    id,
                    dismissible: true,
                    duration: 5000,
                    ...notification,
                };

                set((state) => ({
                    notifications: [...state.notifications, newNotification],
                }));

                // Auto-remove after duration
                if (newNotification.duration && newNotification.duration > 0) {
                    setTimeout(() => {
                        set((state) => ({
                            notifications: state.notifications.filter((n) => n.id !== id),
                        }));
                    }, newNotification.duration);
                }

                return id;
            },

            removeNotification: (id) =>
                set((state) => ({
                    notifications: state.notifications.filter((n) => n.id !== id),
                })),

            clearNotifications: () => set({ notifications: [] }),
        }),
        { name: 'NotificationStore' }
    )
);

// ============================================
// UI Store
// ============================================

export interface UIState {
    sidebarOpen: boolean;
    theme: 'light' | 'dark' | 'system';
    locale: string;
}

export interface UIActions {
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
    setTheme: (theme: UIState['theme']) => void;
    setLocale: (locale: string) => void;
}

export type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>()(
    devtools(
        persist(
            (set) => ({
                sidebarOpen: true,
                theme: 'system',
                locale: 'en',

                toggleSidebar: () =>
                    set((state) => ({ sidebarOpen: !state.sidebarOpen })),

                setSidebarOpen: (open) => set({ sidebarOpen: open }),

                setTheme: (theme) => set({ theme }),

                setLocale: (locale) => set({ locale }),
            }),
            {
                name: 'zs-health-ui',
            }
        ),
        { name: 'UIStore' }
    )
);

// ============================================
// Convenience hooks
// ============================================

/** Get current user or null */
export const useUser = () => useAuthStore((state) => state.user);

/** Check if user is authenticated */
export const useIsAuthenticated = () =>
    useAuthStore((state) => state.isAuthenticated);

/** Get current theme */
export const useTheme = () => useUIStore((state) => state.theme);

/** Get current locale */
export const useLocale = () => useUIStore((state) => state.locale);
