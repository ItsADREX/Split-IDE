import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create a mock client if Supabase is not configured
const createMockClient = () => ({
    from: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
        upsert: () => Promise.resolve({ data: null, error: null }),
        delete: () => Promise.resolve({ data: null, error: null })
    })
});

export const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY) 
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : createMockClient()

export const isSupabaseConfigured = !!(SUPABASE_URL && SUPABASE_ANON_KEY)
