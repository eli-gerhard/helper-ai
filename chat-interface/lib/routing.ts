'use client';

import { Message, ModelType } from './types';
import { ChatService } from './chatService';

interface RoutingProps {
  routingResponse: string;
  chatHistory: Message[];
  userMessage: Message;
  questionPrompt: Message;
}

export class Routing {
  private chatService: ChatService;

  constructor() {
    this.chatService = new ChatService();
  }

  async route(props: RoutingProps): Promise<Message> {
    const { routingResponse, chatHistory, userMessage, questionPrompt } = props;
    
    // Determine the model based on routing response
    let model: ModelType;
    let messagesToSend: Message[];
    
    // Check if the routing response contains any of our keywords
    const cleanedResponse = routingResponse.toLowerCase().trim();
    
    switch (cleanedResponse) {
      case 'chat':
        model = 'chat';
        messagesToSend = [...chatHistory, userMessage];
        break;
      case 'search':
        model = 'search';
        messagesToSend = [...chatHistory, userMessage];
        break;
      case 'complex':
        model = 'reason';
        messagesToSend = [...chatHistory, userMessage];
        break;
      case 'context':
        model = 'chat';
        messagesToSend = [...chatHistory, userMessage, questionPrompt];
        break;
      default:
        // Fallback to chat if unknown response
        console.warn(`Unknown routing response: ${routingResponse}, defaulting to chat`);
        model = 'chat';
        messagesToSend = [...chatHistory, userMessage];
    }
        
    // Send to appropriate model
    const finalResponse = await this.chatService.sendMessage(messagesToSend, model);
    
    if (finalResponse.error) {
      return { role: 'assistant', content: `Error: ${finalResponse.error}` };
    }
    
    return finalResponse.message;
  }
}