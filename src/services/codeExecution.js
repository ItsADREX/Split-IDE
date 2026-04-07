let pyodideInstance = null;
let pyodideLoading = false;

async function loadPyodideLazy() {
    if (pyodideInstance) return pyodideInstance;
    if (pyodideLoading) {
        // Wait for the existing load to finish
        while (pyodideLoading) {
            await new Promise(r => setTimeout(r, 100));
        }
        return pyodideInstance;
    }

    pyodideLoading = true;

    try {
        // Check if Pyodide is already loaded
        if (!window.loadPyodide) {
            // Dynamically inject the Pyodide script
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js';
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }

        pyodideInstance = await window.loadPyodide({
            indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/'
        });
        pyodideLoading = false;
        return pyodideInstance;
    } catch (error) {
        pyodideLoading = false;
        throw error;
    }
}

export async function executeCode(activeFile, content, logTerm) {
    logTerm(`> Executing ${activeFile}...`, "success");

    if (activeFile && activeFile.endsWith('.js')) {
        const originalLog = console.log;
        console.log = (...args) => logTerm(args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' '));
        try {
            const out = new Function(content)();
            if (out !== undefined) logTerm(`Output: ${out}`);
        } catch (e) {
            logTerm(`${e.message}`, "error");
        }
        console.log = originalLog;
    } else if (activeFile && activeFile.endsWith('.py')) {
        try {
            logTerm("Initializing Python Sandbox (first run may take a moment)...");
            const pyodide = await loadPyodideLazy();
            pyodide.setStdout({ batched: (msg) => logTerm(msg) });
            await pyodide.runPythonAsync(content);
        } catch (err) {
            logTerm(`Python Error: ${err.message}`, "error");
        }
    } else {
        logTerm("Cannot execute this file automatically (non JS/PY).", "error");
    }
}

export function getLanguage(file) {
    if (!file) return 'javascript';
    if (file.endsWith('.css')) return 'css';
    if (file.endsWith('.html')) return 'html';
    if (file.endsWith('.json')) return 'json';
    if (file.endsWith('.py')) return 'python';
    if (file.endsWith('.jsx')) return 'javascript';
    if (file.endsWith('.ts') || file.endsWith('.tsx')) return 'typescript';
    return 'javascript';
}
