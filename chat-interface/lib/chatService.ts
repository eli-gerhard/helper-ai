'use client';

import { ChatRequest, ChatResponse, Message } from './types';

export class ChatService {
    // Use environment variable with fallback
    private readonly apiUrl = '/api/chat';

    async sendMessage(messages: Message[], model: string): Promise<ChatResponse> {
        try {
            // console.log('Sending request to:', this.apiUrl);
            console.log('Model Input:', { messages, model });
            
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ messages, model } as ChatRequest),
                cache: 'no-store' // Ensure we never cache chat responses
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