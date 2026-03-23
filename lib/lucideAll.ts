import * as LucideIcons from 'lucide-react';
import { type LucideIcon } from 'lucide-react';

/**
 * Dynamically resolve any Lucide icon by its PascalCase component name.
 * Works for ALL lucide-react icons, not just the curated hotel set.
 */
export function getLucideIcon(name: string): LucideIcon | null {
    if (!name) return null;
    const icon = (LucideIcons as Record<string, unknown>)[name];
    // lucide-react v0.4+ exports forwardRef components as objects, not plain functions
    if (icon && (typeof icon === 'function' || typeof icon === 'object')) {
        return icon as LucideIcon;
    }
    return null;
}

/**
 * All available Lucide icon names (PascalCase component names only).
 */
export const ALL_LUCIDE_ICON_NAMES: string[] = Object.keys(LucideIcons).filter(key => {
    const val = (LucideIcons as Record<string, unknown>)[key];
    const isComponent = val && (typeof val === 'function' || typeof val === 'object');
    const isPascalCase = key[0] === key[0].toUpperCase() && key[0] !== key[0].toLowerCase();
    return isComponent && isPascalCase && !key.startsWith('create');
});
