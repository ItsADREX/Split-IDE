import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create a mock client if Supabase is not configured
const createMockClient = () => ({
    from: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
        upsert: () => Promise.resolve({ data: null, error: null }),
        delete: () => Promise.resolve({ data: null, error: null })
    }),
    auth: {
        signUp: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
        signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
        signOut: () => Promise.resolve({ error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    }
});

// Only create real client if both URL and key are properly configured
export const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL !== 'undefined' && SUPABASE_ANON_KEY !== 'undefined') 
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : createMockClient()

export const isSupabaseConfigured = !!(SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL !== 'undefined' && SUPABASE_ANON_KEY !== 'undefined')

// Auth helper functions
export const authHelpers = {
    signUp: async (email, password) => {
        const { data, error } = await supabase.auth.signUp({ 
            email, 
            password,
            options: {
                emailRedirectTo: window.location.origin
            }
        });
        return { data, error };
    },
    signIn: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        return { data, error };
    },
    signInWithGoogle: async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
        return { data, error };
    },
    signInWithGitHub: async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: window.location.origin
            }
        });
        return { data, error };
    },
    signOut: async () => {
        const { error } = await supabase.auth.signOut();
        return { error };
    },
    getSession: async () => {
        const { data, error } = await supabase.auth.getSession();
        return { data, error };
    },
    onAuthStateChange: (callback) => {
        return supabase.auth.onAuthStateChange(callback);
    }
};
