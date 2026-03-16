
'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center flex-col gap-4 p-8 bg-cream text-charcoal">
            <h2 className="text-2xl font-bold font-heading">Something went wrong!</h2>
            <p className="text-red-500 bg-red-50 p-4 rounded border border-red-200">
                {error.message || "Unknown error"}
            </p>
            <button
                className="px-4 py-2 bg-terracotta text-white rounded hover:bg-opacity-90 transition-colors"
                onClick={
                    // Attempt to recover by trying to re-render the segment
                    () => reset()
                }
            >
                Try again
            </button>
        </div>
    );
}
