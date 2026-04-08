import React, { memo, useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AuthModal = memo(({ isOpen, onClose, initialMode = 'login' }) => {
    const [mode, setMode] = useState(initialMode);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { signUp, signIn, signInWithGoogle, signInWithGitHub, isConfigured } = useAuth();

    const resetForm = () => {
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setError('');
        setShowPassword(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!isConfigured) {
            setError('Authentication is not configured. Please set up Supabase credentials.');
            setIsLoading(false);
            return;
        }

        if (mode === 'signup' && password !== confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            setIsLoading(false);
            return;
        }

        try {
            let result;
            if (mode === 'login') {
                result = await signIn(email, password);
            } else {
                result = await signUp(email, password);
            }

            if (result.error) {
                setError(result.error.message);
            } else {
                if (mode === 'signup') {
                    setError('Check your email for verification link');
                } else {
                    handleClose();
                }
            }
        } catch (err) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const switchMode = () => {
        setMode(mode === 'login' ? 'signup' : 'login');
        setError('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div 
                className="bg-panel rounded-xl shadow-lg w-full max-w-md relative"
                style={{ 
                    backgroundColor: 'var(--bg-panel)',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-lg)'
                }}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
                        {mode === 'login' ? 'Sign In' : 'Create Account'}
                    </h2>
                    <button onClick={handleClose} className="icon-btn">
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Email Field */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-muted)' }}>
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: 'var(--color-muted)' }} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-colors"
                                style={{
                                    backgroundColor: 'var(--bg-main)',
                                    borderColor: 'var(--border-color)',
                                    color: 'var(--color-text)',
                                    focusRingColor: 'var(--color-teal)'
                                }}
                                placeholder="Enter your email"
                                required
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-muted)' }}>
                            Password
                        </label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: 'var(--color-muted)' }} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-12 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-colors"
                                style={{
                                    backgroundColor: 'var(--bg-main)',
                                    borderColor: 'var(--border-color)',
                                    color: 'var(--color-text)',
                                    focusRingColor: 'var(--color-teal)'
                                }}
                                placeholder="Enter your password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 icon-btn"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password (Signup only) */}
                    {mode === 'signup' && (
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-muted)' }}>
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: 'var(--color-muted)' }} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-colors"
                                    style={{
                                        backgroundColor: 'var(--bg-main)',
                                        borderColor: 'var(--border-color)',
                                        color: 'var(--color-text)',
                                        focusRingColor: 'var(--color-teal)'
                                    }}
                                    placeholder="Confirm your password"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                            {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
                        style={{
                            backgroundColor: 'var(--color-teal)',
                            color: 'var(--bg-main)'
                        }}
                    >
                        {isLoading ? 'Loading...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
                    </button>

                    {/* Social Login Buttons */}
                    <div className="space-y-3">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t" style={{ borderColor: 'var(--border-color)' }}></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2" style={{ backgroundColor: 'var(--bg-panel)', color: 'var(--color-muted)' }}>
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        {/* Google Sign In */}
                        <button
                            type="button"
                            onClick={async () => {
                                setError('');
                                setIsLoading(true);
                                try {
                                    const result = await signInWithGoogle();
                                    if (result.error) {
                                        setError(result.error.message);
                                    } else {
                                        // OAuth will redirect, so we don't close modal here
                                    }
                                } catch (err) {
                                    setError(err.message || 'Google sign in failed');
                                } finally {
                                    setIsLoading(false);
                                }
                            }}
                            disabled={isLoading || !isConfigured}
                            className="w-full py-3 px-4 rounded-lg border font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-3"
                            style={{
                                backgroundColor: 'var(--bg-main)',
                                borderColor: 'var(--border-color)',
                                color: 'var(--color-text)'
                            }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Continue with Google
                        </button>

                        {/* GitHub Sign In */}
                        <button
                            type="button"
                            onClick={async () => {
                                setError('');
                                setIsLoading(true);
                                try {
                                    const result = await signInWithGitHub();
                                    if (result.error) {
                                        setError(result.error.message);
                                    } else {
                                        // OAuth will redirect, so we don't close modal here
                                    }
                                } catch (err) {
                                    setError(err.message || 'GitHub sign in failed');
                                } finally {
                                    setIsLoading(false);
                                }
                            }}
                            disabled={isLoading || !isConfigured}
                            className="w-full py-3 px-4 rounded-lg border font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-3"
                            style={{
                                backgroundColor: '#24292e',
                                borderColor: '#24292e',
                                color: '#ffffff'
                            }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                            Continue with GitHub
                        </button>
                    </div>

                    {/* Mode Switch */}
                    <div className="text-center pt-4">
                        <span style={{ color: 'var(--color-muted)' }}>
                            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                        </span>
                        <button
                            type="button"
                            onClick={switchMode}
                            className="font-medium hover:underline"
                            style={{ color: 'var(--color-teal)' }}
                        >
                            {mode === 'login' ? 'Sign Up' : 'Sign In'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
});

AuthModal.displayName = 'AuthModal';

export default AuthModal;
