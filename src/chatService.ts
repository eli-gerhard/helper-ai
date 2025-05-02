import { ChatRequest, ChatResponse, Message } from './types';

export class ChatService {
    // Use environment variable with fallback to localhost for development
    private readonly apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/chat';
    // private readonly apiUrl = 'http://localhost:8000/api/chat';

    async sendMessage(messages: Message[], model: string): Promise<ChatResponse> {
        try {
            console.log('Model Input:');
            console.log({ messages, model });
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ messages, model } as ChatRequest),
            });

            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }

            return await response.json() as ChatResponse;
        } catch (error) {
            console.error('Error sending message:', error);
            return {
                message: { role: 'assistant', content: '' },
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
}