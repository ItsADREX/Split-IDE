import React, { memo, useState, useEffect } from 'react';
import { Search } from 'lucide-react';

const MobileAutoComplete = memo(({ onSelect, language = 'javascript', currentWord = '' }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [isVisible, setIsVisible] = useState(false);

    const getAutoCompletions = (word, lang) => {
        const jsCompletions = [
            'addEventListener', 'appendChild', 'async', 'await', 'break', 'case', 'catch', 'class', 
            'const', 'constructor', 'continue', 'default', 'delete', 'document', 'else', 'export', 
            'extends', 'false', 'finally', 'for', 'forEach', 'function', 'getElementById', 
            'getElementsByClassName', 'if', 'import', 'innerHTML', 'let', 'new', 'null', 'promise', 
            'querySelector', 'querySelectorAll', 'return', 'switch', 'this', 'throw', 'true', 
            'try', 'typeof', 'undefined', 'var', 'while', 'window', 'console.log', 'JSON.parse', 
            'JSON.stringify', 'Object.keys', 'Array.from', 'setTimeout', 'setInterval'
        ];

        const pyCompletions = [
            'def', 'class', 'if', 'elif', 'else', 'for', 'while', 'try', 'except', 'finally', 
            'import', 'from', 'as', 'return', 'yield', 'lambda', 'with', 'pass', 'break', 
            'continue', 'and', 'or', 'not', 'in', 'is', 'True', 'False', 'None', 'print', 
            'len', 'range', 'enumerate', 'zip', 'map', 'filter', 'list', 'dict', 'set', 
            'tuple', 'str', 'int', 'float', 'bool', '__init__', '__str__', '__repr__'
        ];

        const completions = lang === 'python' ? pyCompletions : jsCompletions;
        
        if (!word) return completions.slice(0, 8);
        
        return completions
            .filter(comp => comp.toLowerCase().includes(word.toLowerCase()))
            .slice(0, 8);
    };

    useEffect(() => {
        if (currentWord.length > 0) {
            const suggestions = getAutoCompletions(currentWord, language);
            setSuggestions(suggestions);
            setIsVisible(suggestions.length > 0);
        } else {
            setIsVisible(false);
        }
    }, [currentWord, language]);

    if (!isVisible) return null;

    return (
        <div className="md:hidden absolute bottom-full left-0 right-0 bg-panel border border-border rounded-t-md shadow-lg max-h-32 overflow-y-auto z-50"
             style={{ 
                 backgroundColor: 'var(--bg-panel)', 
                 borderColor: 'var(--border-color)',
                 boxShadow: 'var(--shadow-lg)'
             }}>
            <div className="p-2 border-b border-border flex items-center gap-2" 
                 style={{ borderColor: 'var(--border-color)', color: 'var(--color-muted)' }}>
                <Search size={12} />
                <span className="text-xs">Suggestions</span>
            </div>
            <div className="p-1">
                {suggestions.map((suggestion, index) => (
                    <button
                        key={index}
                        className="w-full text-left p-2 text-sm font-mono hover:bg-hover rounded transition-colors"
                        style={{ color: 'var(--color-text)' }}
                        onClick={() => onSelect(suggestion)}
                        onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                        onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        {suggestion}
                    </button>
                ))}
            </div>
        </div>
    );
});

MobileAutoComplete.displayName = 'MobileAutoComplete';

export default MobileAutoComplete;
