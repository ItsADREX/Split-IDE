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
        <footer className="h-32 md:h-40 flex flex-col" style={{ backgroundColor: 'var(--bg-panel)', borderTop: '1px solid var(--border-color)' }}>
            <div className="flex justify-between items-center px-3 md:px-4 py-2 font-bold" style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.7rem', color: 'var(--color-muted)' }}>
                <span className="flex items-center gap-1">
                    <TerminalSquare size={12} /> 
                    <span className="hidden sm:inline">TERMINAL</span>
                </span>
                <button onClick={onClose} className="icon-btn"><X size={12} /></button>
            </div>
            <div ref={scrollRef} className="flex-1 p-2 md:p-3 overflow-y-auto font-mono text-xs md:text-sm leading-relaxed" id="terminal-content">
                {terminalLogs.map((log, i) => (
                    <div key={i} className="mb-1">
                        <span className="hidden sm:inline" style={{ color: 'var(--color-neon-green)' }}>split-ide ~/project $</span>
                        <span className="sm:hidden" style={{ color: 'var(--color-neon-green)' }}>$</span>
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
        </footer>
    );
});

TerminalPanel.displayName = 'TerminalPanel';

export default TerminalPanel;
