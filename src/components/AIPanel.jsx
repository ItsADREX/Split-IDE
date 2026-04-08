import React, { memo } from 'react';
import { X, Send } from 'lucide-react';

const AIPanel = memo(({ onClose }) => {
    return (
        <>
            {/* Desktop AI Panel */}
            <aside className="hidden md:flex w-80 flex-col" style={{ backgroundColor: 'var(--bg-panel)', borderLeft: '1px solid var(--border-color)' }}>
                <div className="flex justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--color-teal)', fontWeight: 600 }}>
                    <span>✨ SPLIT AI</span>
                    <button onClick={onClose} className="icon-btn"><X size={16} /></button>
                </div>
                <div className="flex-1 p-4 overflow-y-auto">
                    <div className="p-3 mb-2 rounded-lg" style={{ background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
                        <strong style={{ color: 'var(--color-teal)' }}>SPLIT AI:</strong> I'm your intelligent coding assistant! I can help you write, debug, and optimize your code.
                    </div>
                </div>
                <div className="p-3 flex gap-2" style={{ borderTop: '1px solid var(--border-color)' }}>
                    <input 
                        type="text" 
                        placeholder="Ask me anything..." 
                        className="flex-1 bg-transparent p-3 rounded-lg text-white" 
                        style={{ 
                            border: '1px solid var(--border-color)', 
                            backgroundColor: 'var(--bg-hover)',
                            fontSize: '14px'
                        }} 
                    />
                    <button 
                        className="p-3 rounded-lg transition-all hover:scale-105" 
                        style={{ 
                            backgroundColor: 'var(--color-teal)', 
                            color: 'var(--bg-main)',
                            minWidth: '48px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Send size={16} />
                    </button>
                </div>
            </aside>

            {/* Mobile AI Panel - Bottom Sheet Overlay */}
            <div className="md:hidden fixed inset-x-0 bottom-0 z-50 flex flex-col" style={{ 
                backgroundColor: 'var(--bg-panel)',
                height: '70vh',
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px',
                boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)'
            }}>
                <div className="flex justify-between items-center px-4 py-3 font-bold" style={{ 
                    backgroundColor: 'var(--bg-header)', 
                    borderBottom: '1px solid var(--border-color)', 
                    fontSize: '0.8rem', 
                    color: 'var(--color-muted)',
                    borderTopLeftRadius: '16px',
                    borderTopRightRadius: '16px'
                }}>
                    <span className="flex items-center gap-2" style={{ color: 'var(--color-teal)' }}>
                        ✨ <span>SPLIT AI</span>
                    </span>
                    <button onClick={onClose} className="icon-btn"><X size={16} /></button>
                </div>
                
                <div className="flex-1 p-4 overflow-y-auto" style={{ backgroundColor: 'var(--bg-panel)' }}>
                    <div className="p-4 mb-4 rounded-xl" style={{ 
                        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)', 
                        border: '1px solid rgba(6, 182, 212, 0.2)',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-teal)' }}>
                                <span style={{ color: 'var(--bg-main)', fontSize: '14px' }}>✨</span>
                            </div>
                            <strong style={{ color: 'var(--color-teal)' }}>SPLIT AI</strong>
                        </div>
                        <p style={{ color: 'var(--color-text)', lineHeight: '1.5' }}>
                            I'm your intelligent coding assistant! I can help you write, debug, and optimize your code. Ask me anything about programming!
                        </p>
                    </div>
                </div>
                
                <div className="p-4 flex gap-3" style={{ 
                    borderTop: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-header)'
                }}>
                    <input 
                        type="text" 
                        placeholder="Ask me anything..." 
                        className="flex-1 bg-transparent p-4 rounded-xl text-white" 
                        style={{ 
                            border: '1px solid var(--border-color)', 
                            backgroundColor: 'var(--bg-panel)',
                            fontSize: '16px'
                        }} 
                    />
                    <button 
                        className="p-4 rounded-xl transition-all active:scale-95" 
                        style={{ 
                            backgroundColor: 'var(--color-teal)', 
                            color: 'var(--bg-main)',
                            minWidth: '56px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)'
                        }}
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </>
    );
});

AIPanel.displayName = 'AIPanel';

export default AIPanel;
