import React, { memo, useState } from 'react';
import { ChevronRight, ChevronDown, Folder } from 'lucide-react';
import ContextMenu from './ContextMenu';

const ExplorerNode = memo(({ node, level, onSelect, activeFile, onCollapse, openFolders, onDragStart, onDrop, onDelete, onRename, onDuplicate }) => {
    const isFolder = node.type === "folder";
    const isOpen = openFolders[node.path];
    const [contextMenu, setContextMenu] = useState(null);

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isFolder) onDrop(e, node.path);
    };

    const handleContextMenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isFolder) {
            setContextMenu({
                x: e.clientX,
                y: e.clientY,
                fileName: node.path
            });
        }
    };

    const handleRename = () => {
        const newName = prompt('Enter new name:', node.name);
        if (newName && newName !== node.name) {
            const newPath = node.path.includes('/') 
                ? node.path.substring(0, node.path.lastIndexOf('/') + 1) + newName
                : newName;
            onRename(node.path, newPath);
        }
    };

    return (
        <div className="w-full" style={{ userSelect: 'none' }}>
            <div
                draggable
                onDragStart={(e) => { e.stopPropagation(); onDragStart(e, node.path, node.type); }}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={handleDrop}
                onClick={(e) => { e.stopPropagation(); isFolder ? onCollapse(node.path) : onSelect(node.path); }}
                onContextMenu={handleContextMenu}
                style={{
                    display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '4px 8px',
                    paddingLeft: `${level * 12 + 8}px`,
                    backgroundColor: activeFile === node.path ? 'var(--bg-active)' : 'transparent',
                    color: activeFile === node.path ? 'var(--color-teal)' : 'var(--color-text)',
                    borderLeft: activeFile === node.path ? '3px solid var(--color-teal)' : '3px solid transparent'
                }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = activeFile !== node.path ? 'var(--bg-hover)' : 'var(--bg-active)'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = activeFile === node.path ? 'var(--bg-active)' : 'transparent'}
            >
                {isFolder ? (
                    isOpen ? <ChevronDown size={14} style={{ opacity: 0.7 }} /> : <ChevronRight size={14} style={{ opacity: 0.7 }} />
                ) : (
                    <span style={{ width: '14px' }}></span>
                )}
                {isFolder ? <Folder size={14} style={{ color: '#60a5fa', opacity: 0.8, minWidth: '14px' }} /> : node.icon}
                <span style={{ fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{node.name}</span>
            </div>
            {isFolder && isOpen && node.children && node.children.map(child => (
                <ExplorerNode
                    key={child.path} node={child} level={level + 1}
                    onSelect={onSelect} activeFile={activeFile} onCollapse={onCollapse}
                    openFolders={openFolders} onDragStart={onDragStart} onDrop={onDrop}
                    onDelete={onDelete} onRename={onRename} onDuplicate={onDuplicate}
                />
            ))}
            
            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    fileName={contextMenu.fileName}
                    onClose={() => setContextMenu(null)}
                    onDelete={() => onDelete(contextMenu.fileName)}
                    onRename={handleRename}
                    onDuplicate={() => onDuplicate(contextMenu.fileName)}
                />
            )}
        </div>
    );
});

ExplorerNode.displayName = 'ExplorerNode';

export default ExplorerNode;
