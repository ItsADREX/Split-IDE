import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { supabase } from './lib/supabase';
import { Play, UploadCloud, FolderPlus, FilePlus, Cloud, Terminal as TermIcon, FileCode, Hash, FileJson, X, Menu, TerminalSquare, ChevronRight, ChevronDown, Folder } from 'lucide-react';
import './index.css';

const ExplorerNode = ({ node, level, onSelect, activeFile, onCollapse, openFolders, onDragStart, onDrop, onDragOver }) => {
    const isFolder = node.type === "folder";
    const isOpen = openFolders[node.path];

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isFolder) onDrop(e, node.path);
    };

    return (
        <div className="w-full" style={{ userSelect: 'none' }}>
            <div
                draggable
                onDragStart={(e) => { e.stopPropagation(); onDragStart(e, node.path, node.type); }}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={handleDrop}
                onClick={(e) => { e.stopPropagation(); isFolder ? onCollapse(node.path) : onSelect(node.path); }}
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
                    openFolders={openFolders} onDragStart={onDragStart} onDrop={onDrop} onDragOver={onDragOver}
                />
            ))}
        </div>
    );
};

export default function App() {
    const [files, setFiles] = useState([]);
    const [activeFile, setActiveFile] = useState(null);
    const [content, setContent] = useState('// React Code Editor Loaded\n');
    const [fileCache, setFileCache] = useState({});
    const [terminalLogs, setTerminalLogs] = useState([{ msg: "Split IDE terminal ready.", type: "success" }]);
    const [openFolders, setOpenFolders] = useState({});
    const [panels, setPanels] = useState({ explorer: true, ai: false, terminal: false });
    const debounceRef = useRef(null);

    const stateRef = useRef({ activeFile: null, content: '' });
    useEffect(() => {
        stateRef.current = { activeFile, content };
    }, [activeFile, content]);

    const logTerm = (msg, type = "normal") => {
        setTerminalLogs(prev => [...prev, { msg, type }]);
        setPanels(p => ({ ...p, terminal: true }));
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    const syncToLocalStorage = (cacheMap) => {
        try {
            const lsData = Object.keys(cacheMap).map(k => ({ filename: k, content: cacheMap[k] }));
            localStorage.setItem('split_ide_files', JSON.stringify(lsData));
        } catch (e) { }
    };

    const fetchFiles = async () => {
        let preloadedData = [];
        try {
            const { data, error } = await supabase.from('files').select('*');
            if (error) throw error;
            preloadedData = data;
        } catch (err) {
            logTerm("Cloud disconnected. Loaded files securely via robust Offline Engine.", "error");
            const local = localStorage.getItem('split_ide_files');
            if (local) preloadedData = JSON.parse(local);
        }

        if (preloadedData && preloadedData.length > 0) {
            localStorage.setItem('split_ide_files', JSON.stringify(preloadedData));
            const cache = {};
            const names = [];

            preloadedData.forEach(d => {
                cache[d.filename] = d.content || "";
                names.push(d.filename);
            });

            setFileCache(cache);
            setFiles(names);

            const baseDirs = {};
            names.forEach(f => {
                const parts = f.split('/');
                parts.forEach((_, i) => {
                    if (i < parts.length - 1) baseDirs[parts.slice(0, i + 1).join('/')] = true;
                });
            });
            setOpenFolders(baseDirs);

            selectFile(names[0], cache[names[0]]);
        } else {
            setFiles(['app.js']);
            selectFile('app.js', '// Offline Local Workspace Loaded\n');
        }
    };

    const selectFile = async (filename, predefinedContent = null) => {
        const curRef = stateRef.current;

        if (curRef.activeFile) {
            setFileCache(prev => {
                const nc = { ...prev, [curRef.activeFile]: curRef.content };
                syncToLocalStorage(nc);
                return nc;
            });
        }

        setActiveFile(filename);

        if (predefinedContent !== null) {
            setContent(predefinedContent);
        } else if (fileCache[filename] !== undefined) {
            setContent(fileCache[filename]);
        } else {
            setContent('// Data Missing from Store. Reload tree.\n');
        }
    };

    const handleEditorChange = (value) => {
        setContent(value);

        setFileCache(prev => {
            const nc = { ...prev, [activeFile]: value };
            syncToLocalStorage(nc);
            return nc;
        });

        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            try {
                await supabase.from('files').upsert({ filename: activeFile, content: value }, { onConflict: 'filename' });
            } catch (e) { }
        }, 1500);
    };

    const executeCode = async () => {
        logTerm(`> Executing ${activeFile}...`, "success");

        if (activeFile && activeFile.endsWith('.js')) {
            const originalLog = console.log;
            console.log = (...args) => logTerm(args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' '));
            try {
                const out = new Function(content)();
                if (out !== undefined) logTerm(`Output: ${out}`);
            } catch (e) {
                logTerm(`${e.message}`, "error");
            }
            console.log = originalLog;
        }
        else if (activeFile && activeFile.endsWith('.py')) {
            try {
                logTerm("Initializing Python Sandbox...");
                if (!window.pyodide) {
                    window.pyodide = await window.loadPyodide();
                }
                window.pyodide.setStdout({ batched: (msg) => logTerm(msg) });
                await window.pyodide.runPythonAsync(content);
            } catch (err) {
                logTerm(`Python Error: ${err.message}`, "error");
            }
        }
        else {
            logTerm("Cannot execute this file automatically (non JS/PY).", "error");
        }
    };

    const getLanguage = (file) => {
        if (!file) return 'javascript';
        if (file.endsWith('.css')) return 'css';
        if (file.endsWith('.html')) return 'html';
        if (file.endsWith('.json')) return 'json';
        if (file.endsWith('.py')) return 'python';
        return 'javascript';
    };

    const togglePanel = (p) => setPanels(curr => ({ ...curr, [p]: !curr[p] }));

    const renderFileIcon = (name) => {
        if (name.endsWith('.js')) return <FileCode size={14} color="var(--color-teal)" style={{ minWidth: '14px' }} />;
        if (name.endsWith('.css')) return <Hash size={14} color="var(--color-neon-green)" style={{ minWidth: '14px' }} />;
        if (name.endsWith('.py')) return <FileCode size={14} color="#FFD43B" style={{ minWidth: '14px' }} />;
        return <FileJson size={14} color="var(--color-muted)" style={{ minWidth: '14px' }} />;
    };

    const handleEditorMount = (editor, monaco) => {
        monaco.editor.defineTheme('split-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [],
            colors: { 'editor.background': '#0b0e14' }
        });
        monaco.editor.setTheme('split-dark');
    };

    const uploadFile = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.onchange = e => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = async (re) => {
                    const name = file.name;
                    const fileData = re.target.result || "";

                    if (!files.includes(name)) setFiles(prev => [...prev, name]);
                    setFileCache(prev => {
                        const nc = { ...prev, [name]: fileData };
                        syncToLocalStorage(nc);
                        return nc;
                    });
                    selectFile(name, fileData);
                    logTerm(`Imported ${name}`, "success");

                    try {
                        await supabase.from('files').upsert({ filename: name, content: fileData }, { onConflict: 'filename' });
                    } catch (err) { }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    };

    const newFolder = () => {
        const f = prompt("Folder name:");
        if (f) {
            const name = `${f}/.keep`;
            if (!files.includes(name)) setFiles([...files, name]);
            setOpenFolders(prev => ({ ...prev, [f]: true }));
            try {
                supabase.from('files').upsert({ filename: name, content: "// folder hook" }, { onConflict: 'filename' });
            } catch (err) { }
        }
    };

    const handleDragStart = (e, path, type) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({ path, type }));
    };

    const handleDrop = async (e, targetFolder) => {
        e.preventDefault();
        const data = e.dataTransfer.getData('text/plain');
        if (!data) return;
        const { path: sourcePath, type: isFolder } = JSON.parse(data);

        if (sourcePath === targetFolder || sourcePath.startsWith(targetFolder + '/')) return;

        const sourceName = sourcePath.split('/').pop();
        const newBasePath = targetFolder === '' ? sourceName : `${targetFolder}/${sourceName}`;

        let updatedFiles = [...files];
        const updates = [];

        if (isFolder === 'folder') {
            updatedFiles = updatedFiles.map(f => {
                if (f.startsWith(sourcePath + '/') || f === sourcePath) {
                    const relative = f.slice(sourcePath.length);
                    const newPath = newBasePath + relative;
                    updates.push({ old: f, new: newPath });
                    return newPath;
                }
                return f;
            });

            if (updates.some(u => u.old === activeFile)) setActiveFile(updates.find(u => u.old === activeFile).new);
        } else {
            if (updatedFiles.includes(newBasePath)) return logTerm("File target clash.", "error");
            updates.push({ old: sourcePath, new: newBasePath });
            updatedFiles = updatedFiles.map(f => f === sourcePath ? newBasePath : f);
            if (activeFile === sourcePath) setActiveFile(newBasePath);
        }

        setFiles(updatedFiles);

        setFileCache(prev => {
            const newCache = { ...prev };
            updates.forEach(u => {
                newCache[u.new] = newCache[u.old] || '';
                delete newCache[u.old];
            });
            syncToLocalStorage(newCache);
            return newCache;
        });

        try {
            for (let u of updates) {
                const fileData = await supabase.from('files').select('content').eq('filename', u.old).single();
                if (fileData.data) {
                    await supabase.from('files').upsert({ filename: u.new, content: fileData.data.content }, { onConflict: 'filename' });
                    await supabase.from('files').delete().eq('filename', u.old);
                }
            }
        } catch (err) { }
    };

    const toggleFolder = (path) => setOpenFolders(prev => ({ ...prev, [path]: !prev[path] }));

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
                    node = { name: part, path: currentPath, type: isFile && part !== '.keep' ? 'file' : 'folder', children: [], icon: isFile && part !== '.keep' ? renderFileIcon(part) : null };
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

    return (
        <div className="flex flex-col h-full w-full">
            <header className="flex items-center justify-between px-4" style={{ backgroundColor: 'var(--bg-header)', borderBottom: '1px solid var(--border-color)', height: '50px' }}>
                <div className="font-bold tracking-wider" style={{ color: 'var(--color-text)' }}>SPLIT<span style={{ color: 'var(--color-teal)', textShadow: '0 0 8px rgba(0, 240, 255, 0.4)' }}>IDE</span></div>
                <div className="flex items-center gap-2">
                    <button className="action-btn" onClick={executeCode} style={{ backgroundColor: 'var(--color-neon-green)', color: 'var(--bg-main)', fontWeight: 800 }}>
                        <Play size={14} className="mr-1" /> RUN SCRIPT
                    </button>
                    <button className="action-btn" onClick={() => logTerm("Preparing for Netlify API release...", "success")} style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                        <UploadCloud size={14} className="mr-1" /> PUBLISH
                    </button>
                    <div style={{ width: 1, height: 20, background: 'var(--border-color)', margin: '0 8px' }} />

                    <button className={`action-btn ${panels.explorer ? 'active' : ''}`} onClick={() => togglePanel('explorer')} title="Explorer"><Menu size={16} /></button>
                    <button className={`action-btn ${panels.terminal ? 'active' : ''}`} onClick={() => togglePanel('terminal')} title="Terminal"><TerminalSquare size={16} /></button>
                    <button className={`action-btn ${panels.ai ? 'active' : ''}`} onClick={() => togglePanel('ai')} style={{ color: 'var(--color-neon-green)' }}>✨ AI</button>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden relative">
                {panels.explorer && (
                    <aside className="w-64 flex flex-col" style={{ backgroundColor: 'var(--bg-panel)', borderRight: '1px solid var(--border-color)' }}>
                        <div className="flex justify-between items-center px-4 py-3" style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-muted)', letterSpacing: '1px' }}>
                            <span>EXPLORER</span>
                            <div className="flex gap-2">
                                <button className="icon-btn" title="New File" onClick={() => { const f = prompt("File name (e.g. scripts/util.js):"); if (f && !files.includes(f)) { setFiles([...files, f]); selectFile(f, "// Blank File"); } }}><FilePlus size={14} /></button>
                                <button className="icon-btn" title="New Folder" onClick={newFolder}><FolderPlus size={14} /></button>
                                <button className="icon-btn" title="Upload" onClick={uploadFile}><Cloud size={14} /></button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto py-2 list-none" onDragOver={e => e.preventDefault()} onDrop={e => handleDrop(e, '')}>
                            {buildTree(files).map(node => (
                                <ExplorerNode key={node.path} node={node} level={0} onSelect={selectFile} activeFile={activeFile} onCollapse={toggleFolder} openFolders={openFolders} onDragStart={handleDragStart} onDrop={handleDrop} />
                            ))}
                        </div>
                    </aside>
                )}

                <section className="flex-1 overflow-hidden" style={{ backgroundColor: 'var(--bg-main)' }}>
                    <Editor height="100%" language={getLanguage(activeFile)} value={content} onChange={handleEditorChange} onMount={handleEditorMount} theme="split-dark" options={{ minimap: { enabled: false }, fontFamily: 'Fira Code', fontSize: 14 }} />
                </section>

                {panels.ai && (
                    <aside className="w-80 flex flex-col" style={{ backgroundColor: 'var(--bg-main)', borderLeft: '1px solid var(--border-color)' }}>
                        <div className="flex justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border-color)', color: 'var(--color-teal)', fontWeight: 600 }}>
                            <span>✨ AI ASSISTANT</span>
                            <button onClick={() => togglePanel('ai')} className="icon-btn"><X size={16} /></button>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto">
                            <div className="p-3 mb-2 rounded-md" style={{ background: 'rgba(0, 240, 255, 0.05)', border: '1px solid rgba(0, 240, 255, 0.2)' }}><strong style={{ color: 'var(--color-teal)' }}>SplitAI:</strong> I'm your React IDE AI Assistant! I can manipulate your Monaco code files anytime.</div>
                        </div>
                        <div className="p-3 flex gap-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
                            <input type="text" placeholder="Prompt..." className="flex-1 bg-transparent p-2 rounded text-white" style={{ border: '1px solid var(--border-color)' }} />
                            <button className="px-3 rounded font-bold" style={{ backgroundColor: 'var(--color-teal)', color: 'var(--bg-main)' }}>Go</button>
                        </div>
                    </aside>
                )}
            </main>

            {panels.terminal && (
                <footer className="h-40 flex flex-col" style={{ backgroundColor: 'var(--bg-panel)', borderTop: '1px solid var(--border-color)' }}>
                    <div className="flex justify-between items-center px-4 py-2 font-bold" style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                        <span className="flex items-center gap-1"><TermIcon size={12} /> TERMINAL</span>
                        <button onClick={() => togglePanel('terminal')} className="icon-btn"><X size={14} /></button>
                    </div>
                    <div className="flex-1 p-2 overflow-y-auto font-mono text-sm leading-relaxed" id="terminal-content">
                        {terminalLogs.map((log, i) => (
                            <div key={i}>
                                <span style={{ color: 'var(--color-neon-green)' }}>split-ide ~/project $</span>
                                <span style={{ color: log.type === 'error' ? '#ff4d4d' : (log.type === 'success' ? 'var(--color-teal)' : 'var(--color-text)'), marginLeft: '8px', whiteSpace: 'pre-wrap' }}>{log.msg}</span>
                            </div>
                        ))}
                    </div>
                </footer>
            )}
        </div>
    );
}
