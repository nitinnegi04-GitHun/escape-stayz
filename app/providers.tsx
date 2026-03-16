'use client';
import React from 'react';

import { SettingsProvider } from '../context/SettingsContext';
import { ThemeApplicator } from '../components/ThemeApplicator';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SettingsProvider>
            <ThemeApplicator />
            {children}
        </SettingsProvider>
    );
}
