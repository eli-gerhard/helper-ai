'use client';

import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { Message } from '@/lib/types';
import { ChatService } from '@/lib/chatService';
import { Routing } from '@/lib/routing';
import Sidebar from '@/components/Sidebar';
import ChatArea from '@/components/ChatArea';
import MessageInput from '@/components/MessageInput';
import Image from 'next/image';

export default function HomePage() {
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState<boolean>(false);
  // const [selectedModel, setSelectedModel] = useState<ModelType>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(false);
  const [identityPrompt, setIdentityPrompt] = useState<string>('');
  const [queryPrompt, setQueryPrompt] = useState<Message>({role: 'developer', content: ''});
  const [questionPrompt, setQuestionPrompt] = useState<Message>({role: 'developer', content: ''});
  
  const CHAT_MIN_WIDTH = 320;
  const chatService = new ChatService();
  const routing = new Routing();
  
  // Load prompts and check screen size
  useEffect(() => {
    const loadPrompts = async () => {
      try {
        // Use explicit backend URL - change this if your backend URL is different
        const BACKEND_URL = 'http://127.0.0.1:8000';
        
        // Load identity prompt
        const identityResponse = await fetch(`${BACKEND_URL}/prompts/identityprompt`);
        if (identityResponse.ok) {
          const data = await identityResponse.json();
          setIdentityPrompt(data.content);
        } else {
          console.warn('Could not load identity prompt, using fallback');
          setIdentityPrompt('You are a helpful assistant.');
        }
        
        // Load query prompt
        const queryResponse = await fetch(`${BACKEND_URL}/prompts/queryprompt`);
        if (queryResponse.ok) {
          const data = await queryResponse.json();
          const query: Message = {
            role: 'developer',
            content: data.content
          };
          setQueryPrompt(query);
        } else {
          console.warn('Could not load query prompt, using fallback');
          setQueryPrompt({ role: 'developer', content: '' });
        }
        
        // Load question prompt
        const questionResponse = await fetch(`${BACKEND_URL}/prompts/questionprompt`);
        if (questionResponse.ok) {
          const data = await questionResponse.json();
          const question: Message = {
            role: 'developer',
            content: data.content
          };
          setQuestionPrompt(question);
        } else {
          console.warn('Could not load question prompt, using fallback');
          setQuestionPrompt({ role: 'developer', content: '' });
        }
      } catch (error) {
        console.error('Error loading prompts:', error);
        // Set fallback values
        setIdentityPrompt('You are a helpful assistant.');
        setQueryPrompt({ role: 'developer', content: '' });
        setQuestionPrompt({ role: 'developer', content: '' });
      }
    };
    
    loadPrompts();
    
    // Check screen size
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth - 250 < CHAT_MIN_WIDTH);
    };
    
    window.addEventListener('resize', checkScreenSize);
    checkScreenSize();
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  // Add welcome message and identity when identityPrompt is loaded
  useEffect(() => {
    if (identityPrompt) {
      const welcomeMessage: Message = { 
        role: 'assistant', 
        content: 'How can I help you today?' 
      };

      const identity: Message = {
        role: 'system',
        content: identityPrompt
      };
      
      setChatHistory([identity, welcomeMessage]);
    }
  }, [identityPrompt]);
  
  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  // Handle sending a message
  const sendMessage = async (userInputText: string) => {
    // Add user message to chat
    const userMessage: Message = { role: 'user', content: userInputText };
    setChatHistory(prevHistory => [...prevHistory, userMessage]);
    
    // Show thinking indicator
    setChatHistory(prevHistory => [...prevHistory, { role: 'assistant', content: 'Thinking...' }]);
    setIsWaitingForResponse(true);
    
    try {
      // First, get the routing response
      const routingResponse = await chatService.sendMessage([...chatHistory, userMessage, queryPrompt], 'chat');
      
      if (routingResponse.error) {
        throw new Error(routingResponse.error);
      }
      
      // Get the final response through routing
      const finalResponse = await routing.route({
        routingResponse: routingResponse.message.content,
        chatHistory: chatHistory,
        userMessage: userMessage,
        questionPrompt: questionPrompt
      });
      
      // Remove thinking indicator and add final response
      setChatHistory(prevHistory => {
        const newHistory = prevHistory.filter(msg => msg.content !== 'Thinking...');
        return [...newHistory, finalResponse];
      });
      
    } catch (error) {
      // Remove thinking indicator and add error message
      setChatHistory(prevHistory => {
        const newHistory = prevHistory.filter(msg => msg.content !== 'Thinking...');
        return [...newHistory, { 
          role: 'assistant', 
          content: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}` 
        }];
      });
    } finally {
      setIsWaitingForResponse(false);
    }
  };
  
  return (
    <div className="flex h-screen bg-gray-900 relative overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
        isSmallScreen={isSmallScreen} 
      />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header bar */}
        <div className="w-full bg-gray-900 border-b border-red-600">
          <div className="flex items-center">
            {!isSidebarOpen && (
              <button 
                onClick={toggleSidebar}
                className="absolute p-2 m-2 rounded-md hover:bg-gray-800 transition-colors"
                aria-label="Toggle menu"
              >
                <Menu className='stroke-white'/>
              </button>
            )}
            
            <div className="flex-1 flex justify-center">
              <div className="w-24 h-auto py-3.5 relative">
                <Image 
                  src="/planetslogo.png" 
                  alt="Logo" 
                  width={96} 
                  height={40} 
                  priority 
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Chat container */}
        <div className="flex-1 overflow-hidden flex flex-col mx-auto w-full max-w-4xl">
          {/* Chat history */}
          <ChatArea chatHistory={chatHistory} />
        </div>

        {/* Input area */}
        <MessageInput 
          onSendMessage={sendMessage} 
          isWaitingForResponse={isWaitingForResponse} 
        />
      </div>
    </div>
  );
}