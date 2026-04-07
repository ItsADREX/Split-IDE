import React, { memo } from 'react';
import { X } from 'lucide-react';

const AIPanel = memo(({ onClose }) => {
    return (
        <aside className="w-80 flex flex-col" style={{ backgroundColor: 'var(--bg-main)', borderLeft: '1px solid var(--border-color)' }}>
            <div className="flex justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--color-teal)', fontWeight: 600 }}>
                <span>✨ AI ASSISTANT</span>
                <button onClick={onClose} className="icon-btn"><X size={16} /></button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
                <div className="p-3 mb-2 rounded-md" style={{ background: 'rgba(0, 240, 255, 0.05)', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
                    <strong style={{ color: 'var(--color-teal)' }}>SPLIT AI:</strong> I'm your intelligent coding assistant! I can help you write, debug, and optimize your code.
                </div>
            </div>
            <div className="p-3 flex gap-2" style={{ borderTop: '1px solid var(--border-color)' }}>
                <input type="text" placeholder="Prompt..." className="flex-1 bg-transparent p-2 rounded text-white" style={{ border: '1px solid var(--border-color)' }} />
                <button className="px-3 rounded font-bold" style={{ backgroundColor: 'var(--color-teal)', color: 'var(--bg-main)' }}>Go</button>
            </div>
        </aside>
    );
});

AIPanel.displayName = 'AIPanel';

export default AIPanel;
