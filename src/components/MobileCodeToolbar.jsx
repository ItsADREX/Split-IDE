import React, { memo, useState } from 'react';
import { ChevronUp, ChevronDown, Code, Type, Braces } from 'lucide-react';

const MobileCodeToolbar = memo(({ onInsert, language = 'javascript' }) => {
    const [activeTab, setActiveTab] = useState('symbols');
    const [isExpanded, setIsExpanded] = useState(false);

    // Common coding symbols organized by frequency of use
    const symbols = [
        { label: ';', value: ';' },
        { label: '=', value: '=' },
        { label: '{', value: '{}', cursor: 1 },
        { label: '[', value: '[]', cursor: 1 },
        { label: '(', value: '()', cursor: 1 },
        { label: '"', value: '""', cursor: 1 },
        { label: "'", value: "''", cursor: 1 },
        { label: '`', value: '``', cursor: 1 },
        { label: '.', value: '.' },
        { label: ',', value: ',' },
        { label: ':', value: ':' },
        { label: '+', value: '+' },
        { label: '-', value: '-' },
        { label: '*', value: '*' },
        { label: '/', value: '/' },
        { label: '%', value: '%' },
        { label: '!', value: '!' },
        { label: '?', value: '?' },
        { label: '&', value: '&' },
        { label: '|', value: '|' },
        { label: '<', value: '<' },
        { label: '>', value: '>' },
        { label: '#', value: '#' },
        { label: '$', value: '$' }
    ];

    // Language-specific keywords and snippets
    const getSnippets = () => {
        const common = [
            { label: 'let', value: 'let ', cursor: 0 },
            { label: 'const', value: 'const ', cursor: 0 },
            { label: 'var', value: 'var ', cursor: 0 },
            { label: 'if', value: 'if () {\n    \n}', cursor: 4 },
            { label: 'for', value: 'for (let i = 0; i < ; i++) {\n    \n}', cursor: 20 },
            { label: 'while', value: 'while () {\n    \n}', cursor: 7 },
            { label: 'function', value: 'function () {\n    \n}', cursor: 9 },
            { label: '=>', value: ' => ', cursor: 0 },
            { label: 'return', value: 'return ', cursor: 0 },
            { label: 'import', value: 'import  from ""', cursor: 7 },
            { label: 'export', value: 'export ', cursor: 0 },
            { label: 'try', value: 'try {\n    \n} catch (error) {\n    \n}', cursor: 10 },
            { label: 'async', value: 'async ', cursor: 0 },
            { label: 'await', value: 'await ', cursor: 0 },
            { label: 'class', value: 'class  {\n    constructor() {\n        \n    }\n}', cursor: 6 },
            { label: 'console.log', value: 'console.log()', cursor: 1 }
        ];

        if (language === 'python') {
            return [
                { label: 'def', value: 'def ():\n    ', cursor: 4 },
                { label: 'class', value: 'class :\n    def __init__(self):\n        ', cursor: 6 },
                { label: 'if', value: 'if :\n    ', cursor: 3 },
                { label: 'for', value: 'for  in :\n    ', cursor: 4 },
                { label: 'while', value: 'while :\n    ', cursor: 6 },
                { label: 'try', value: 'try:\n    \nexcept:\n    ', cursor: 9 },
                { label: 'import', value: 'import ', cursor: 0 },
                { label: 'from', value: 'from  import ', cursor: 5 },
                { label: 'print', value: 'print()', cursor: 1 },
                { label: 'len', value: 'len()', cursor: 1 },
                { label: 'range', value: 'range()', cursor: 1 },
                { label: 'lambda', value: 'lambda : ', cursor: 7 },
                ...common.filter(s => !['let', 'const', 'var', 'function'].includes(s.label))
            ];
        }

        return common;
    };

    const operators = [
        { label: '==', value: '==' },
        { label: '===', value: '===' },
        { label: '!=', value: '!=' },
        { label: '!==', value: '!==' },
        { label: '<=', value: '<=' },
        { label: '>=', value: '>=' },
        { label: '&&', value: '&&' },
        { label: '||', value: '||' },
        { label: '++', value: '++' },
        { label: '--', value: '--' },
        { label: '+=', value: '+=' },
        { label: '-=', value: '-=' },
        { label: '*=', value: '*=' },
        { label: '/=', value: '/=' },
        { label: '=>', value: '=>' },
        { label: '??', value: '??' },
        { label: '?.', value: '?.' }
    ];

    const handleInsert = (item) => {
        onInsert(item.value, item.cursor);
    };

    const renderButtons = (items) => (
        <div className="grid grid-cols-6 gap-1 p-2">
            {items.map((item, index) => (
                <button
                    key={index}
                    className="bg-hover border border-border rounded p-2 text-xs font-mono active:bg-active transition-colors min-h-10 flex items-center justify-center"
                    style={{
                        backgroundColor: 'var(--bg-hover)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--color-text)'
                    }}
                    onClick={() => handleInsert(item)}
                    onMouseDown={(e) => e.preventDefault()} // Prevent focus loss from editor
                >
                    {item.label}
                </button>
            ))}
        </div>
    );

    if (!isExpanded) {
        return (
            <div className="md:hidden bg-panel border-t border-border" style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border-color)' }}>
                <button
                    className="w-full p-2 flex items-center justify-center gap-2 text-sm"
                    style={{ color: 'var(--color-muted)' }}
                    onClick={() => setIsExpanded(true)}
                >
                    <Code size={16} />
                    <span>Code Toolbar</span>
                    <ChevronUp size={16} />
                </button>
            </div>
        );
    }

    return (
        <div className="md:hidden bg-panel border-t border-border" style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border-color)' }}>
            {/* Header with tabs */}
            <div className="flex items-center justify-between p-2 border-b border-border" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex gap-1">
                    <button
                        className={`px-3 py-1 rounded text-xs ${activeTab === 'symbols' ? 'bg-active text-teal' : 'text-muted'}`}
                        style={{
                            backgroundColor: activeTab === 'symbols' ? 'var(--bg-active)' : 'transparent',
                            color: activeTab === 'symbols' ? 'var(--color-teal)' : 'var(--color-muted)'
                        }}
                        onClick={() => setActiveTab('symbols')}
                    >
                        Symbols
                    </button>
                    <button
                        className={`px-3 py-1 rounded text-xs ${activeTab === 'snippets' ? 'bg-active text-teal' : 'text-muted'}`}
                        style={{
                            backgroundColor: activeTab === 'snippets' ? 'var(--bg-active)' : 'transparent',
                            color: activeTab === 'snippets' ? 'var(--color-teal)' : 'var(--color-muted)'
                        }}
                        onClick={() => setActiveTab('snippets')}
                    >
                        Code
                    </button>
                    <button
                        className={`px-3 py-1 rounded text-xs ${activeTab === 'operators' ? 'bg-active text-teal' : 'text-muted'}`}
                        style={{
                            backgroundColor: activeTab === 'operators' ? 'var(--bg-active)' : 'transparent',
                            color: activeTab === 'operators' ? 'var(--color-teal)' : 'var(--color-muted)'
                        }}
                        onClick={() => setActiveTab('operators')}
                    >
                        Operators
                    </button>
                </div>
                <button
                    className="p-1"
                    style={{ color: 'var(--color-muted)' }}
                    onClick={() => setIsExpanded(false)}
                >
                    <ChevronDown size={16} />
                </button>
            </div>

            {/* Content */}
            <div className="max-h-32 overflow-y-auto">
                {activeTab === 'symbols' && renderButtons(symbols)}
                {activeTab === 'snippets' && renderButtons(getSnippets())}
                {activeTab === 'operators' && renderButtons(operators)}
            </div>
        </div>
    );
});

MobileCodeToolbar.displayName = 'MobileCodeToolbar';

export default MobileCodeToolbar;
