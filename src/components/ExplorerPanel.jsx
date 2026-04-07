import React, { useMemo, memo } from 'react';
import { FilePlus, FolderPlus, Cloud, FileCode, Hash, FileJson } from 'lucide-react';
import ExplorerNode from './ExplorerNode';

const renderFileIcon = (name) => {
    if (name.endsWith('.js') || name.endsWith('.jsx')) return <FileCode size={14} color="var(--color-teal)" style={{ minWidth: '14px' }} />;
    if (name.endsWith('.css')) return <Hash size={14} color="var(--color-neon-green)" style={{ minWidth: '14px' }} />;
    if (name.endsWith('.py')) return <FileCode size={14} color="#FFD43B" style={{ minWidth: '14px' }} />;
    return <FileJson size={14} color="var(--color-muted)" style={{ minWidth: '14px' }} />;
};

const buildTree = (paths) => {
    const root = { type: 'folder', name: 'root', path: '', children: [] };
    paths.forEach(path => {
        const parts = path.split('/');
        let current = root;
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            const isFile = i === parts.length - 1;
            const currentPath = parts.slice(0, i + 1).join('/');

            let node = current.children.find(c => c.name === part);
            if (!node) {
                node = {
                    name: part,
                    path: currentPath,
                    type: isFile && part !== '.keep' ? 'file' : 'folder',
                    children: [],
                    icon: isFile && part !== '.keep' ? renderFileIcon(part) : null
                };
                if (part !== '.keep') current.children.push(node);
            }
            current = node;
        }
    });
    const sortTree = (node) => {
        node.children.sort((a, b) => {
            if (a.type === b.type) return a.name.localeCompare(b.name);
            return a.type === 'folder' ? -1 : 1;
        });
        node.children.forEach(sortTree);
    };
    sortTree(root);
    return root.children;
};

const ExplorerPanel = memo(({ files, activeFile, openFolders, selectFile, toggleFolder, handleDragStart, handleDrop, newFile, newFolder, uploadFile, deleteFile, renameFile, duplicateFile }) => {
    const tree = useMemo(() => buildTree(files), [files]);

    return (
        <aside className="w-full md:w-64 h-full flex flex-col" style={{ backgroundColor: 'var(--bg-panel)', borderRight: '1px solid var(--border-color)' }}>
            <div className="flex justify-between items-center px-3 md:px-4 py-3" style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-muted)', letterSpacing: '1px' }}>
                <span>EXPLORER</span>
                <div className="flex gap-1 md:gap-2">
                    <button className="icon-btn" title="New File" onClick={newFile}><FilePlus size={12} /></button>
                    <button className="icon-btn" title="New Folder" onClick={newFolder}><FolderPlus size={12} /></button>
                    <button className="icon-btn" title="Upload" onClick={uploadFile}><Cloud size={12} /></button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto py-2 list-none" onDragOver={e => e.preventDefault()} onDrop={e => handleDrop(e, '')}>
                {tree.map(node => (
                    <ExplorerNode
                        key={node.path} node={node} level={0}
                        onSelect={selectFile} activeFile={activeFile} onCollapse={toggleFolder}
                        openFolders={openFolders} onDragStart={handleDragStart} onDrop={handleDrop}
                        onDelete={deleteFile} onRename={renameFile} onDuplicate={duplicateFile}
                    />
                ))}
            </div>
        </aside>
    );
});

ExplorerPanel.displayName = 'ExplorerPanel';

export default ExplorerPanel;
