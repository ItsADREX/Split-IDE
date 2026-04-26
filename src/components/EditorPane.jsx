import React, { memo, useCallback, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { getLanguage } from '../services/codeExecution';
import MobileCodeToolbar, { HTML_EXPANSIONS, CSS_EXPANSIONS, JS_EXPANSIONS } from './MobileCodeToolbar';
import LivePreview from './LivePreview';

const EditorPane = memo(({ activeFile, content, onChange, viewMode, files, onConsoleOutput }) => {
    const editorRef   = useRef(null);
    const monacoRef   = useRef(null);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);

    const language = getLanguage(activeFile);

    const handleMount = useCallback((editor, monaco) => {
        editorRef.current  = editor;
        monacoRef.current  = monaco;

        monaco.editor.defineTheme('split-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [],
            colors: { 'editor.background': '#0b0e14' }
        });
        monaco.editor.setTheme('split-dark');

        // Track undo/redo availability on every model change
        editor.onDidChangeModelContent(() => {
            const model = editor.getModel();
            if (!model) return;
            setCanUndo(model.canUndo());
            setCanRedo(model.canRedo());
        });

        // Tab-expand shortcut inside Monaco (Tab key)
        editor.addCommand(monaco.KeyCode.Tab, () => {
            const model = editor.getModel();
            const pos   = editor.getPosition();
            if (!model || !pos) { editor.trigger('keyboard', 'tab', {}); return; }

            const lineText = model.getLineContent(pos.lineNumber);
            const before   = lineText.slice(0, pos.column - 1);
            const wordMatch = /([a-zA-Z][\w:-]*)$/.exec(before);

            if (!wordMatch) { editor.trigger('keyboard', 'tab', {}); return; }

            const word = wordMatch[1].toLowerCase();
            const lang = getLanguage(activeFile);
            let expansion;
            if (lang === 'html')      expansion = HTML_EXPANSIONS[word];
            else if (lang === 'css')  expansion = CSS_EXPANSIONS[word];
            else                      expansion = JS_EXPANSIONS[word];

            if (!expansion) { editor.trigger('keyboard', 'tab', {}); return; }

            const startCol = pos.column - wordMatch[1].length;
            editor.executeEdits('tab-expand', [{
                range: new monaco.Range(pos.lineNumber, startCol, pos.lineNumber, pos.column),
                text: expansion,
            }]);

            // Place cursor at first meaningful position (first ; or end)
            const semiIdx = expansion.indexOf(';');
            const offset  = semiIdx >= 0 ? semiIdx : expansion.length;
            const lines   = expansion.slice(0, offset).split('\n');
            const newLine = pos.lineNumber + lines.length - 1;
            const newCol  = lines.length === 1
                ? startCol + offset
                : lines[lines.length - 1].length + 1;
            editor.setPosition({ lineNumber: newLine, column: newCol });
        });
    }, [activeFile]);

    const handleMobileInsert = useCallback((text, cursorOffset = 0) => {
        const editor = editorRef.current;
        if (!editor) return;

        const pos = editor.getPosition();
        const monaco = monacoRef.current;
        editor.executeEdits('mobile-toolbar', [{
            range: new monaco.Range(pos.lineNumber, pos.column, pos.lineNumber, pos.column),
            text,
        }]);

        const lines = text.slice(0, cursorOffset).split('\n');
        const newLine = pos.lineNumber + lines.length - 1;
        const newCol  = lines.length === 1
            ? pos.column + cursorOffset
            : lines[lines.length - 1].length + 1;
        editor.setPosition({ lineNumber: newLine, column: newCol });
        editor.focus();
    }, []);

    const handleUndo = useCallback(() => {
        const editor = editorRef.current;
        if (!editor) return;
        editor.trigger('toolbar', 'undo', {});
        editor.focus();
        const model = editor.getModel();
        if (model) { setCanUndo(model.canUndo()); setCanRedo(model.canRedo()); }
    }, []);

    const handleRedo = useCallback(() => {
        const editor = editorRef.current;
        if (!editor) return;
        editor.trigger('toolbar', 'redo', {});
        editor.focus();
        const model = editor.getModel();
        if (model) { setCanUndo(model.canUndo()); setCanRedo(model.canRedo()); }
    }, []);

    if (viewMode === 'preview') {
        return <LivePreview files={files} onConsoleOutput={onConsoleOutput} />;
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <section className="flex-1 overflow-hidden" style={{ backgroundColor: 'var(--bg-main)' }}>
                <Editor
                    height="100%"
                    language={language}
                    value={content}
                    onChange={onChange}
                    onMount={handleMount}
                    theme="split-dark"
                    loading={
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-muted)' }}>
                            Loading editor...
                        </div>
                    }
                    options={{
                        minimap: { enabled: false },
                        fontFamily: 'Fira Code',
                        fontSize: 14,
                        smoothScrolling: true,
                        cursorSmoothCaretAnimation: 'on',
                        scrollBeyondLastLine: false,
                        wordWrap: 'on',
                        automaticLayout: true,
                        tabSize: 2,
                    }}
                />
            </section>
            <MobileCodeToolbar
                onInsert={handleMobileInsert}
                onUndo={handleUndo}
                onRedo={handleRedo}
                canUndo={canUndo}
                canRedo={canRedo}
                language={language}
            />
        </div>
    );
});

EditorPane.displayName = 'EditorPane';

export default EditorPane;
