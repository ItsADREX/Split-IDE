import React, { memo } from 'react';
import { X, FileCode, Hash, FileJson } from 'lucide-react';

const getFileIcon = (name) => {
    if (name.endsWith('.js') || name.endsWith('.jsx')) return <FileCode size={12} color="var(--color-teal)" />;
    if (name.endsWith('.css')) return <Hash size={12} color="var(--color-neon-green)" />;
    if (name.endsWith('.py')) return <FileCode size={12} color="#FFD43B" />;
    return <FileJson size={12} color="var(--color-muted)" />;
};

const FileTabs = memo(({ openTabs, activeFile, onSelectTab, onCloseTab }) => {
    if (openTabs.length === 0) return null;

    return (
        <div className="flex items-center bg-panel border-b border-border overflow-x-auto scrollbar-hide" style={{ backgroundColor: 'var(--bg-panel)', borderBottom: '1px solid var(--border-color)', minHeight: '36px' }}>
            {openTabs.map(file => (
                <div
                    key={file}
                    className={`flex items-center gap-1 md:gap-2 px-2 md:px-3 py-2 border-r cursor-pointer transition-colors min-w-0 flex-shrink-0 ${
                        activeFile === file ? 'bg-active text-teal border-b-2 border-teal' : 'hover:bg-hover'
                    }`}
                    style={{
                        backgroundColor: activeFile === file ? 'var(--bg-active)' : 'transparent',
                        color: activeFile === file ? 'var(--color-teal)' : 'var(--color-text)',
                        borderRight: '1px solid var(--border-color)',
                        borderBottom: activeFile === file ? '2px solid var(--color-teal)' : 'none',
                        maxWidth: '150px',
                        minWidth: '80px'
                    }}
                    onClick={() => onSelectTab(file)}
                    onMouseOver={e => {
                        if (activeFile !== file) {
                            e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                        }
                    }}
                    onMouseOut={e => {
                        if (activeFile !== file) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }
                    }}
                >
                    <div className="flex-shrink-0">
                        {getFileIcon(file)}
                    </div>
                    <span className="text-xs md:text-sm truncate flex-1" style={{ fontSize: '0.75rem' }}>
                        {file.split('/').pop()}
                    </span>
                    <button
                        className="opacity-60 hover:opacity-100 hover:text-red-400 p-0.5 md:p-1 rounded transition-all flex-shrink-0"
                        onClick={(e) => {
                            e.stopPropagation();
                            onCloseTab(file);
                        }}
                        style={{ marginLeft: '2px' }}
                    >
                        <X size={10} className="md:hidden" />
                        <X size={12} className="hidden md:block" />
                    </button>
                </div>
            ))}
        </div>
    );
});

FileTabs.displayName = 'FileTabs';

export default FileTabs;
