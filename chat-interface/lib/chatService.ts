'use client';

import { ChatRequest, ChatResponse, Message, Conversation, TokenUsage, DailyTokenUsage } from './types';

export class ChatService {
    // Use environment variable with fallback
    private readonly apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/chat';
    private readonly conversationsUrl = '/api/conversations';
    private readonly messagesUrl = '/api/conversations/';

    async sendMessage(
        messages: Message[], 
        model: string, 
        conversationId?: string,
        userId?: string
    ): Promise<ChatResponse> {
        try {
            const url = this.apiUrl.includes('/api/chat') ? this.apiUrl : `${this.apiUrl}/api/chat`;

            console.log('Sending request to:', url);
            console.log('Model Input:', { messages, model, conversationId, userId });
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(userId && { 'X-User-ID': userId }), // Add user ID header if available
                },
                body: JSON.stringify({ 
                    messages, 
                    model,
                    conversation_id: conversationId,
                    user_id: userId
                } as ChatRequest),
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

    // Get user conversations
    async getConversations(userId: string): Promise<Conversation[]> {
        try {
            const response = await fetch(this.conversationsUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-ID': userId
                },
                cache: 'no-store'
            });

            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }

            return await response.json() as Conversation[];
        } catch (error) {
            console.error('Error fetching conversations:', error);
            return [];
        }
    }

    // Create a new conversation
    async createConversation(userId: string, title: string = 'New Conversation'): Promise<Conversation> {
        try {
            const response = await fetch(this.conversationsUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-ID': userId
                },
                body: JSON.stringify({
                    user_id: userId,
                    title
                }),
                cache: 'no-store'
            });

            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }

            return await response.json() as Conversation;
        } catch (error) {
            console.error('Error creating conversation:', error);
            throw error;
        }
    }

    // Get messages for a conversation
    async getConversationMessages(conversationId: string, userId: string): Promise<Message[]> {
        try {
            const response = await fetch(`${this.messagesUrl}${conversationId}/messages`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-ID': userId
                },
                cache: 'no-store'
            });

            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }

            const messages = await response.json();
            return messages.map((msg: { role: string; content: string }) => ({
                role: msg.role,
                content: msg.content
            }));
        } catch (error) {
            console.error('Error fetching messages:', error);
            return [];
        }
    }

    // Update conversation title
    async updateConversationTitle(conversationId: string, userId: string, title: string): Promise<Conversation> {
        try {
            const response = await fetch(`${this.conversationsUrl}/${conversationId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-ID': userId
                },
                body: JSON.stringify({
                    title
                }),
                cache: 'no-store'
            });

            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }

            return await response.json() as Conversation;
        } catch (error) {
            console.error('Error updating conversation title:', error);
            throw error;
        }
    }

    // Delete a conversation
    async deleteConversation(conversationId: string, userId: string): Promise<boolean> {
        try {
            const response = await fetch(`${this.conversationsUrl}/${conversationId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-ID': userId
                },
                cache: 'no-store'
            });

            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }

            return true;
        } catch (error) {
            console.error('Error deleting conversation:', error);
            return false;
        }
    }

    // Get user token usage
    async getTokenUsage(userId: string): Promise<TokenUsage> {
        try {
            const response = await fetch('/api/users/usage/total', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-ID': userId
                },
                cache: 'no-store'
            });

            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }

            return await response.json() as TokenUsage;
        } catch (error) {
            console.error('Error fetching token usage:', error);
            return {
                prompt_tokens: 0,
                completion_tokens: 0,
                total_tokens: 0
            };
        }
    }

    // Get daily token usage
    async getDailyTokenUsage(userId: string): Promise<DailyTokenUsage[]> {
        try {
            const response = await fetch('/api/users/usage/daily', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-ID': userId
                },
                cache: 'no-store'
            });

            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }

            return await response.json() as DailyTokenUsage[];
        } catch (error) {
            console.error('Error fetching daily token usage:', error);
            return [];
        }
    }
}