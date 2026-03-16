
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('URL:', supabaseUrl);
console.log('Key:', supabaseAnonKey ? 'Found' : 'Missing');

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing credentials');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
    try {
        const { data, error } = await supabase.from('pages').select('*').limit(1);
        console.log('Data:', data);
        console.log('Error:', error);
    } catch (e) {
        console.error('Exception:', e);
    }
}

test();
