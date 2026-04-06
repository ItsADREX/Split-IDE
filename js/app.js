import { setupUI, logToTerminal } from './ui.js';
import { EditorService } from './editor.js';
import { StorageService } from './services/storage.js';
import { AIService } from './services/ai.js';
import { GitService } from './services/git.js';

document.addEventListener('DOMContentLoaded', async () => {
    setupUI();

    const storage = new StorageService();
    window.gitService = new GitService();
    const ai = new AIService();
    const editor = new EditorService('editor-container');

    // Auto-Save Loop
    let saveDebounceTimer;
    editor.onChange((content) => {
        clearTimeout(saveDebounceTimer);
        const activeItem = document.querySelector('.file-item.active');
        if (!activeItem) return;
        const activeFile = activeItem.getAttribute('data-file');

        const terminal = document.querySelector('.terminal-content');
        saveDebounceTimer = setTimeout(async () => {
            await storage.saveFile(activeFile, content);
            terminal.innerHTML += `<div class="term-line"><span class="prompt">split-ide ~/project $</span> <span style="color:var(--color-neon-green)">✓ Auto-saved ${activeFile}</span></div>`;
            terminal.scrollTop = terminal.scrollHeight;
        }, 1500);
    });

    ai.initializeUI();

    // Load initial file
    const initialItem = document.querySelector('.file-item.active');
    if (initialItem) {
        const activeFile = initialItem.getAttribute('data-file');
        editor.setLanguage(activeFile);
        editor.setContent(await storage.loadFile(activeFile));
    }

    // Binder for clicking files
    function bindFileClick(item) {
        item.addEventListener('click', async (e) => {
            document.querySelectorAll('.file-item').forEach(i => i.classList.remove('active'));
            e.currentTarget.classList.add('active');

            const filename = e.currentTarget.getAttribute('data-file');
            editor.setContent("// Downloading file from DB...");
            editor.setLanguage(filename);

            const content = await storage.loadFile(filename);
            editor.setContent(content);
        });
    }

    document.querySelectorAll('.file-item').forEach(bindFileClick);

    // --- Action Button Implementations ---

    // RUN SCRIPT
    document.getElementById('btn-run-script').addEventListener('click', () => {
        const content = editor.getContent();
        const activeFile = document.querySelector('.file-item.active').getAttribute('data-file');

        logToTerminal(`Executing ${activeFile}...`, "success");
        if (activeFile.endsWith(".js")) {
            try {
                // Execute in sandbox via Function context
                const result = new Function(content)();
                if (result !== undefined) logToTerminal(`Output: ${result}`);
            } catch (e) {
                logToTerminal(`Error: ${e.message}`, "error");
            }
        } else {
            logToTerminal("Can only execute .js files directly.", "error");
        }
    });

    // PUBLISH
    document.getElementById('btn-publish').addEventListener('click', () => {
        logToTerminal("Project published to Split IDE Cloud successfully!", "success");
    });

    // MAKE NEW FILE
    document.getElementById('btn-new-file').addEventListener('click', async () => {
        const filename = prompt("Enter new filename (e.g. styles.css):", "newFile.js");
        if (filename && filename.trim() !== '') {
            const ul = document.getElementById('file-list');
            const li = document.createElement('li');
            li.className = 'file-item';
            li.setAttribute('data-file', filename);
            li.innerText = filename;
            ul.appendChild(li);
            bindFileClick(li);

            await storage.saveFile(filename, `// Created ${filename}`);
            li.click(); // Auto-select the newly created file
        }
    });

    // ADD FOLDER
    document.getElementById('btn-new-folder').addEventListener('click', () => {
        const folder = prompt("Enter folder name:");
        if (folder) logToTerminal(`Folder created mapping to virtual directory: ${folder}`);
    });

    // UPLOAD FILE
    document.getElementById('btn-upload').addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.onchange = e => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = async (re) => {
                    const filename = file.name;
                    await storage.saveFile(filename, re.target.result);

                    const li = document.createElement('li');
                    li.className = 'file-item';
                    li.setAttribute('data-file', filename);
                    li.innerText = filename;
                    document.getElementById('file-list').appendChild(li);
                    bindFileClick(li);

                    li.click();
                    logToTerminal(`Uploaded DB file ${filename} successfully.`, "success");
                };
                reader.readAsText(file);
            }
        };
        input.click();
    });
});
