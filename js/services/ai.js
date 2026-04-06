export class AIService {
    initializeUI() {
        const input = document.getElementById('ai-input');
        const submit = document.getElementById('ai-submit');
        const chatOutput = document.getElementById('ai-chat-output');

        const requestHelp = () => {
            const userText = input.value.trim();
            if (!userText) return;

            // Add user message to UI
            chatOutput.innerHTML += `
                <div class="chat-message" style="margin-left: 20px; border: 1px solid var(--border-color); color: var(--color-text);">
                    ${userText}
                </div>`;
            input.value = '';
            chatOutput.scrollTop = chatOutput.scrollHeight;

            // Trigger AI mockup Response
            setTimeout(() => {
                this.handleAIResponse(chatOutput, userText);
            }, 800);
        };

        submit.addEventListener('click', requestHelp);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') requestHelp();
        });
    }

    handleAIResponse(chatOutput, prompt) {
        // AI Placeholder response simulating thinking and code logic
        const response = `<strong>SplitAI:</strong> Interesting idea. I'll connect to my language model API to refactor that! For now, this is a decoupled stub.`;
        chatOutput.innerHTML += `<div class="chat-message ai">${response}</div>`;
        chatOutput.scrollTop = chatOutput.scrollHeight;
    }
}
