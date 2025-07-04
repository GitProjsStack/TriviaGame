import { createClient } from '@supabase/supabase-js'

// Env vars for Supabase URL and anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey)