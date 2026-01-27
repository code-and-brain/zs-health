/**
 * Configuration system for ZS Health applications
 * Provides environment-based configuration with type safety
 */

export interface AppConfig {
    /** Application name */
    appName: string;
    /** API base URL */
    apiBaseUrl: string;
    /** FHIR server URL */
    fhirBaseUrl: string;
    /** Authentication endpoint */
    authUrl: string;
    /** Current Auth Provider */
    authProvider: 'supabase' | 'keycloak' | 'firebase' | 'local';
    /** Supabase URL */
    supabaseUrl: string;
    /** Supabase Anon Key */
    supabaseAnonKey: string;
    /** Keycloak Config */
    keycloak?: {
        url: string;
        realm: string;
        clientId: string;
    };
    /** Firebase Config */
    firebase?: {
        apiKey: string;
        authDomain: string;
        projectId: string;
    };
    /** Current environment */
    environment: 'development' | 'staging' | 'production';
    /** Feature flags */
    features: FeatureFlags;
    /** Logging configuration */
    logging: LoggingConfig;
}

export interface FeatureFlags {
    enableAnalytics: boolean;
    enableTelemedicine: boolean;
    enableOfflineMode: boolean;
    enableBiometrics: boolean;
}

export interface LoggingConfig {
    level: 'debug' | 'info' | 'warn' | 'error';
    enableConsole: boolean;
    enableRemote: boolean;
    remoteEndpoint?: string;
}

const defaultConfig: AppConfig = {
    appName: 'ZS Health',
    apiBaseUrl: 'http://localhost:8080/api/v1',
    fhirBaseUrl: 'http://localhost:8080/fhir',
    authUrl: 'http://localhost:8080/auth',
    authProvider: 'supabase',
    supabaseUrl: 'https://twofvzzietlvfhjsjtnv.supabase.co',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3b2Z2enppZXRsdmZoanNqdG52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MjE5OTIsImV4cCI6MjA4NTA5Nzk5Mn0.Q9E_GImvHfqO8x-Ge3HNhLOu92N3hKUCMnsLtFPVhrs',
    environment: 'development',
    features: {
        enableAnalytics: false,
        enableTelemedicine: false,
        enableOfflineMode: false,
        enableBiometrics: false,
    },
    logging: {
        level: 'debug',
        enableConsole: true,
        enableRemote: false,
    },
};

let currentConfig: AppConfig = { ...defaultConfig };

/**
 * Initialize application configuration
 */
export function initConfig(overrides: Partial<AppConfig> = {}): AppConfig {
    currentConfig = {
        ...defaultConfig,
        ...overrides,
        features: {
            ...defaultConfig.features,
            ...overrides.features,
        },
        logging: {
            ...defaultConfig.logging,
            ...overrides.logging,
        },
    };
    return currentConfig;
}

/**
 * Get current configuration
 */
export function getConfig(): AppConfig {
    return currentConfig;
}

/**
 * Get API base URL
 */
export function getApiUrl(path: string = ''): string {
    const base = currentConfig.apiBaseUrl.replace(/\/$/, '');
    const cleanPath = path.replace(/^\//, '');
    return cleanPath ? `${base}/${cleanPath}` : base;
}

/**
 * Get FHIR base URL
 */
export function getFhirUrl(resourceType: string = ''): string {
    const base = currentConfig.fhirBaseUrl.replace(/\/$/, '');
    return resourceType ? `${base}/${resourceType}` : base;
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
    return currentConfig.features[feature];
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
    return currentConfig.environment === 'production';
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
    return currentConfig.environment === 'development';
}

export type { AppConfig as Config };
