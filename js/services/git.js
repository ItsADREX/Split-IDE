export class GitService {
    commit(message) {
        this.log(`Committed: ${message}`);
    }

    push() {
        this.log(`Pushing to remote GitHub repository...`);
    }

    log(msg) {
        const terminal = document.querySelector('.terminal-content');
        if (terminal) {
            terminal.innerHTML += `<div class="term-line"><span class="prompt">split-ide ~/project (git) $</span> <span style="color:var(--color-muted)">${msg}</span></div>`;
            terminal.scrollTop = terminal.scrollHeight;
        }
    }
}
