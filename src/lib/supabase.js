
import { createClient } from '@supabase/supabase-js'

// Check if environment variables are available, otherwise use fallback values
// These fallbacks should be replaced with your actual Supabase credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-supabase-project-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

// We verify if the URL is not empty or undefined before creating the client
if (!supabaseUrl || supabaseUrl === 'https://your-supabase-project-url.supabase.co') {
  console.error('Supabase URL is required. Please set the VITE_SUPABASE_URL environment variable.');
}

if (!supabaseAnonKey || supabaseAnonKey === 'your-supabase-anon-key') {
  console.error('Supabase Anonymous Key is required. Please set the VITE_SUPABASE_ANON_KEY environment variable.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
