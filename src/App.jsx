import React, { useState, useCallback, lazy, Suspense } from 'react';
import { useTerminal } from './hooks/useTerminal';
import { useFileSystem } from './hooks/useFileSystem';
import { executeCode as runCode } from './services/codeExecution';
import Header from './components/Header';
import ExplorerPanel from './components/ExplorerPanel';
import TerminalPanel from './components/TerminalPanel';
import FileTabs from './components/FileTabs';
import './index.css';

const AIPanel = lazy(() => import('./components/AIPanel'));
const EditorPane = lazy(() => import('./components/EditorPane'));

export default function App() {
    const [panels, setPanels] = useState({ explorer: true, ai: false, terminal: false });

    const { terminalLogs, logTerm } = useTerminal();

    const logTermWithPanel = useCallback((msg, type = "normal") => {
        logTerm(msg, type);
        setPanels(p => ({ ...p, terminal: true }));
    }, [logTerm]);

    const fs = useFileSystem(logTermWithPanel);

    const togglePanel = useCallback((p) => {
        setPanels(curr => ({ ...curr, [p]: !curr[p] }));
    }, []);

    const handleExecute = useCallback(() => {
        runCode(fs.activeFile, fs.content, logTermWithPanel);
    }, [fs.activeFile, fs.content, logTermWithPanel]);

    return (
        <div className="flex flex-col h-full w-full">
            <Header
                panels={panels}
                togglePanel={togglePanel}
                executeCode={handleExecute}
                uploadFile={fs.uploadFile}
            />

            <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
                {/* Mobile Explorer Overlay */}
                {panels.explorer && (
                    <div className={`${panels.explorer ? 'block' : 'hidden'} md:block`}>
                        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => togglePanel('explorer')}></div>
                        <div className="md:relative md:w-64 fixed md:static inset-y-0 left-0 z-50 w-80 md:z-auto">
                            <ExplorerPanel
                                files={fs.files}
                                activeFile={fs.activeFile}
                                openFolders={fs.openFolders}
                                selectFile={fs.selectFile}
                                toggleFolder={fs.toggleFolder}
                                handleDragStart={fs.handleDragStart}
                                handleDrop={fs.handleDrop}
                                newFile={fs.newFile}
                                newFolder={fs.newFolder}
                                uploadFile={fs.uploadFile}
                                deleteFile={fs.deleteFile}
                                renameFile={fs.renameFile}
                                duplicateFile={fs.duplicateFile}
                            />
                        </div>
                    </div>
                )}

                <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                    <FileTabs
                        openTabs={fs.openTabs}
                        activeFile={fs.activeFile}
                        onSelectTab={fs.selectFile}
                        onCloseTab={fs.closeTab}
                    />
                    <Suspense fallback={
                        <section className="flex-1 overflow-hidden" style={{ backgroundColor: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-muted)' }}>
                            Loading editor...
                        </section>
                    }>
                        <EditorPane
                            activeFile={fs.activeFile}
                            content={fs.content}
                            onChange={fs.handleEditorChange}
                        />
                    </Suspense>
                </div>

                {/* Mobile AI Panel Overlay */}
                {panels.ai && (
                    <div className={`${panels.ai ? 'block' : 'hidden'}`}>
                        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => togglePanel('ai')}></div>
                        <div className="md:relative md:w-80 fixed md:static inset-y-0 right-0 z-50 w-full md:z-auto">
                            <Suspense fallback={null}>
                                <AIPanel onClose={() => togglePanel('ai')} />
                            </Suspense>
                        </div>
                    </div>
                )}
            </main>

            {panels.terminal && (
                <TerminalPanel
                    terminalLogs={terminalLogs}
                    onClose={() => togglePanel('terminal')}
                />
            )}
        </div>
    );
}
