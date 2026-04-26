import React, { memo, useState } from 'react';
import { Play, UploadCloud, Menu, TerminalSquare, LogIn, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import UserProfile from './UserProfile';
import AuthModal from './AuthModal';
import SyncStatus from './SyncStatus';

const ViewToggle = ({ viewMode, onToggle }) => (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        height: '30px',
        backgroundColor: 'var(--bg-main)',
        borderRadius: '7px',
        border: '1px solid var(--border-color)',
        padding: '2px',
        gap: '1px',
        flexShrink: 0,
    }}>
        {[
            { key: 'code',    label: '<> CODE'    },
            { key: 'preview', label: '▶ PREVIEW'  },
        ].map(({ key, label }) => (
            <button
                key={key}
                onClick={() => onToggle(key)}
                style={{
                    height: '100%',
                    padding: '0 10px',
                    borderRadius: '5px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 700,
                    transition: 'all 0.15s',
                    backgroundColor: viewMode === key ? 'var(--color-teal)' : 'transparent',
                    color: viewMode === key ? 'var(--bg-main)' : 'var(--color-muted)',
                    whiteSpace: 'nowrap',
                }}
            >
                {label}
            </button>
        ))}
    </div>
);

const Header = memo(({ panels, togglePanel, executeCode, uploadFile, syncStatus, viewMode, onViewModeChange, onOpenSettings }) => {
    const [showAuthModal, setShowAuthModal] = useState(false);
    const { user, loading } = useAuth();

    return (
        <header className="flex items-center px-2 md:px-4 gap-2" style={{ backgroundColor: 'var(--bg-header)', borderBottom: '1px solid var(--border-color)', height: '50px' }}>
            {/* Hamburger */}
            <button className={`action-btn ${panels.explorer ? 'active' : ''}`} onClick={() => togglePanel('explorer')} title="Explorer">
                <Menu size={16} />
            </button>

            {/* Logo */}
            <div className="font-bold tracking-wider" style={{ color: 'var(--color-text)', flexShrink: 0 }}>
                SPLIT<span style={{ color: 'var(--color-teal)', textShadow: '0 0 8px rgba(0, 240, 255, 0.4)' }}>IDE</span>
            </div>

            {/* CODE / PREVIEW toggle — always visible */}
            <ViewToggle viewMode={viewMode} onToggle={onViewModeChange} />

            <div className="flex-1" />

            {/* Desktop-only extras */}
            <div className="hidden md:flex items-center gap-2">
                <button className="action-btn" onClick={executeCode} style={{ backgroundColor: 'var(--color-neon-green)', color: 'var(--bg-main)', fontWeight: 800 }}>
                    <Play size={14} className="mr-1" />
                    <span className="hidden lg:inline">RUN SCRIPT</span>
                    <span className="lg:hidden">RUN</span>
                </button>
                <button className="action-btn" onClick={uploadFile} style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                    <UploadCloud size={14} className="mr-1" />
                    <span className="hidden lg:inline">UPLOAD</span>
                </button>
                <div style={{ width: 1, height: 20, background: 'var(--border-color)' }} />
                <button className={`action-btn ${panels.terminal ? 'active' : ''}`} onClick={() => togglePanel('terminal')} title="Terminal">
                    <TerminalSquare size={16} />
                </button>
                <button className={`action-btn ${panels.ai ? 'active' : ''}`} onClick={() => togglePanel('ai')} style={{ color: 'var(--color-neon-green)' }}>
                    ✨ <span className="hidden lg:inline">AI</span>
                </button>
                <SyncStatus status={syncStatus} />
                <div style={{ width: 1, height: 20, background: 'var(--border-color)' }} />
                {!loading && (
                    user ? <UserProfile /> : (
                        <button className="action-btn" onClick={() => setShowAuthModal(true)} style={{ color: 'var(--color-teal)' }}>
                            <LogIn size={16} />
                            <span className="hidden lg:inline ml-1">Sign In</span>
                        </button>
                    )
                )}
                <button className="action-btn" onClick={onOpenSettings} title="Settings">
                    <Settings size={15} />
                </button>
            </div>

            {/* Mobile-only compact controls */}
            <div className="flex items-center gap-1 md:hidden">
                <button className="action-btn" onClick={executeCode} style={{ backgroundColor: 'var(--color-neon-green)', color: 'var(--bg-main)', fontWeight: 800, padding: '6px 8px' }}>
                    <Play size={13} />
                </button>
                <button className={`action-btn ${panels.terminal ? 'active' : ''}`} onClick={() => togglePanel('terminal')} title="Terminal">
                    <TerminalSquare size={13} />
                </button>
                <button className={`action-btn ${panels.ai ? 'active' : ''}`} onClick={() => togglePanel('ai')} style={{ color: 'var(--color-neon-green)', padding: '6px 8px' }}>
                    ✨
                </button>
                {!loading && !user && (
                    <button className="action-btn" onClick={() => setShowAuthModal(true)} style={{ color: 'var(--color-teal)' }}>
                        <LogIn size={13} />
                    </button>
                )}
                {!loading && user && <UserProfile />}
                <button className="action-btn" onClick={onOpenSettings} title="Settings" style={{ padding: '6px 8px' }}>
                    <Settings size={13} />
                </button>
            </div>

            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </header>
    );
});

Header.displayName = 'Header';

export default Header;
