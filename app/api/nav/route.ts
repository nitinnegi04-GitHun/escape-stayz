import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
    const [{ data: hotels }, { data: destinations }] = await Promise.all([
        supabase.from('hotels').select('name, slug').order('name'),
        supabase.from('destinations').select('name, slug').order('name'),
    ]);

    return NextResponse.json(
        { hotels: hotels || [], destinations: destinations || [] },
        {
            headers: {
                'Cache-Control': 'public, max-age=3600, stale-while-revalidate=300',
            },
        }
    );
}
