/**
 * Internationalization (i18n) for ZS Health
 * i18next setup with language detection and dynamic loading
 */

import i18n from 'i18next';
import { initReactI18next, useTranslation, Trans } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Re-export react-i18next hooks
export { useTranslation, Trans };

// ============================================
// Supported Languages
// ============================================

export const SUPPORTED_LANGUAGES = {
    en: { name: 'English', nativeName: 'English', dir: 'ltr' },
    bn: { name: 'Bengali', nativeName: 'বাংলা', dir: 'ltr' },
    ar: { name: 'Arabic', nativeName: 'العربية', dir: 'rtl' },
    fr: { name: 'French', nativeName: 'Français', dir: 'ltr' },
    es: { name: 'Spanish', nativeName: 'Español', dir: 'ltr' },
    hi: { name: 'Hindi', nativeName: 'हिन्दी', dir: 'ltr' },
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

// ============================================
// Default Translations
// ============================================

const defaultResources = {
    en: {
        translation: {
            // Common
            common: {
                loading: 'Loading...',
                save: 'Save',
                cancel: 'Cancel',
                delete: 'Delete',
                edit: 'Edit',
                view: 'View',
                search: 'Search',
                filter: 'Filter',
                reset: 'Reset',
                submit: 'Submit',
                confirm: 'Confirm',
                back: 'Back',
                next: 'Next',
                previous: 'Previous',
                close: 'Close',
                yes: 'Yes',
                no: 'No',
                ok: 'OK',
                error: 'Error',
                success: 'Success',
                warning: 'Warning',
                info: 'Information',
            },
            // Auth
            auth: {
                login: 'Login',
                logout: 'Logout',
                username: 'Username',
                password: 'Password',
                forgotPassword: 'Forgot Password?',
                rememberMe: 'Remember me',
                loginButton: 'Sign In',
                loginSuccess: 'Login successful',
                loginFailed: 'Login failed',
                logoutSuccess: 'You have been logged out',
            },
            // Navigation
            nav: {
                home: 'Home',
                dashboard: 'Dashboard',
                patients: 'Patients',
                appointments: 'Appointments',
                encounters: 'Encounters',
                settings: 'Settings',
                profile: 'Profile',
                help: 'Help',
            },
            // Patient
            patient: {
                title: 'Patient',
                patients: 'Patients',
                newPatient: 'New Patient',
                searchPatients: 'Search patients...',
                firstName: 'First Name',
                lastName: 'Last Name',
                dateOfBirth: 'Date of Birth',
                gender: 'Gender',
                phone: 'Phone',
                email: 'Email',
                address: 'Address',
                mrn: 'Medical Record Number',
            },
            // Validation
            validation: {
                required: 'This field is required',
                email: 'Please enter a valid email',
                phone: 'Please enter a valid phone number',
                minLength: 'Must be at least {{min}} characters',
                maxLength: 'Must be at most {{max}} characters',
            },
        },
    },
    bn: {
        translation: {
            common: {
                loading: 'লোড হচ্ছে...',
                save: 'সংরক্ষণ',
                cancel: 'বাতিল',
                delete: 'মুছুন',
                edit: 'সম্পাদনা',
                view: 'দেখুন',
                search: 'অনুসন্ধান',
                submit: 'জমা দিন',
                back: 'পিছনে',
                next: 'পরবর্তী',
                close: 'বন্ধ',
                yes: 'হ্যাঁ',
                no: 'না',
            },
            auth: {
                login: 'লগইন',
                logout: 'লগআউট',
                username: 'ব্যবহারকারীর নাম',
                password: 'পাসওয়ার্ড',
                loginButton: 'সাইন ইন',
            },
            nav: {
                home: 'হোম',
                dashboard: 'ড্যাশবোর্ড',
                patients: 'রোগী',
            },
            patient: {
                title: 'রোগী',
                patients: 'রোগীরা',
                firstName: 'প্রথম নাম',
                lastName: 'শেষ নাম',
                dateOfBirth: 'জন্ম তারিখ',
                gender: 'লিঙ্গ',
                phone: 'ফোন',
            },
        },
    },
};

// ============================================
// i18n Initialization
// ============================================

/**
 * Initialize i18n with configuration
 */
export function initI18n(options: { debug?: boolean } = {}): typeof i18n {
    i18n
        .use(LanguageDetector)
        .use(initReactI18next)
        .init({
            resources: defaultResources,
            fallbackLng: 'en',
            debug: options.debug ?? process.env.NODE_ENV === 'development',

            interpolation: {
                escapeValue: false, // React already escapes
            },

            detection: {
                order: ['localStorage', 'navigator', 'htmlTag'],
                caches: ['localStorage'],
                lookupLocalStorage: 'zs-health-language',
            },
        });

    return i18n;
}

// ============================================
// Language Utilities
// ============================================

/**
 * Get current language
 */
export function getCurrentLanguage(): SupportedLanguage {
    return (i18n.language || 'en') as SupportedLanguage;
}

/**
 * Change language
 */
export async function changeLanguage(language: SupportedLanguage): Promise<void> {
    await i18n.changeLanguage(language);

    // Update document direction for RTL languages
    const languageInfo = SUPPORTED_LANGUAGES[language];
    document.documentElement.dir = languageInfo.dir;
    document.documentElement.lang = language;
}

/**
 * Get language info
 */
export function getLanguageInfo(language: SupportedLanguage) {
    return SUPPORTED_LANGUAGES[language];
}

/**
 * Check if language is RTL
 */
export function isRTL(language?: SupportedLanguage): boolean {
    const lang = language || getCurrentLanguage();
    return SUPPORTED_LANGUAGES[lang]?.dir === 'rtl';
}

/**
 * Add translations for a namespace
 */
export function addTranslations(
    language: SupportedLanguage,
    namespace: string,
    translations: Record<string, unknown>
): void {
    i18n.addResourceBundle(language, namespace, translations, true, true);
}

export { i18n };
export default i18n;
