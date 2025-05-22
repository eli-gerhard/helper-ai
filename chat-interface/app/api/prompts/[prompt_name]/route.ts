// API route for prompts endpoint
// Replaces the /prompts/{prompt_name} endpoint in backend/app.py

import { NextRequest, NextResponse } from 'next/server';
import { PromptsService } from '@/lib/prompts-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { prompt_name: string } }
) {
  try {
    // Get the prompt name from the route parameter
    const promptName = params.prompt_name;
    
    // Get the prompt content
    const content = await PromptsService.getPrompt(promptName);
    
    // If the prompt doesn't exist or isn't allowed, return a 404
    if (!content) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      );
    }
    
    // Return the prompt content
    return NextResponse.json({ content });
  } catch (error) {
    console.error(`Error reading prompt: ${error}`);
    
    // Return a 500 error
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
}