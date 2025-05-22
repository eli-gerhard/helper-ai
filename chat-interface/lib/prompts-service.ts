// Prompts service for the application
// Replaces the prompt loading functionality from backend/app.py

import fs from 'fs';
import path from 'path';

// Define allowed prompts for security
const ALLOWED_PROMPTS = ['identityprompt', 'queryprompt', 'questionprompt'];

export class PromptsService {
  /**
   * Get the content of a prompt file
   * @param promptName The name of the prompt
   * @returns The content of the prompt file
   */
  static async getPrompt(promptName: string): Promise<string | null> {
    // Check if the prompt is allowed
    if (!ALLOWED_PROMPTS.includes(promptName)) {
      console.warn(`Attempted to load disallowed prompt: ${promptName}`);
      return null;
    }
    
    try {
      // Create path to the prompt file (using app directory)
      const filePath = path.join(process.cwd(), 'prompts', `${promptName}.txt`);
      
      // Read the file asynchronously
      const content = await fs.promises.readFile(filePath, 'utf-8');
      return content;
    } catch (error) {
      console.error(`Error reading prompt ${promptName}:`, error);
      return null;
    }
  }
}