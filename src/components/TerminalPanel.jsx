import React, { memo, useEffect, useRef } from 'react';
import { TerminalSquare, X } from 'lucide-react';

const TerminalPanel = memo(({ terminalLogs, onClose }) => {
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [terminalLogs]);

    return (
        <>
            {/* Desktop Terminal */}
            <footer className="hidden md:flex h-40 flex-col" style={{ backgroundColor: 'var(--bg-panel)', borderTop: '1px solid var(--border-color)' }}>
                <div className="flex justify-between items-center px-4 py-2 font-bold" style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.7rem', color: 'var(--color-muted)' }}>
                    <span className="flex items-center gap-1">
                        <TerminalSquare size={12} /> 
                        <span>TERMINAL</span>
                    </span>
                    <button onClick={onClose} className="icon-btn"><X size={12} /></button>
                </div>
                <div ref={scrollRef} className="flex-1 p-3 overflow-y-auto font-mono text-sm leading-relaxed terminal-scroll" id="terminal-content">
                    {terminalLogs.map((log, i) => (
                        <div key={i} className="mb-1">
                            <span style={{ color: 'var(--color-neon-green)' }}>split-ide ~/project $</span>
                            <span style={{ 
                                color: log.type === 'error' ? '#ff4d4d' : (log.type === 'success' ? 'var(--color-teal)' : 'var(--color-text)'), 
                                marginLeft: '8px', 
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word'
                            }}>
                                {log.msg}
                            </span>
                        </div>
                    ))}
                </div>
            </footer>

            {/* Mobile Terminal - Full Page Overlay */}
            <div className="md:hidden fixed inset-0 bg-main z-50 flex flex-col" style={{ backgroundColor: 'var(--bg-main)' }}>
                <div className="flex justify-between items-center px-4 py-3 font-bold" style={{ backgroundColor: 'var(--bg-header)', borderBottom: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--color-muted)' }}>
                    <span className="flex items-center gap-2">
                        <TerminalSquare size={16} /> 
                        <span>TERMINAL</span>
                    </span>
                    <button onClick={onClose} className="icon-btn"><X size={16} /></button>
                </div>
                <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto font-mono text-sm leading-relaxed terminal-scroll" style={{ backgroundColor: 'var(--bg-main)' }}>
                    {terminalLogs.map((log, i) => (
                        <div key={i} className="mb-2">
                            <span style={{ color: 'var(--color-neon-green)' }}>$ </span>
                            <span style={{ 
                                color: log.type === 'error' ? '#ff4d4d' : (log.type === 'success' ? 'var(--color-teal)' : 'var(--color-text)'), 
                                marginLeft: '4px', 
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word'
                            }}>
                                {log.msg}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
});

TerminalPanel.displayName = 'TerminalPanel';

export default TerminalPanel;
