// Database service layer for Supabase operations
// chat-interface/lib/database-service.ts

import { supabase } from './supabase';
import { User, Conversation, TokenUsage, DailyTokenUsage } from './types';

export class DatabaseService {
  
  // Test the database connection
  static async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.from('users').select('count').limit(1);
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown connection error' 
      };
    }
  }
  
  // User operations (examples - you'll implement these once you create the tables)
  static async createUser(userData: Partial<User>): Promise<{ data: User | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single();
      
      return { data, error: error?.message || null };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Unknown error creating user' 
      };
    }
  }
  
  static async getUser(userId: string): Promise<{ data: User | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      return { data, error: error?.message || null };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Unknown error fetching user' 
      };
    }
  }
  
  // Conversation operations (examples)
  static async createConversation(conversationData: Partial<Conversation>): Promise<{ data: Conversation | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert([conversationData])
        .select()
        .single();
      
      return { data, error: error?.message || null };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Unknown error creating conversation' 
      };
    }
  }
  
  static async getUserConversations(userId: string): Promise<{ data: Conversation[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });
      
      return { data, error: error?.message || null };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Unknown error fetching conversations' 
      };
    }
  }
  
  // Health check
  static async healthCheck(): Promise<{ healthy: boolean; details: any }> {
    try {
      const connectionTest = await this.testConnection();
      
      return {
        healthy: connectionTest.success,
        details: {
          connection: connectionTest.success ? 'OK' : connectionTest.error,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        healthy: false,
        details: {
          connection: 'ERROR',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      };
    }
  }
}