// Supabase client configuration
// chat-interface/lib/supabase.ts

import { createClient } from '@supabase/supabase-js';
import { Config } from './config';

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  Config.SUPABASE_URL,
  Config.SUPABASE_ANON_KEY
);

// Type for database schema - you can extend this as you create tables
export type Database = {
  public: {
    Tables: {
      // Add your table types here as you create them
      // Example:
      // conversations: {
      //   Row: {
      //     id: string;
      //     user_id: string;
      //     title: string;
      //     created_at: string;
      //     updated_at: string;
      //   };
      //   Insert: {
      //     id?: string;
      //     user_id: string;
      //     title: string;
      //   };
      //   Update: {
      //     title?: string;
      //   };
      // };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};

// Export typed client
export const supabaseTyped = createClient<Database>(
  Config.SUPABASE_URL,
  Config.SUPABASE_ANON_KEY
);

// Export the client as default for easier imports
export default supabase;