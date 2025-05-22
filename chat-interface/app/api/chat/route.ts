// API route for chat endpoint
// Replaces the /api/chat endpoint in backend/app.py

import { NextRequest, NextResponse } from 'next/server';
import { OpenAIClient } from '@/lib/openai-client';
import { Config } from '@/lib/config';
import { ChatRequest, ChatResponse } from '@/lib/types';

// Initialize the OpenAI client
const openAIClient = new OpenAIClient();

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const requestData: ChatRequest = await request.json();
    
    // Validate the OpenAI API key
    const configValidation = Config.validate();
    if (!configValidation.valid) {
      const errorResponse: ChatResponse = {
        message: { role: 'assistant', content: '' },
        error: `Configuration error: ${configValidation.errors.join(', ')}`
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }
    
    // Log the incoming request in debug mode
    if (Config.DEBUG) {
      console.log(`Received chat request with model: ${requestData.model}`);
    }
    
    // Map the model type to an actual model name
    let modelName: string;
    switch (requestData.model) {
      case 'chat':
        modelName = 'gpt-4.1-mini-2025-04-14';
        break;
      case 'reason':
        modelName = 'o4-mini-2025-04-16';
        break;
      case 'search':
        modelName = 'gpt-4o-mini-search-preview-2025-03-11';
        break;
      default:
        modelName = 'gpt-4.1-mini-2025-04-14';
    }
    
    // Generate the response
    const response = await openAIClient.generateResponse(requestData.messages, modelName);
    
    // Return the response as ChatResponse
    return NextResponse.json(response as ChatResponse);
  } catch (error) {
    console.error('Error in chat API route:', error);
    
    // Return a 500 error
    const errorResponse: ChatResponse = {
      message: { role: 'assistant', content: '' },
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}