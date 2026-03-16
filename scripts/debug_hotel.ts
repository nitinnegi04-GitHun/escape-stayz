import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nlosdpghzjwnfdlxtvcx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sb3NkcGdoemp3bmZkbHh0dmN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MzEyNzgsImV4cCI6MjA4NjMwNzI3OH0.jnmAmllyx2P_xOlc8Y8T02msEGNWvCuuwhQxbqXSsco';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const getHotelBySlug = async (slug: string) => {
    console.log(`Fetching hotel with slug: ${slug}`);

    // 1. Check if it exists simply
    const { data: simpleData, error: simpleError } = await supabase
        .from('hotels')
        .select('id, name, slug')
        .eq('slug', slug);

    console.log("Simple search result:", simpleData?.length, "rows found.");
    if (simpleData) console.log(JSON.stringify(simpleData, null, 2));
    if (simpleError) console.error("Simple search error:", simpleError);

    if (!simpleData || simpleData.length === 0) {
        console.log("Slug not found in simple search. Checking all slugs...");
        const { data: allSlugs } = await supabase.from('hotels').select('name, slug');
        console.log("All hotels:", JSON.stringify(allSlugs, null, 2));
        return;
    }

    // 2. Run the complex query
    console.log("\nRunning complex query...");
    const { data, error } = await supabase
        .from('hotels')
        .select(`
      *,
      rooms(*, images:room_images(*), room_amenities(amenity:amenities(name, icon)), sleeping_arrangements),
      images:hotel_images(*),
      hotel_amenities(
        amenity:amenities(name, icon)
      ),
      faqs(*)
    `)
        .eq('slug', slug)
        .limit(1)
        .single();

    if (error) {
        console.error("Complex Query Error:", JSON.stringify(error, null, 2));
    } else {
        console.log("Complex Query Success!");
        // console.log(JSON.stringify(data, null, 2));
    }
};

const compareHotels = async () => {
    console.log("Fetching Rakcham (Working)...");
    const { data: rakcham } = await supabase
        .from('hotels')
        .select(`*, rooms(*), images:hotel_images(*), hotel_amenities(*)`)
        .eq('slug', 'Escape-Camps-Rakcham') // Adjust casing if needed based on DB
        .single();

    console.log("Fetching Narkanda (Broken)...");
    const { data: narkanda } = await supabase
        .from('hotels')
        .select(`*, rooms(*), images:hotel_images(*), hotel_amenities(*)`)
        .eq('slug', 'escape-inn-narkanda')
        .single();

    console.log("\n--- COMPARISON ---");
    console.log("Rakcham (Working):");
    console.log("- Amenities:", rakcham?.hotel_amenities?.length);
    console.log("- Images:", rakcham?.images?.length);
    console.log("- Rooms:", rakcham?.rooms?.length);
    console.log("- Location:", rakcham?.location_name);
    console.log("- Coordinates:", rakcham?.latitude, rakcham?.longitude);

    console.log("\nNarkanda (Broken):");
    console.log("- Amenities:", narkanda?.hotel_amenities?.length);
    console.log("- Images:", narkanda?.images?.length);
    console.log("- Rooms:", narkanda?.rooms?.length);
    console.log("- Location:", narkanda?.location_name);
    console.log("- Coordinates:", narkanda?.latitude, narkanda?.longitude);

    console.log("\nFull Narkanda Data:", JSON.stringify(narkanda, null, 2));
};

compareHotels();
