// Define types for our chat application

export interface Message {
    role: 'user' | 'assistant' | 'system' | 'developer';
    content: string;
}

export interface ChatRequest {
    messages: Message[];
    model: string;
    conversation_id?: string;
    user_id?: string;
}

export interface ChatResponse {
    message: Message;
    error?: string;
}

export interface Conversation {
    id: string;
    user_id: string;
    title: string;
    created_at: string;
    updated_at: string;
}

export interface User {
    id: string;
    email: string;
    username: string;
    auth0_id?: string;
    token_balance: number;
    token_usage_this_month: number;
    subscription_tier: string;
    created_at: string;
}

export interface TokenUsage {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
}

export interface DailyTokenUsage {
    day: string;
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
}

export type ModelType = 'chat' | 'reason' | 'search';