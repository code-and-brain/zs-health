import { supabase } from './index';
import { getConfig } from '@zs-health/esm-config';

export interface UserProfile {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    roles: string[];
}

export interface AuthResponse {
    success: boolean;
    user?: UserProfile;
    accessToken?: string;
    refreshToken?: string;
    error?: string;
}

export interface IAuthProvider {
    signIn(email: string, password: string): Promise<AuthResponse>;
    signOut(): Promise<void>;
    getSession(): Promise<AuthResponse>;
}

/** Supabase Implementation */
class SupabaseProvider implements IAuthProvider {
    async signIn(email: string, password: string): Promise<AuthResponse> {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { success: false, error: error.message };
        if (!data.user || !data.session) return { success: false, error: 'No session data' };

        return {
            success: true,
            user: {
                id: data.user.id,
                email: data.user.email!,
                firstName: data.user.user_metadata?.first_name,
                lastName: data.user.user_metadata?.last_name,
                roles: data.user.user_metadata?.roles || ['practitioner'],
            },
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token,
        };
    }

    async signOut(): Promise<void> {
        await supabase.auth.signOut();
    }

    async getSession(): Promise<AuthResponse> {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) return { success: false };
        const user = session.user;
        return {
            success: true,
            user: {
                id: user.id,
                email: user.email!,
                firstName: user.user_metadata?.first_name,
                lastName: user.user_metadata?.last_name,
                roles: user.user_metadata?.roles || ['practitioner'],
            },
            accessToken: session.access_token,
        };
    }
}

/** OIDC / OAuth2 Implementation (e.g. Keycloak) */
class OAuth2Provider implements IAuthProvider {
    async signIn(email: string, password: string): Promise<AuthResponse> {
        // Placeholder for OAuth2/Keycloak logic
        return { success: false, error: 'OAuth2 Provider not fully implemented' };
    }
    async signOut(): Promise<void> { /* Logic for Keycloak signout */ }
    async getSession(): Promise<AuthResponse> { return { success: false }; }
}

/** Auth Gatekeeper Factory */
export class AuthGatekeeper {
    private static instance: IAuthProvider;

    static getProvider(): IAuthProvider {
        if (this.instance) return this.instance;

        const config = getConfig();
        switch (config.authProvider) {
            case 'supabase':
                this.instance = new SupabaseProvider();
                break;
            case 'keycloak':
                this.instance = new OAuth2Provider();
                break;
            default:
                this.instance = new SupabaseProvider();
        }
        return this.instance;
    }
}
