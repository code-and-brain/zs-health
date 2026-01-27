/**
 * ESM Login App - Authentication UI for ZS Health
 */

import { useState, FormEvent } from 'react';
import {
    Form,
    TextInput,
    PasswordInput,
    Button,
    Checkbox,
    InlineLoading,
    InlineNotification,
    Stack,
    Link,
    useTranslation,
    useAuth,
} from '@zs-health/esm-framework';
import './LoginPage.css';

export function LoginPage() {
    const { t } = useTranslation();
    const { login } = useAuth();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const success = await login(username, password);
            if (!success) {
                setError(t('auth.loginFailed'));
            }
        } catch {
            setError(t('auth.loginFailed'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                {/* Logo & Header */}
                <div className="login-header">
                    <div className="login-logo">
                        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2" />
                            <path
                                d="M24 12v24M12 24h24"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>
                    <h1 className="login-title">ZS Health</h1>
                    <p className="login-subtitle">Healthcare Information System</p>
                </div>

                {/* Error Message */}
                {error && (
                    <InlineNotification
                        kind="error"
                        title={t('common.error')}
                        subtitle={error}
                        hideCloseButton
                        className="login-error"
                    />
                )}

                {/* Login Form */}
                <Form onSubmit={handleSubmit} className="login-form">
                    <Stack gap={5}>
                        <TextInput
                            id="username"
                            labelText={t('auth.username')}
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={isLoading}
                            required
                        />

                        <PasswordInput
                            id="password"
                            labelText={t('auth.password')}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                            required
                        />

                        <div className="login-options">
                            <Checkbox
                                id="remember-me"
                                labelText={t('auth.rememberMe')}
                                checked={rememberMe}
                                onChange={(_, { checked }) => setRememberMe(checked)}
                                disabled={isLoading}
                            />
                            <Link to="/forgot-password" className="login-forgot-link">
                                {t('auth.forgotPassword')}
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            className="login-button"
                            disabled={isLoading || !username || !password}
                        >
                            {isLoading ? (
                                <InlineLoading description={t('common.loading')} />
                            ) : (
                                t('auth.loginButton')
                            )}
                        </Button>
                    </Stack>
                </Form>

                {/* Footer */}
                <div className="login-footer">
                    <p>© 2026 ZS Health. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
