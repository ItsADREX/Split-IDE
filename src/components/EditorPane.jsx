import React, { memo, useCallback, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { getLanguage } from '../services/codeExecution';
import MobileCodeToolbar from './MobileCodeToolbar';

const EditorPane = memo(({ activeFile, content, onChange }) => {
    const editorRef = useRef(null);

    const handleMount = useCallback((editor, monaco) => {
        editorRef.current = editor;
        monaco.editor.defineTheme('split-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [],
            colors: { 'editor.background': '#0b0e14' }
        });
        monaco.editor.setTheme('split-dark');
    }, []);

    const handleMobileInsert = useCallback((text, cursorOffset = 0) => {
        if (!editorRef.current) return;

        const editor = editorRef.current;
        const position = editor.getPosition();
        const range = {
            startLineNumber: position.lineNumber,
            startColumn: position.column,
            endLineNumber: position.lineNumber,
            endColumn: position.column
        };

        editor.executeEdits('mobile-toolbar', [{
            range: range,
            text: text
        }]);

        // Set cursor position if specified
        if (cursorOffset !== undefined) {
            const newPosition = {
                lineNumber: position.lineNumber,
                column: position.column + cursorOffset
            };
            editor.setPosition(newPosition);
        }

        editor.focus();
    }, []);

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <section className="flex-1 overflow-hidden" style={{ backgroundColor: 'var(--bg-main)' }}>
                <Editor
                    height="100%"
                    language={getLanguage(activeFile)}
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
                    }}
                />
            </section>
            <MobileCodeToolbar 
                onInsert={handleMobileInsert}
                language={getLanguage(activeFile)}
            />
        </div>
    );
});

EditorPane.displayName = 'EditorPane';

export default EditorPane;
