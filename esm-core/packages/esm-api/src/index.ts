/**
 * API client utilities for ZS Health applications
 * Provides REST API client with interceptors, error handling, and auth
 */

import { getApiUrl, getConfig } from '@zs-health/esm-config';
import { createClient } from '@supabase/supabase-js';

/** API response wrapper */
export interface ApiResponse<T> {
    status: 'success' | 'error';
    data?: T;
    error?: string;
    message?: string;
}

/** Pagination metadata */
export interface PaginationMeta {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

/** Paginated response */
export interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationMeta;
}

/** Request options */
export interface RequestOptions {
    headers?: Record<string, string>;
    signal?: AbortSignal;
    timeout?: number;
}

/** API error class */
export class ApiError extends Error {
    constructor(
        message: string,
        public status: number,
        public code?: string
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

// Token storage
let accessToken: string | null = null;

/**
 * Set the access token for API requests
 */
export function setAccessToken(token: string | null): void {
    accessToken = token;
}

/**
 * Get the current access token
 */
export function getAccessToken(): string | null {
    return accessToken;
}

/**
 * Build headers for API requests
 */
function buildHeaders(customHeaders?: Record<string, string>): Headers {
    const headers = new Headers({
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...customHeaders,
    });

    if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
    }

    return headers;
}

/**
 * Handle API response
 */
async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        let errorMessage = 'An error occurred';
        try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
            errorMessage = response.statusText;
        }
        throw new ApiError(errorMessage, response.status);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return response.json();
}

/**
 * Create timeout signal
 */
function createTimeoutSignal(timeout: number): AbortSignal {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), timeout);
    return controller.signal;
}

/**
 * Make a GET request
 */
export async function get<T>(
    path: string,
    options: RequestOptions = {}
): Promise<T> {
    const { headers, signal, timeout = 30000 } = options;
    const url = getApiUrl(path);

    const response = await fetch(url, {
        method: 'GET',
        headers: buildHeaders(headers),
        signal: signal || createTimeoutSignal(timeout),
    });

    return handleResponse<T>(response);
}

/**
 * Make a POST request
 */
export async function post<T, D = unknown>(
    path: string,
    data?: D,
    options: RequestOptions = {}
): Promise<T> {
    const { headers, signal, timeout = 30000 } = options;
    const url = getApiUrl(path);

    const response = await fetch(url, {
        method: 'POST',
        headers: buildHeaders(headers),
        body: data ? JSON.stringify(data) : undefined,
        signal: signal || createTimeoutSignal(timeout),
    });

    return handleResponse<T>(response);
}

/**
 * Make a PUT request
 */
export async function put<T, D = unknown>(
    path: string,
    data?: D,
    options: RequestOptions = {}
): Promise<T> {
    const { headers, signal, timeout = 30000 } = options;
    const url = getApiUrl(path);

    const response = await fetch(url, {
        method: 'PUT',
        headers: buildHeaders(headers),
        body: data ? JSON.stringify(data) : undefined,
        signal: signal || createTimeoutSignal(timeout),
    });

    return handleResponse<T>(response);
}

/**
 * Make a PATCH request
 */
export async function patch<T, D = unknown>(
    path: string,
    data?: D,
    options: RequestOptions = {}
): Promise<T> {
    const { headers, signal, timeout = 30000 } = options;
    const url = getApiUrl(path);

    const response = await fetch(url, {
        method: 'PATCH',
        headers: buildHeaders(headers),
        body: data ? JSON.stringify(data) : undefined,
        signal: signal || createTimeoutSignal(timeout),
    });

    return handleResponse<T>(response);
}

/**
 * Make a DELETE request
 */
export async function del<T>(
    path: string,
    options: RequestOptions = {}
): Promise<T> {
    const { headers, signal, timeout = 30000 } = options;
    const url = getApiUrl(path);

    const response = await fetch(url, {
        method: 'DELETE',
        headers: buildHeaders(headers),
        signal: signal || createTimeoutSignal(timeout),
    });

    return handleResponse<T>(response);
}

/** API client with all methods */
export const api = {
    get,
    post,
    put,
    patch,
    delete: del,
    setAccessToken,
    getAccessToken,
};

// Supabase client initialization
const config = getConfig();
export const supabase = createClient(
    config.supabaseUrl || 'https://twofvzzietlvfhjsjtnv.supabase.co',
    config.supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3b2Z2enppZXRsdmZoanNqdG52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MjE5OTIsImV4cCI6MjA4NTA5Nzk5Mn0.Q9E_GImvHfqO8x-Ge3HNhLOu92N3hKUCMnsLtFPVhrs'
);

export * from './auth-gatekeeper';
export default api;
