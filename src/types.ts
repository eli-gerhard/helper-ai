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

export type ModelType = 'gpt-4.1-mini-2025-04-14' | 'o4-mini-2025-04-16' | 'gpt-4o-mini-search-preview-2025-03-11';