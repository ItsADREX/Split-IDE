import React, { memo, useRef, useEffect, useState, useCallback } from 'react';
import { RefreshCw, Monitor, Tablet, Smartphone, Eye } from 'lucide-react';

const DEVICE_SIZES = [
    { key: 'mobile',  label: 'Mobile',  icon: Smartphone, width: '375px'  },
    { key: 'tablet',  label: 'Tablet',  icon: Tablet,     width: '768px'  },
    { key: 'desktop', label: 'Desktop', icon: Monitor,    width: '100%'   },
];

function buildPreviewDocument(files, onConsoleMsg) {
    const allFiles = Object.entries(files || {});
    const htmlEntry = allFiles.find(([name]) => name.endsWith('.html'));
    const cssEntries = allFiles.filter(([name]) => name.endsWith('.css'));
    const jsEntries  = allFiles.filter(([name]) => name.endsWith('.js') || name.endsWith('.jsx'));

    const cssBlocks = cssEntries.map(([, content]) => `<style>\n${content}\n</style>`).join('\n');
    const jsBlocks  = jsEntries.map(([, content]) => `<script>\n${content}\n</script>`).join('\n');

    const consoleCapture = `<script>
(function() {
  const _orig = { log: console.log, warn: console.warn, error: console.error };
  const _send = (type, args) => {
    const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
    window.parent.postMessage({ type: 'console', level: type, msg }, '*');
  };
  console.log   = (...a) => { _orig.log(...a);   _send('log',   a); };
  console.warn  = (...a) => { _orig.warn(...a);  _send('warn',  a); };
  console.error = (...a) => { _orig.error(...a); _send('error', a); };
  window.onerror = (msg, src, line) => _send('error', [msg + ' (line ' + line + ')']);
})();
</script>`;

    if (htmlEntry) {
        let html = htmlEntry[1];
        const headClose = html.indexOf('</head>');
        const bodyClose = html.lastIndexOf('</body>');
        if (headClose !== -1) {
            html = html.slice(0, headClose) + '\n' + consoleCapture + '\n' + cssBlocks + '\n' + html.slice(headClose);
        }
        const newBodyClose = html.lastIndexOf('</body>');
        if (newBodyClose !== -1) {
            html = html.slice(0, newBodyClose) + '\n' + jsBlocks + '\n</body>' + html.slice(newBodyClose + 7);
        }
        return html;
    }

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${consoleCapture}
  ${cssBlocks}
</head>
<body style="margin:0;padding:0;background:#fff;">
  ${jsBlocks}
</body>
</html>`;
}

const LivePreview = memo(({ files, onConsoleOutput }) => {
    const iframeRef = useRef(null);
    const [deviceKey, setDeviceKey] = useState('desktop');
    const [refreshKey, setRefreshKey] = useState(0);

    const currentDevice = DEVICE_SIZES.find(d => d.key === deviceKey);

    const inject = useCallback(() => {
        const iframe = iframeRef.current;
        if (!iframe) return;
        const doc = buildPreviewDocument(files);
        const blob = new Blob([doc], { type: 'text/html' });
        const url  = URL.createObjectURL(blob);
        iframe.src = url;
        return () => URL.revokeObjectURL(url);
    }, [files, refreshKey]);

    useEffect(() => {
        const cleanup = inject();
        return cleanup;
    }, [inject]);

    useEffect(() => {
        const handler = (e) => {
            if (e.data?.type === 'console' && onConsoleOutput) {
                const prefix = e.data.level === 'error' ? '[error]' : e.data.level === 'warn' ? '[warn]' : '[log]';
                onConsoleOutput(`${prefix} ${e.data.msg}`, e.data.level === 'error' ? 'error' : 'normal');
            }
        };
        window.addEventListener('message', handler);
        return () => window.removeEventListener('message', handler);
    }, [onConsoleOutput]);

    return (
        <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--bg-main)' }}>
            {/* Toolbar */}
            <div
                className="flex items-center gap-2 px-3 flex-shrink-0"
                style={{
                    height: '40px',
                    backgroundColor: 'var(--bg-header)',
                    borderBottom: '1px solid var(--border-color)',
                }}
            >
                <Eye size={13} style={{ color: 'var(--color-muted)' }} />
                <span style={{ color: 'var(--color-muted)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '1px' }}>
                    PREVIEW
                </span>

                <div className="flex-1" />

                {/* Device toggles */}
                <div
                    className="flex items-center"
                    style={{
                        backgroundColor: 'var(--bg-panel)',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color)',
                        padding: '2px',
                        gap: '2px',
                    }}
                >
                    {DEVICE_SIZES.map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setDeviceKey(key)}
                            title={label}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '11px',
                                fontWeight: 600,
                                transition: 'all 0.15s',
                                backgroundColor: deviceKey === key ? 'var(--color-teal)' : 'transparent',
                                color: deviceKey === key ? 'var(--bg-main)' : 'var(--color-muted)',
                            }}
                        >
                            <Icon size={12} />
                            <span className="hidden md:inline">{label}</span>
                        </button>
                    ))}
                </div>

                {/* Refresh */}
                <button
                    onClick={() => setRefreshKey(k => k + 1)}
                    title="Refresh preview"
                    className="icon-btn"
                    style={{ opacity: 0.7 }}
                >
                    <RefreshCw size={14} />
                </button>
            </div>

            {/* iframe container */}
            <div
                className="flex-1 flex justify-center overflow-auto"
                style={{ backgroundColor: '#1a1a2e', padding: deviceKey !== 'desktop' ? '16px' : '0' }}
            >
                <div
                    style={{
                        width: currentDevice.width,
                        maxWidth: '100%',
                        height: '100%',
                        boxShadow: deviceKey !== 'desktop' ? '0 0 40px rgba(0,0,0,0.5)' : 'none',
                        borderRadius: deviceKey !== 'desktop' ? '8px' : '0',
                        overflow: 'hidden',
                        transition: 'width 0.2s ease',
                        flexShrink: 0,
                    }}
                >
                    <iframe
                        ref={iframeRef}
                        title="Live Preview"
                        sandbox="allow-scripts allow-same-origin allow-forms"
                        style={{
                            width: '100%',
                            height: '100%',
                            border: 'none',
                            backgroundColor: '#fff',
                            display: 'block',
                        }}
                    />
                </div>
            </div>
        </div>
    );
});

LivePreview.displayName = 'LivePreview';

export default LivePreview;
