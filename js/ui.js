export function setupUI() {
    const explorerBtn = document.getElementById('btn-toggle-explorer');
    const aiBtn = document.getElementById('btn-toggle-ai');
    const termBtn = document.getElementById('btn-toggle-terminal');
    const closeTermBtn = document.getElementById('close-terminal');
    const closeAiBtn = document.getElementById('close-ai');

    const explorerPanel = document.getElementById('explorer-panel');
    const aiPanel = document.getElementById('ai-panel');
    const termPanel = document.getElementById('terminal-panel');

    function togglePanel(btn, panel) {
        panel.classList.toggle('closed');
        if (!panel.classList.contains('closed')) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    }

    explorerBtn.addEventListener('click', () => togglePanel(explorerBtn, explorerPanel));
    aiBtn.addEventListener('click', () => togglePanel(aiBtn, aiPanel));
    termBtn.addEventListener('click', () => togglePanel(termBtn, termPanel));

    closeTermBtn.addEventListener('click', () => {
        termPanel.classList.add('closed');
        termBtn.classList.remove('active');
    });

    closeAiBtn.addEventListener('click', () => {
        aiPanel.classList.add('closed');
        aiBtn.classList.remove('active');
    });

    // File list active UI handling
    const fileItems = document.querySelectorAll('.file-item');
    fileItems.forEach(item => {
        item.addEventListener('click', (e) => {
            fileItems.forEach(i => i.classList.remove('active'));
            e.currentTarget.classList.add('active');
        });
    });
}

export function logToTerminal(msg, type = "normal") {
    const terminal = document.querySelector('.terminal-content');
    const panel = document.getElementById('terminal-panel');
    const color = type === "error" ? "#ff4d4d" : (type === "success" ? "var(--color-neon-green)" : "var(--color-text)");

    terminal.innerHTML += `<div class="term-line"><span class="prompt">split-ide ~/project $</span> <span style="color:${color}; white-space:pre-wrap; word-break:break-all;">${msg}</span></div>`;
    terminal.scrollTop = terminal.scrollHeight;

    if (panel.classList.contains('closed')) {
        document.getElementById('btn-toggle-terminal').click();
    }
}
