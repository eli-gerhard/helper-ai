import { ChatService } from './chatService';
import { Message, ModelType } from './types';

class ChatApp {
    private chatService: ChatService;
    private chatHistory: Message[] = [];
    private chatHistoryElement: HTMLElement;
    private userInputElement: HTMLTextAreaElement;
    private sendButtonElement: HTMLButtonElement;
    private modelSelectorElement: HTMLSelectElement;
    private isWaitingForResponse = false;

    constructor() {
        this.chatService = new ChatService();
        this.chatHistoryElement = document.getElementById('chatHistory') as HTMLElement;
        this.userInputElement = document.getElementById('userInput') as HTMLTextAreaElement;
        this.sendButtonElement = document.getElementById('sendButton') as HTMLButtonElement;
        this.modelSelectorElement = document.getElementById('model-selector') as HTMLSelectElement;

        this.setupEventListeners();
        this.addWelcomeMessage();
    }

    private setupEventListeners(): void {
        this.sendButtonElement.addEventListener('click', () => this.sendMessage());
        
        this.userInputElement.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize textarea as user types
        this.userInputElement.addEventListener('input', () => {
            this.userInputElement.style.height = 'auto';
            this.userInputElement.style.height = `${this.userInputElement.scrollHeight}px`;
        });
    }

    private addWelcomeMessage(): void {
        const welcomeMessage: Message = { 
            role: 'assistant', 
            content: 'Hello! I\'m your AI assistant. How can I help you today?' 
        };
        this.addMessageToUI(welcomeMessage);
    }

    private async sendMessage(): Promise<void> {
        if (this.isWaitingForResponse) return;

        const userInput = this.userInputElement.value.trim();
        if (!userInput) return;

        // Clear input and reset height
        this.userInputElement.value = '';
        this.userInputElement.style.height = 'auto';

        // Add user message to chat
        const userMessage: Message = { role: 'user', content: userInput };
        this.chatHistory.push(userMessage);
        this.addMessageToUI(userMessage);

        // Show thinking indicator
        this.showThinkingIndicator();
        this.isWaitingForResponse = true;

        try {
            // Get selected model
            const selectedModel = this.modelSelectorElement.value as ModelType;

            // Send to API
            const response = await this.chatService.sendMessage(this.chatHistory, selectedModel);

            // Remove thinking indicator
            this.removeThinkingIndicator();

            if (response.error) {
                this.showErrorMessage(response.error);
            } else {
                // Add assistant response to chat
                this.chatHistory.push(response.message);
                this.addMessageToUI(response.message);
            }
        } catch (error) {
            // Remove thinking indicator
            this.removeThinkingIndicator();
            
            // Show error
            this.showErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
        } finally {
            this.isWaitingForResponse = false;
            this.scrollToBottom();
        }
    }

    private addMessageToUI(message: Message): void {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        
        if (message.role === 'user') {
            messageElement.classList.add('user-message');
        } else {
            messageElement.classList.add('assistant-message');
        }
        
        // Process markdown in the content
        messageElement.innerHTML = this.formatMessageContent(message.content);
        
        this.chatHistoryElement.appendChild(messageElement);
        this.scrollToBottom();
    }

    private formatMessageContent(content: string): string {
        // Simple markdown processing (this is very basic, you might want to use a library like marked.js)
        
        // Convert code blocks
        content = content.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
        
        // Convert inline code
        content = content.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Convert bold text
        content = content.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        
        // Convert italic text
        content = content.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        
        // Convert line breaks
        content = content.replace(/\n/g, '<br>');
        
        return content;
    }

    private showThinkingIndicator(): void {
        const thinkingElement = document.createElement('div');
        thinkingElement.classList.add('message', 'assistant-message', 'thinking');
        thinkingElement.id = 'thinking-indicator';
        thinkingElement.textContent = 'Thinking...';
        this.chatHistoryElement.appendChild(thinkingElement);
        this.scrollToBottom();
    }

    private removeThinkingIndicator(): void {
        const thinkingElement = document.getElementById('thinking-indicator');
        if (thinkingElement) {
            thinkingElement.remove();
        }
    }

    private showErrorMessage(errorMessage: string): void {
        const errorElement = document.createElement('div');
        errorElement.classList.add('error');
        errorElement.textContent = `Error: ${errorMessage}`;
        this.chatHistoryElement.appendChild(errorElement);
        this.scrollToBottom();
    }

    private scrollToBottom(): void {
        this.chatHistoryElement.scrollTop = this.chatHistoryElement.scrollHeight;
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ChatApp();
});