
'use client';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body>
                <div className="min-h-screen flex items-center justify-center flex-col gap-4 p-8">
                    <h2>Something went wrong (Global)!</h2>
                    <p className="text-red-500">{error.message}</p>
                    <button onClick={() => reset()}>Try again</button>
                </div>
            </body>
        </html>
    );
}
