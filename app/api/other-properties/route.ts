import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const exclude = searchParams.get('exclude') || '';

    const { data, error } = await supabase
        .from('hotels')
        .select(`
            id, name, slug, location_name, destination_slug,
            thumbnail_image, short_description, full_description, highlights,
            images:hotel_images(image_url, alt_text),
            rooms(price_per_night),
            hotel_amenities(amenity:amenities(name, icon))
        `)
        .neq('slug', exclude)
        .limit(8);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
        { hotels: data || [] },
        {
            headers: {
                'Cache-Control': 'public, max-age=3600, stale-while-revalidate=300',
            },
        }
    );
}
