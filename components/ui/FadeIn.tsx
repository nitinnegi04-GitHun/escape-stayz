'use client';

import { ReactNode } from 'react';

interface FadeInProps {
    children: ReactNode;
    delay?: number;
    className?: string;
    id?: string;
}

export const FadeIn = ({ children, delay = 0, className = '', id }: FadeInProps) => {
    return (
        <div
            id={id}
            className={`fade-in-view ${className}`}
            style={{ animationDelay: `${delay}s` }}
        >
            {children}
            <style>{`
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .fade-in-view { animation: fadeInUp 0.8s ease-out both; }
            `}</style>
        </div>
    );
};
