'use client';

import { ChatRequest, ChatResponse, Message } from './types';

export class ChatService {
    // Use environment variable with fallback
    private readonly apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/chat';

    async sendMessage(messages: Message[], model: string): Promise<ChatResponse> {
        try {
            const url = this.apiUrl.includes('/api/chat') ? this.apiUrl : `${this.apiUrl}/api/chat`;

            console.log('Sending request to:', url);
            console.log('Model Input:', { messages, model });
            
            const response = await fetch(url, {
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