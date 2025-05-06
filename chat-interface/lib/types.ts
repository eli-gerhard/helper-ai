// Define types for our chat application

export interface Message {
    role: 'user' | 'assistant' | 'system' | 'developer';
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

export type ModelType = 'chat' | 'reason' | 'search';