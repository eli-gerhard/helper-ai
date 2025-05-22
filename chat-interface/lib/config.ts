// Configuration utility for the application
// Replaces backend/config.py

// Environment variables are automatically loaded by Next.js
// See: https://nextjs.org/docs/basic-features/environment-variables

export class Config {
  // OpenAI API Key - should be set in Vercel environment variables
  static readonly OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
  
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
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}