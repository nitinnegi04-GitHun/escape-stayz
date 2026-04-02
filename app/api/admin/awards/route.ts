import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { title, image_url, storage_path, pointers, display_order } = body;

        const { data, error } = await adminSupabase.from('awards').insert([{
            title,
            image_url,
            storage_path,
            pointers: pointers || [],
            display_order: display_order ?? 0,
        }]).select().single();

        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json({ data });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
