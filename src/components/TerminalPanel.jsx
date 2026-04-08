import React, { memo, useEffect, useRef, useState } from 'react';
import { TerminalSquare, X, GripHorizontal } from 'lucide-react';

const TerminalPanel = memo(({ terminalLogs, onClose }) => {
    const scrollRef = useRef(null);
    const [terminalHeight, setTerminalHeight] = useState(160);
    const [mobileTerminalHeight, setMobileTerminalHeight] = useState(60); // percentage for mobile
    const [isDragging, setIsDragging] = useState(false);
    const [isMobileDragging, setIsMobileDragging] = useState(false);
    const dragRef = useRef(null);
    const mobileDragRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [terminalLogs]);

    const handleMouseDown = (e) => {
        setIsDragging(true);
        dragRef.current = e.clientY;
    };

    const handleMouseMove = (e) => {
        if (!isDragging || !dragRef.current) return;
        
        const deltaY = dragRef.current - e.clientY;
        const newHeight = Math.max(120, Math.min(400, terminalHeight + deltaY));
        setTerminalHeight(newHeight);
        dragRef.current = e.clientY;
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        dragRef.current = null;
    };

    // Mobile touch handlers
    const handleTouchStart = (e) => {
        setIsMobileDragging(true);
        mobileDragRef.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
        if (!isMobileDragging || !mobileDragRef.current) return;
        
        const currentY = e.touches[0].clientY;
        const deltaY = mobileDragRef.current - currentY;
        const viewportHeight = window.innerHeight;
        const deltaPercent = (deltaY / viewportHeight) * 100;
        const newHeight = Math.max(30, Math.min(80, mobileTerminalHeight + deltaPercent));
        setMobileTerminalHeight(newHeight);
        mobileDragRef.current = currentY;
    };

    const handleTouchEnd = () => {
        setIsMobileDragging(false);
        mobileDragRef.current = null;
    };

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, terminalHeight]);

    useEffect(() => {
        if (isMobileDragging) {
            document.addEventListener('touchmove', handleTouchMove, { passive: false });
            document.addEventListener('touchend', handleTouchEnd);
            return () => {
                document.removeEventListener('touchmove', handleTouchMove);
                document.removeEventListener('touchend', handleTouchEnd);
            };
        }
    }, [isMobileDragging, mobileTerminalHeight]);

    return (
        <>
            {/* Desktop Terminal */}
            <footer className="hidden md:flex flex-col" style={{ backgroundColor: 'var(--bg-panel)', borderTop: '1px solid var(--border-color)', height: `${terminalHeight}px` }}>
                {/* Resize Handle */}
                <div 
                    className="flex items-center justify-center cursor-ns-resize hover:bg-hover transition-colors" 
                    style={{ height: '8px', backgroundColor: isDragging ? 'var(--bg-hover)' : 'transparent' }}
                    onMouseDown={handleMouseDown}
                >
                    <GripHorizontal size={16} style={{ color: 'var(--color-muted)', opacity: 0.5 }} />
                </div>
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

            {/* Mobile Terminal - Bottom Sheet Overlay */}
            <div className="md:hidden fixed inset-x-0 bottom-0 bg-main z-50 flex flex-col" style={{ 
                backgroundColor: 'var(--bg-main)', 
                height: `${mobileTerminalHeight}vh`,
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px',
                boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)'
            }}>
                {/* Mobile Resize Handle */}
                <div 
                    className="flex items-center justify-center cursor-ns-resize hover:bg-hover transition-colors" 
                    style={{ height: '12px', backgroundColor: isMobileDragging ? 'var(--bg-hover)' : 'transparent' }}
                    onTouchStart={handleTouchStart}
                >
                    <GripHorizontal size={20} style={{ color: 'var(--color-muted)', opacity: 0.7 }} />
                </div>
                <div className="flex justify-between items-center px-4 py-2 font-bold" style={{ 
                    backgroundColor: 'var(--bg-header)', 
                    borderBottom: '1px solid var(--border-color)', 
                    fontSize: '0.8rem', 
                    color: 'var(--color-muted)'
                }}>
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
