import React, { memo, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { getLanguage } from '../services/codeExecution';

const EditorPane = memo(({ activeFile, content, onChange }) => {
    const handleMount = useCallback((editor, monaco) => {
        monaco.editor.defineTheme('split-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [],
            colors: { 'editor.background': '#0b0e14' }
        });
        monaco.editor.setTheme('split-dark');
    }, []);

    return (
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
                }}
            />
        </section>
    );
});

EditorPane.displayName = 'EditorPane';

export default EditorPane;
