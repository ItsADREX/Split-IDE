import React, { memo, useEffect, useRef } from 'react';
import { Trash2, Edit3, Copy } from 'lucide-react';

const ContextMenu = memo(({ x, y, onClose, onDelete, onRename, onDuplicate, fileName }) => {
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onClose]);

    const handleAction = (action) => {
        action();
        onClose();
    };

    return (
        <div
            ref={menuRef}
            className="fixed z-50 bg-panel border border-border rounded-md shadow-lg py-1 min-w-48 context-menu"
            style={{
                left: x,
                top: y,
                backgroundColor: 'var(--bg-panel)',
                border: '1px solid var(--border-color)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                minWidth: '160px'
            }}
        >
            <button
                className="w-full px-3 py-2 text-left text-sm hover:bg-hover flex items-center gap-2 transition-colors"
                onClick={() => handleAction(onRename)}
                style={{ color: 'var(--color-text)' }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
                <Edit3 size={14} />
                Rename
            </button>
            <button
                className="w-full px-3 py-2 text-left text-sm hover:bg-hover flex items-center gap-2 transition-colors"
                onClick={() => handleAction(onDuplicate)}
                style={{ color: 'var(--color-text)' }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
                <Copy size={14} />
                Duplicate
            </button>
            <div className="h-px bg-border my-1" style={{ backgroundColor: 'var(--border-color)' }}></div>
            <button
                className="w-full px-3 py-2 text-left text-sm hover:bg-red-900/20 flex items-center gap-2 transition-colors text-red-400"
                onClick={() => handleAction(onDelete)}
                onMouseOver={e => {
                    e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                    e.currentTarget.style.color = '#f87171';
                }}
                onMouseOut={e => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#f87171';
                }}
            >
                <Trash2 size={14} />
                Delete
            </button>
        </div>
    );
});

ContextMenu.displayName = 'ContextMenu';

export default ContextMenu;
