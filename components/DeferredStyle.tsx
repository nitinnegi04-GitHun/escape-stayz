'use client';

import React from 'react';

export function DeferredStyle({ href }: { href: string }) {
    return (
        <link 
            rel="stylesheet" 
            href={href}
            media="print"
            onLoad={(e) => { e.currentTarget.media = 'all'; }}
        />
    );
}
