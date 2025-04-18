// Define types for our chat application

export interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export interface ChatRequest {
    messages: Message[];
    model: string;
}

export interface ChatResponse {
    message: Message;
    error?: string;
}

export type ModelType = 'gpt-4.1-mini' | 'o4-mini' | 'gpt-4o-mini-search-preview';