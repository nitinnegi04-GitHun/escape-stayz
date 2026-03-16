
import { supabase } from './supabase';

export const getHotels = async (limit = 10, featured = false) => {
  let query = supabase
    .from('hotels')
    .select('*, images:hotel_images(*), rooms(price_per_night)')
    .order('created_at', { ascending: false })
    .order('display_order', { foreignTable: 'images', ascending: true });

  if (featured) {
    query = query.eq('featured', true);
  }

  const { data, error } = await query.limit(limit);
  if (error) {
    console.error("Supabase Query Error:", error);
    throw error;
  }
  return data;
};

export const getHotelBySlug = async (slug: string) => {
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
    .order('display_order', { foreignTable: 'rooms.images', ascending: true })
    .order('display_order', { foreignTable: 'images', ascending: true })
    .eq('slug', slug)
    .limit(1)
    .single();
  if (error) throw error;
  return data;
};

export const getHotelsByDestination = async (destinationSlug: string) => {
  const { data, error } = await supabase
    .from('hotels')
    .select('*, images:hotel_images(*)')
    .order('display_order', { foreignTable: 'images', ascending: true })
    .eq('destination_slug', destinationSlug);
  if (error) throw error;
  return data;
};

export const getDestinations = async () => {
  const { data, error } = await supabase
    .from('destinations')
    .select('*')
    .order('name');
  if (error) throw error;
  return data;
};

export const getDestinationBySlug = async (slug: string) => {
  const { data, error } = await supabase
    .from('destinations')
    .select(`
      *,
      images:destination_images(*)
    `)
    .order('display_order', { foreignTable: 'images', ascending: true })
    .eq('slug', slug)
    .single();
  if (error) throw error;
  return data;
};

export const getBlogPosts = async () => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const getBlogPostBySlug = async (slug: string) => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .single();
  if (error) throw error;
  return data;
};

export const getBlogsByDestination = async (destinationSlug: string) => {
  // Match posts linked by destination_slug OR tagged with the destination slug
  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, slug, title, excerpt, featured_image, category, tags, author, created_at')
    .eq('published', true)
    .or(`destination_slug.eq.${destinationSlug},tags.cs.{${destinationSlug}}`)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('getBlogsByDestination error:', error);
    return [];
  }
  return data || [];
};

