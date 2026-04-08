import React, { memo, useState, useRef, useEffect } from 'react';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const UserProfile = memo(() => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const { user, signOut, loading } = useAuth();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSignOut = async () => {
        setIsOpen(false);
        await signOut();
    };

    if (!user || loading) return null;

    const userEmail = user.email || 'User';
    const userName = user.user_metadata?.full_name || user.user_metadata?.name || userEmail.split('@')[0];
    const userInitial = userName.charAt(0).toUpperCase();
    const avatarUrl = user.user_metadata?.avatar_url;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Profile Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 rounded-lg transition-colors"
                style={{ 
                    padding: '4px 8px',
                    backgroundColor: isOpen ? 'var(--bg-hover)' : 'transparent',
                    border: '1px solid',
                    borderColor: isOpen ? 'var(--color-teal)' : 'var(--border-color)'
                }}
            >
                {/* Avatar */}
                {avatarUrl ? (
                    <img 
                        src={avatarUrl} 
                        alt={userName}
                        className="w-7 h-7 rounded-full object-cover"
                    />
                ) : (
                    <div 
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ 
                            backgroundColor: 'var(--color-teal)', 
                            color: 'var(--bg-main)' 
                        }}
                    >
                        {userInitial}
                    </div>
                )}
                
                {/* Name (desktop only) */}
                <span className="hidden md:inline text-sm max-w-28 truncate" style={{ color: 'var(--color-text)' }}>
                    {userName}
                </span>
                
                {/* Chevron */}
                <ChevronDown 
                    size={12} 
                    style={{ color: 'var(--color-muted)' }}
                    className={`transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div 
                    className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg z-50"
                    style={{ 
                        backgroundColor: 'var(--bg-panel)',
                        border: '1px solid var(--border-color)',
                        boxShadow: 'var(--shadow-lg)'
                    }}
                >
                    {/* User Info */}
                    <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
                        <div className="flex items-center gap-3">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt={userName} className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                                <div 
                                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                                    style={{ backgroundColor: 'var(--color-teal)', color: 'var(--bg-main)' }}
                                >
                                    {userInitial}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>
                                    {userName}
                                </p>
                                <p className="text-xs truncate" style={{ color: 'var(--color-muted)' }}>
                                    {userEmail}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                        {/* Settings (placeholder for future) */}
                        <button
                            className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-hover transition-colors"
                            style={{ color: 'var(--color-text)' }}
                            onClick={() => setIsOpen(false)}
                        >
                            <Settings size={16} />
                            <span className="text-sm">Settings</span>
                        </button>

                        {/* Divider */}
                        <div className="my-2 border-t" style={{ borderColor: 'var(--border-color)' }}></div>

                        {/* Sign Out */}
                        <button
                            onClick={handleSignOut}
                            className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-hover transition-colors text-red-400"
                        >
                            <LogOut size={16} />
                            <span className="text-sm">Sign Out</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
});

UserProfile.displayName = 'UserProfile';

export default UserProfile;
