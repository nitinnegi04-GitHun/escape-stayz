import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { folder_id, storage_path, public_url, title, alt_text, description, tags, media_type } = body;

        const { error } = await adminSupabase.from('gallery_images').insert([{
            folder_id,
            storage_path,
            public_url,
            title,
            alt_text,
            description,
            tags,
            media_type,
        }]);

        if (error) return NextResponse.json({ error: error.message }, { status: 400 });

        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
