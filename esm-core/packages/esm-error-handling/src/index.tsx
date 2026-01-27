/**
 * Error boundaries and error handling for ZS Health
 * React error boundaries with fallback UI
 */

import { Component, ReactNode, ErrorInfo } from 'react';
import { Button, Stack, InlineNotification } from '@zs-health/esm-styleguide';

// ============================================
// Error Boundary Component
// ============================================

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    resetKeys?: unknown[];
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

/**
 * React Error Boundary component
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error to console in development
        console.error('Error caught by boundary:', error, errorInfo);

        // Call optional error handler
        this.props.onError?.(error, errorInfo);

        // Report to error tracking service
        reportError(error, { componentStack: errorInfo.componentStack });
    }

    componentDidUpdate(prevProps: ErrorBoundaryProps) {
        // Reset error state if resetKeys change
        if (this.state.hasError && prevProps.resetKeys !== this.props.resetKeys) {
            this.reset();
        }
    }

    reset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <DefaultErrorFallback 
          error= { this.state.error }
            onRetry = { this.reset }
                />
      );
        }

        return this.props.children;
    }
}

// ============================================
// Default Error Fallback UI
// ============================================

interface ErrorFallbackProps {
    error: Error | null;
    onRetry?: () => void;
}

/**
 * Default error fallback component
 */
export function DefaultErrorFallback({ error, onRetry }: ErrorFallbackProps) {
    return (
        <div className= "zs-error-fallback" >
        <Stack gap={ 5 }>
            <InlineNotification
          kind="error"
    title = "Something went wrong"
    subtitle = { error?.message || 'An unexpected error occurred'
}
hideCloseButton
    />

    <div className="zs-error-actions" >
        { onRetry && (
            <Button kind="primary" onClick = { onRetry } >
                Try Again
                    </Button>
          )}
<Button kind="secondary" onClick = {() => window.location.reload()}>
    Reload Page
        </Button>
        </div>

{
    process.env.NODE_ENV === 'development' && error?.stack && (
        <details className="zs-error-details" >
            <summary>Error Details </summary>
                < pre > { error.stack } </pre>
                </details>
        )
}
</Stack>
    </div>
  );
}

// ============================================
// Error Reporting
// ============================================

interface ErrorContext {
    componentStack?: string | null;
    userId?: string;
    url?: string;
    [key: string]: unknown;
}

/**
 * Report error to monitoring service
 */
export function reportError(error: Error, context: ErrorContext = {}): void {
    // Add URL and timestamp
    const errorReport = {
        name: error.name,
        message: error.message,
        stack: error.stack,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        ...context,
    };

    // Log in development
    if (process.env.NODE_ENV === 'development') {
        console.error('Error Report:', errorReport);
        return;
    }

    // In production, send to error tracking service
    // Example: Sentry, LogRocket, etc.
    // fetch('/api/errors', {
    //   method: 'POST',
    //   body: JSON.stringify(errorReport),
    // });
}

// ============================================
// Error Utilities
// ============================================

/**
 * Create a custom application error
 */
export class AppError extends Error {
    constructor(
        message: string,
        public code: string = 'UNKNOWN_ERROR',
        public details?: Record<string, unknown>
    ) {
        super(message);
        this.name = 'AppError';
    }
}

/**
 * Check if error is an app error
 */
export function isAppError(error: unknown): error is AppError {
    return error instanceof AppError;
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    return 'An unexpected error occurred';
}

/**
 * Safe try-catch wrapper
 */
export async function tryCatch<T>(
    fn: () => Promise<T>,
    onError?: (error: Error) => void
): Promise<[T, null] | [null, Error]> {
    try {
        const result = await fn();
        return [result, null];
    } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        onError?.(err);
        return [null, err];
    }
}
