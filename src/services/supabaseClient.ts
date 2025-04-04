import { createClient } from '@supabase/supabase-js';

// Fetch environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Basic validation
if (!supabaseUrl) {
  throw new Error("Missing environment variable: VITE_SUPABASE_URL");
}
if (!supabaseAnonKey) {
  throw new Error("Missing environment variable: VITE_SUPABASE_ANON_KEY");
}

// Create and export the Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Optional: Log to confirm variables are loaded (remove in production)
// console.log('Supabase URL:', supabaseUrl);
// console.log('Supabase Anon Key Loaded:', !!supabaseAnonKey);