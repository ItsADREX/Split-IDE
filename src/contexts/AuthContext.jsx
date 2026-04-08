import React, { createContext, useContext, useEffect, useState } from 'react';
import { authHelpers, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isConfigured, setIsConfigured] = useState(isSupabaseConfigured);

    useEffect(() => {
        // Get initial session
        const getInitialSession = async () => {
            try {
                const { data, error } = await authHelpers.getSession();
                if (error) {
                    console.warn('Auth session error:', error.message);
                } else {
                    setSession(data.session);
                    setUser(data.session?.user ?? null);
                }
            } catch (error) {
                console.warn('Auth initialization error:', error.message);
            } finally {
                setLoading(false);
            }
        };

        getInitialSession();

        // Listen for auth changes
        const { data: { subscription } } = authHelpers.onAuthStateChange((event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription?.unsubscribe();
    }, []);

    const signUp = async (email, password) => {
        setLoading(true);
        try {
            const { data, error } = await authHelpers.signUp(email, password);
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        } finally {
            setLoading(false);
        }
    };

    const signIn = async (email, password) => {
        setLoading(true);
        try {
            const { data, error } = await authHelpers.signIn(email, password);
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        } finally {
            setLoading(false);
        }
    };

    const signInWithGoogle = async () => {
        setLoading(true);
        try {
            const { data, error } = await authHelpers.signInWithGoogle();
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        } finally {
            setLoading(false);
        }
    };

    const signInWithGitHub = async () => {
        setLoading(true);
        try {
            const { data, error } = await authHelpers.signInWithGitHub();
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        setLoading(true);
        try {
            const { error } = await authHelpers.signOut();
            if (error) throw error;
            return { error: null };
        } catch (error) {
            return { error };
        } finally {
            setLoading(false);
        }
    };

    const value = {
        user,
        session,
        loading,
        isConfigured,
        signUp,
        signIn,
        signInWithGoogle,
        signInWithGitHub,
        signOut
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
