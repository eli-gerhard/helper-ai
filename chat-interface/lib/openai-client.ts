// OpenAI client for the application
// Replaces backend/openai_client.py

import OpenAI from 'openai';
import { Config } from './config';
import { Message } from './types';

export class OpenAIClient {
  private client: OpenAI;
  
  constructor() {
    // Create the OpenAI client with API key
    this.client = new OpenAI({
      apiKey: Config.OPENAI_API_KEY,
    });
  }
  
  /**
   * Generate a response using the specified model
   * @param messages The chat history
   * @param model The model to use
   * @returns The generated response
   */
  async generateResponse(messages: Message[], model: string): Promise<{
    message: Message;
    error?: string;
  }> {
    try {
      return await this.callOpenAIAPI(messages, model);
    } catch (error) {
      console.error('Error in generateResponse:', error);
      
      return {
        message: {
          role: 'assistant',
          content: `Sorry, there was an error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
        },
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
  
  /**
   * Call the OpenAI API to generate a response
   * @param messages The chat history
   * @param model The model to use
   * @returns The generated response
   */
  private async callOpenAIAPI(messages: Message[], model: string): Promise<{
    message: Message;
    error?: string;
  }> {
    try {
      console.log(`Calling OpenAI API with model: ${model}`);
      
      // Convert our Message format to OpenAI's ChatCompletionMessageParam
      const openAIMessages = messages.map(msg => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content
      }));
      
      const response = await this.client.chat.completions.create({
        model: model,
        messages: openAIMessages,
        max_tokens: Config.MAX_COMPLETION_TOKENS,
      });
      
      // Return the response content
      return {
        message: {
          role: 'assistant',
          content: response.choices[0].message.content || ''
        }
      };
    } catch (error) {
      console.error('ERROR in OpenAI API call:', error);
      throw error;
    }
  }
}