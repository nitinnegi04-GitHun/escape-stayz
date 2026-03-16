
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

const isClient = typeof window !== 'undefined';
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: isClient,
        autoRefreshToken: isClient,
        detectSessionInUrl: isClient,
        storage: isClient ? localStorage : undefined,
    },
});
