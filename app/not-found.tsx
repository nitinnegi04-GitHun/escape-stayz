
import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-cream text-charcoal">
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-body)' }}>404 - Not Found</h2>
            <p className="mb-8 text-lg font-light">Could not find the requested resource.</p>
            <Link href="/" className="bg-terracotta text-white px-6 py-3 rounded-full font-bold uppercase tracking-wider hover:opacity-90 transition-opacity">
                Return Home
            </Link>
        </div>
    );
}
