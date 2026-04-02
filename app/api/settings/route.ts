import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
    const { data, error } = await supabase
        .from('site_settings')
        .select('key, value');

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
        { data: data || [] },
        {
            headers: {
                'Cache-Control': 'public, max-age=3600, stale-while-revalidate=300',
            },
        }
    );
}
