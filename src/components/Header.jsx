import React, { memo } from 'react';
import { Play, UploadCloud, Menu, TerminalSquare } from 'lucide-react';

const Header = memo(({ panels, togglePanel, executeCode, uploadFile }) => {
    return (
        <header className="flex items-center px-4" style={{ backgroundColor: 'var(--bg-header)', borderBottom: '1px solid var(--border-color)', height: '50px' }}>
            {/* Desktop hamburger menu on the left */}
            <div className="hidden md:flex items-center gap-2">
                <button className={`action-btn ${panels.explorer ? 'active' : ''}`} onClick={() => togglePanel('explorer')} title="Explorer">
                    <Menu size={16} />
                </button>
            </div>
            
            {/* Mobile hamburger menu on the left */}
            <div className="flex items-center gap-2 md:hidden">
                <button className={`action-btn ${panels.explorer ? 'active' : ''}`} onClick={() => togglePanel('explorer')} title="Explorer">
                    <Menu size={16} />
                </button>
            </div>
            
            {/* Logo - centered on mobile, left on desktop */}
            <div className="flex-1 md:flex-none font-bold tracking-wider text-center md:text-left md:ml-4" style={{ color: 'var(--color-text)' }}>
                SPLIT<span style={{ color: 'var(--color-teal)', textShadow: '0 0 8px rgba(0, 240, 255, 0.4)' }}>IDE</span>
            </div>
            
            {/* Desktop controls */}
            <div className="hidden md:flex items-center gap-2 flex-1 justify-end">
                <button className="action-btn" onClick={executeCode} style={{ backgroundColor: 'var(--color-neon-green)', color: 'var(--bg-main)', fontWeight: 800 }}>
                    <Play size={14} className="mr-1" /> 
                    <span className="hidden lg:inline">RUN SCRIPT</span>
                    <span className="lg:hidden">RUN</span>
                </button>
                <button className="action-btn" onClick={uploadFile} style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                    <UploadCloud size={14} className="mr-1" /> 
                    <span className="hidden lg:inline">UPLOAD</span>
                </button>
                <div style={{ width: 1, height: 20, background: 'var(--border-color)', margin: '0 8px' }} />
                <button className={`action-btn ${panels.terminal ? 'active' : ''}`} onClick={() => togglePanel('terminal')} title="Terminal">
                    <TerminalSquare size={16} />
                </button>
                <button className={`action-btn ${panels.ai ? 'active' : ''}`} onClick={() => togglePanel('ai')} style={{ color: 'var(--color-neon-green)' }}>
                    ✨ <span className="hidden lg:inline">AI</span>
                </button>
            </div>
            
            {/* Mobile action buttons */}
            <div className="flex items-center gap-1 md:hidden">
                <button className="action-btn" onClick={executeCode} style={{ backgroundColor: 'var(--color-neon-green)', color: 'var(--bg-main)', fontWeight: 800, padding: '6px 8px' }}>
                    <Play size={14} />
                </button>
                <button className={`action-btn ${panels.terminal ? 'active' : ''}`} onClick={() => togglePanel('terminal')} title="Terminal">
                    <TerminalSquare size={14} />
                </button>
                <button className={`action-btn ${panels.ai ? 'active' : ''}`} onClick={() => togglePanel('ai')} style={{ color: 'var(--color-neon-green)' }}>
                    ✨
                </button>
            </div>
        </header>
    );
});

Header.displayName = 'Header';

export default Header;
