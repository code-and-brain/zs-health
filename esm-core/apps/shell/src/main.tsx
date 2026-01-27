import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initConfig, initI18n } from '@zs-health/esm-framework';
import App from './App';
import './index.css';

// Initialize configuration
initConfig({
    appName: 'ZS Health',
    apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
    fhirBaseUrl: import.meta.env.VITE_FHIR_URL || 'http://localhost:8080/fhir',
    authUrl: import.meta.env.VITE_AUTH_URL || 'http://localhost:8080/auth',
    environment: import.meta.env.MODE as 'development' | 'staging' | 'production',
});

// Initialize i18n
initI18n({ debug: import.meta.env.DEV });

// Render app
const root = document.getElementById('root');
if (root) {
    createRoot(root).render(
        <StrictMode>
            <App />
        </StrictMode>
    );
}
