// Configuration utility for the application
// Replaces backend/config.py and adds Supabase configuration

// Environment variables are automatically loaded by Next.js
// See: https://nextjs.org/docs/basic-features/environment-variables

export class Config {
  // OpenAI API Key - should be set in Vercel environment variables
  static readonly OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
  
  // Supabase Configuration
  static readonly SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  static readonly SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  static readonly SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  
  // Default settings
  static readonly DEFAULT_MODEL = process.env.DEFAULT_MODEL || 'gpt-4.1-mini-2025-04-14';
  static readonly MAX_COMPLETION_TOKENS = parseInt(process.env.MAX_COMPLETION_TOKENS || '2000');
  
  // Environment
  static readonly ENV = process.env.NODE_ENV || 'development';
  static readonly DEBUG = process.env.DEBUG === 'true' || process.env.NODE_ENV !== 'production';
  
  // Helper methods
  static isProduction(): boolean {
    return this.ENV === 'production';
  }
  
  // Validate configuration
  static validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!this.OPENAI_API_KEY) {
      errors.push('OPENAI_API_KEY is not set');
    }
    
    if (!this.SUPABASE_URL) {
      errors.push('NEXT_PUBLIC_SUPABASE_URL is not set');
    }
    
    if (!this.SUPABASE_ANON_KEY) {
      errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
    }
    
    // Service role key is optional for basic operations
    if (!this.SUPABASE_SERVICE_ROLE_KEY && this.isProduction()) {
      console.warn('SUPABASE_SERVICE_ROLE_KEY is not set - some admin operations may not work');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  // Validate Supabase configuration specifically
  static validateSupabase(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!this.SUPABASE_URL) {
      errors.push('NEXT_PUBLIC_SUPABASE_URL is not set');
    } else if (!this.SUPABASE_URL.startsWith('https://')) {
      errors.push('NEXT_PUBLIC_SUPABASE_URL should start with https://');
    }
    
    if (!this.SUPABASE_ANON_KEY) {
      errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}