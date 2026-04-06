import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { supabase } from './lib/supabase';
import { Play, UploadCloud, FolderPlus, FilePlus, Cloud, Terminal as TermIcon, FileCode, Hash, FileJson, X, Menu, TerminalSquare } from 'lucide-react';
import './index.css';

export default function App() {
    const [files, setFiles] = useState([]);
    const [activeFile, setActiveFile] = useState(null);
    const [content, setContent] = useState('// React Code Editor Loaded\n');
    const [fileCache, setFileCache] = useState({}); // { [filename]: content }
    const [terminalLogs, setTerminalLogs] = useState([{ msg: "Split IDE terminal ready.", type: "success" }]);

    const [panels, setPanels] = useState({ explorer: true, ai: false, terminal: false });
    const debounceRef = useRef(null);

    const logTerm = (msg, type = "normal") => {
        setTerminalLogs(prev => [...prev, { msg, type }]);
        setPanels(p => ({ ...p, terminal: true }));
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        try {
            const { data } = await supabase.from('files').select('filename');
            if (data && data.length > 0) {
                setFiles(data.map(d => d.filename));
                selectFile(data[0].filename);
            } else {
                setFiles(['app.js', 'styles.css', 'index.html']);
                selectFile('app.js');
            }
        } catch (err) {
            logTerm("Supabase Connection failed.", "error");
        }
    };

    const selectFile = async (filename) => {
        // Save current active file to cache before switching
        if (activeFile) {
            setFileCache(prev => ({ ...prev, [activeFile]: content }));
        }

        setActiveFile(filename);

        if (fileCache[filename] !== undefined) {
            setContent(fileCache[filename]);
        } else {
            setContent('// Loading...');
            const { data } = await supabase.from('files').select('content').eq('filename', filename).single();
            if (data) {
                setContent(data.content || "");
                setFileCache(prev => ({ ...prev, [filename]: data.content || "" }));
            } else {
                setContent(`// Virtual File: ${filename}`);
            }
        }
    };

    const handleEditorChange = (value) => {
        setContent(value);
        setFileCache(prev => ({ ...prev, [activeFile]: value })); // sync cache
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            await supabase.from('files').upsert({ filename: activeFile, content: value }, { onConflict: 'filename' });
        }, 1500);
    };

    const executeCode = async () => {
        logTerm(`> Executing ${activeFile}...`, "success");

        if (activeFile && activeFile.endsWith('.js')) {
            // Capture console logs during execution
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
                logTerm("Initializing Python Runtime (Pyodide)...");
                if (!window.pyodide) {
                    window.pyodide = await window.loadPyodide();
                }

                // Capture Python stdout
                window.pyodide.setStdout({ batched: (msg) => logTerm(msg) });

                await window.pyodide.runPythonAsync(content);
            } catch (err) {
                logTerm(`Python Error: ${err.message}`, "error");
            }
        }
        else {
            logTerm("Cannot execute this file type natively.", "error");
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
        if (name.endsWith('.js')) return <FileCode size={14} color="var(--color-teal)" />;
        if (name.endsWith('.css')) return <Hash size={14} color="var(--color-neon-green)" />;
        if (name.endsWith('.py')) return <FileCode size={14} color="#FFD43B" />;
        return <FileJson size={14} color="var(--color-muted)" />;
    };

    // Editor Mount for custom dark theme config
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
                    await supabase.from('files').upsert({ filename: name, content: re.target.result }, { onConflict: 'filename' });
                    if (!files.includes(name)) setFiles(prev => [...prev, name]);
                    setFileCache(prev => ({ ...prev, [name]: re.target.result }));
                    selectFile(name);
                    logTerm(`Uploaded ${name}`, "success");
                };
                reader.readAsText(file);
            }
        };
        input.click();
    };

    const newFolder = () => {
        const f = prompt("Folder name:");
        if (f) {
            // Mock folders by creating a ".keep" file and letting the UI list it
            const name = `${f}/.keep`;
            setFiles([...files, name]);
            setFileCache(prev => ({ ...prev, [name]: "// folder hook" }));
            supabase.from('files').upsert({ filename: name, content: "// folder hook" }, { onConflict: 'filename' });
        }
    };

    return (
        <div className="flex flex-col h-full w-full">
            {/* HEADER */}
            <header className="flex items-center justify-between px-4" style={{ backgroundColor: 'var(--bg-header)', borderBottom: '1px solid var(--border-color)', height: '50px' }}>
                <div className="font-bold tracking-wider" style={{ color: 'var(--color-text)' }}>SPLIT<span style={{ color: 'var(--color-teal)', textShadow: '0 0 8px rgba(0, 240, 255, 0.4)' }}>IDE</span></div>
                <div className="flex items-center gap-2">
                    <button className="action-btn" onClick={executeCode} style={{ backgroundColor: 'var(--color-neon-green)', color: 'var(--bg-main)', fontWeight: 800 }}>
                        <Play size={14} className="mr-1" /> RUN SCRIPT
                    </button>
                    <button className="action-btn" onClick={() => { }} style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                        <UploadCloud size={14} className="mr-1" /> PUBLISH
                    </button>
                    <div style={{ width: 1, height: 20, background: 'var(--border-color)', margin: '0 8px' }} />

                    <button className={`action-btn ${panels.explorer ? 'active' : ''}`} onClick={() => togglePanel('explorer')} title="Explorer">
                        <Menu size={16} />
                    </button>
                    <button className={`action-btn ${panels.terminal ? 'active' : ''}`} onClick={() => togglePanel('terminal')} title="Terminal">
                        <TerminalSquare size={16} />
                    </button>
                    <button className={`action-btn ${panels.ai ? 'active' : ''}`} onClick={() => togglePanel('ai')} style={{ color: 'var(--color-neon-green)' }}>✨ AI</button>
                </div>
            </header>

            {/* BODY */}
            <main className="flex-1 flex overflow-hidden relative">

                {/* EXPLORER */}
                {panels.explorer && (
                    <aside className="w-64 flex flex-col" style={{ backgroundColor: 'var(--bg-panel)', borderRight: '1px solid var(--border-color)' }}>
                        <div className="flex justify-between items-center px-4 py-3" style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-muted)', letterSpacing: '1px' }}>
                            <span>EXPLORER</span>
                            <div className="flex gap-2">
                                <button className="icon-btn" title="New File" onClick={() => { const f = prompt("File name:"); if (f && !files.includes(f)) { setFiles([...files, f]); selectFile(f); } }}><FilePlus size={14} /></button>
                                <button className="icon-btn" title="New Folder" onClick={newFolder}><FolderPlus size={14} /></button>
                                <button className="icon-btn" title="Upload" onClick={uploadFile}><Cloud size={14} /></button>
                            </div>
                        </div>
                        <ul className="flex-1 overflow-y-auto py-2 list-none">
                            {files.map(f => (
                                <li key={f}
                                    className="px-4 py-2 cursor-pointer flex items-center gap-2"
                                    style={{
                                        borderLeft: activeFile === f ? '3px solid var(--color-teal)' : '3px solid transparent',
                                        backgroundColor: activeFile === f ? 'var(--bg-active)' : 'transparent',
                                        color: activeFile === f ? 'var(--color-teal)' : 'inherit',
                                        fontSize: '0.9rem'
                                    }}
                                    onClick={() => selectFile(f)}
                                >
                                    {renderFileIcon(f)}
                                    {f}
                                </li>
                            ))}
                        </ul>
                    </aside>
                )}

                {/* EDITOR */}
                <section className="flex-1 overflow-hidden" style={{ backgroundColor: 'var(--bg-main)' }}>
                    <Editor
                        height="100%"
                        language={getLanguage(activeFile)}
                        value={content}
                        onChange={handleEditorChange}
                        onMount={handleEditorMount}
                        theme="split-dark"
                        options={{ minimap: { enabled: false }, fontFamily: 'Fira Code', fontSize: 14 }}
                    />
                </section>

                {/* AI PANEL */}
                {panels.ai && (
                    <aside className="w-80 flex flex-col" style={{ backgroundColor: 'var(--bg-main)', borderLeft: '1px solid var(--border-color)' }}>
                        <div className="flex justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border-color)', color: 'var(--color-teal)', fontWeight: 600 }}>
                            <span>✨ AI ASSISTANT</span>
                            <button onClick={() => togglePanel('ai')} className="icon-btn"><X size={16} /></button>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto">
                            <div className="p-3 mb-2 rounded-md" style={{ background: 'rgba(0, 240, 255, 0.05)', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
                                <strong style={{ color: 'var(--color-teal)' }}>SplitAI:</strong> I'm your React IDE AI Assistant! I can manipulate your Monaco code files anytime.
                            </div>
                        </div>
                        <div className="p-3 flex gap-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
                            <input type="text" placeholder="Prompt..." className="flex-1 bg-transparent p-2 rounded text-white" style={{ border: '1px solid var(--border-color)' }} />
                            <button className="px-3 rounded font-bold" style={{ backgroundColor: 'var(--color-teal)', color: 'var(--bg-main)' }}>Go</button>
                        </div>
                    </aside>
                )}
            </main>

            {/* TERMINAL */}
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
                                <span style={{ color: log.type === 'error' ? '#ff4d4d' : (log.type === 'success' ? 'var(--color-teal)' : 'var(--color-text)'), marginLeft: '8px', whiteSpace: 'pre-wrap' }}>
                                    {log.msg}
                                </span>
                            </div>
                        ))}
                    </div>
                </footer>
            )}
        </div>
    );
}
