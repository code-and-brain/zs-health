/**
 * Extension/plugin system for ZS Health
 * Dynamic module loading and extension slots
 */

import { ReactNode, ComponentType, lazy, Suspense, createElement } from 'react';

// ============================================
// Types
// ============================================

export interface ExtensionDefinition {
    /** Unique extension ID */
    id: string;
    /** Target slot to render in */
    slot: string;
    /** Load function returning the component */
    load: () => Promise<{ default: ComponentType<unknown> }>;
    /** Order priority (lower = first) */
    order?: number;
    /** Required permissions */
    permissions?: string[];
    /** Only render if online */
    online?: boolean;
    /** Meta information */
    meta?: Record<string, unknown>;
}

export interface ExtensionSlotProps {
    /** Slot name to render extensions for */
    name: string;
    /** Props to pass to extensions */
    state?: Record<string, unknown>;
    /** Loading fallback */
    loading?: ReactNode;
    /** Wrapper element */
    wrapper?: ComponentType<{ children: ReactNode }>;
}

// ============================================
// Extension Registry
// ============================================

const extensionRegistry = new Map<string, ExtensionDefinition>();
const slotExtensions = new Map<string, Set<string>>();

/**
 * Register an extension
 */
export function registerExtension(extension: ExtensionDefinition): void {
    // Validate
    if (!extension.id || !extension.slot || !extension.load) {
        throw new Error('Extension must have id, slot, and load function');
    }

    // Store extension
    extensionRegistry.set(extension.id, extension);

    // Update slot mapping
    if (!slotExtensions.has(extension.slot)) {
        slotExtensions.set(extension.slot, new Set());
    }
    slotExtensions.get(extension.slot)!.add(extension.id);

    console.info(`Registered extension: ${extension.id} for slot: ${extension.slot}`);
}

/**
 * Unregister an extension
 */
export function unregisterExtension(id: string): boolean {
    const extension = extensionRegistry.get(id);
    if (!extension) return false;

    // Remove from slot mapping
    slotExtensions.get(extension.slot)?.delete(id);

    // Remove from registry
    extensionRegistry.delete(id);

    return true;
}

/**
 * Get all extensions for a slot
 */
export function getExtensionsForSlot(slot: string): ExtensionDefinition[] {
    const extensionIds = slotExtensions.get(slot);
    if (!extensionIds) return [];

    return Array.from(extensionIds)
        .map((id) => extensionRegistry.get(id)!)
        .filter(Boolean)
        .sort((a, b) => (a.order ?? 100) - (b.order ?? 100));
}

/**
 * Get extension by ID
 */
export function getExtension(id: string): ExtensionDefinition | undefined {
    return extensionRegistry.get(id);
}

/**
 * Get all registered slots
 */
export function getAllSlots(): string[] {
    return Array.from(slotExtensions.keys());
}

// ============================================
// Extension Slot Component
// ============================================

/**
 * Render extensions for a slot
 */
export function ExtensionSlot({
    name,
    state = {},
    loading = null,
    wrapper: Wrapper,
}: ExtensionSlotProps): ReactNode {
    const extensions = getExtensionsForSlot(name);

    if (extensions.length === 0) {
        return null;
    }

    const extensionElements = extensions.map((ext) => {
        const LazyComponent = lazy(ext.load);

        return createElement(
            Suspense,
            { key: ext.id, fallback: loading },
            createElement(LazyComponent, state)
        );
    });

    if (Wrapper) {
        return createElement(Wrapper, null, ...extensionElements);
    }

    return createElement('div', { 'data-extension-slot': name }, ...extensionElements);
}

// ============================================
// Extension Loading
// ============================================

interface ModuleConfig {
    name: string;
    extensions: ExtensionDefinition[];
}

const loadedModules = new Set<string>();

/**
 * Load a module and register its extensions
 */
export async function loadModule(config: ModuleConfig): Promise<void> {
    if (loadedModules.has(config.name)) {
        console.warn(`Module ${config.name} already loaded`);
        return;
    }

    // Register all extensions from the module
    for (const extension of config.extensions) {
        registerExtension(extension);
    }

    loadedModules.add(config.name);
    console.info(`Loaded module: ${config.name} with ${config.extensions.length} extensions`);
}

/**
 * Check if module is loaded
 */
export function isModuleLoaded(name: string): boolean {
    return loadedModules.has(name);
}

/**
 * Get all loaded modules
 */
export function getLoadedModules(): string[] {
    return Array.from(loadedModules);
}

// ============================================
// Hook for extensions
// ============================================

import { useMemo } from 'react';

/**
 * Hook to get extensions for a slot
 */
export function useExtensions(slot: string): ExtensionDefinition[] {
    return useMemo(() => getExtensionsForSlot(slot), [slot]);
}

/**
 * Hook to check if slot has extensions
 */
export function useHasExtensions(slot: string): boolean {
    const extensions = useExtensions(slot);
    return extensions.length > 0;
}

// ============================================
// Common Extension Slots
// ============================================

export const SLOTS = {
    // Navigation
    PRIMARY_NAVIGATION: 'primary-navigation',
    USER_PANEL: 'user-panel',

    // Dashboard
    DASHBOARD_WIDGETS: 'dashboard-widgets',
    QUICK_ACTIONS: 'quick-actions',

    // Patient
    PATIENT_HEADER: 'patient-header',
    PATIENT_CHART_TABS: 'patient-chart-tabs',
    PATIENT_SIDEBAR: 'patient-sidebar',
    PATIENT_ACTIONS: 'patient-actions',

    // Clinical
    VITALS_ENTRY: 'vitals-entry',
    MEDICATION_ORDER: 'medication-order',
    LAB_RESULTS: 'lab-results',

    // Global
    APP_FOOTER: 'app-footer',
    GLOBAL_ACTIONS: 'global-actions',
} as const;

export type SlotName = (typeof SLOTS)[keyof typeof SLOTS];
