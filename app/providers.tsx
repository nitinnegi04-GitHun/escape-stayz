'use client';
import React, { useEffect } from 'react';

import { SettingsProvider } from '../context/SettingsContext';
import { ThemeApplicator } from '../components/ThemeApplicator';

function FontAwesomeLoader() {
    useEffect(() => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        document.head.appendChild(link);
    }, []);
    return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SettingsProvider>
            <FontAwesomeLoader />
            <ThemeApplicator />
            {children}
        </SettingsProvider>
    );
}
