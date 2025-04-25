import React, { useState, useEffect, useRef } from 'react';
import { Message, ModelType } from './types';
import { ChatService } from './ChatService';

const App: React.FC = () => {
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [isWaitingForResponse, setIsWaitingForResponse] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<ModelType>('gpt-4.1-mini-2025-04-14');
  
  const chatHistoryRef = useRef<HTMLDivElement>(null);
  const chatService = new ChatService();
  
  // Scroll to bottom of chat history
  const scrollToBottom = () => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  };
  
  // Add welcome message when component mounts
  useEffect(() => {
    const welcomeMessage: Message = { 
      role: 'assistant', 
      content: 'Hello! I\'m your AI assistant. How can I help you today?' 
    };
    setChatHistory([welcomeMessage]);
  }, []);
  
  // Scroll to bottom when chat history changes
  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);
  
  // Format message content (basic markdown processing)
  const formatMessageContent = (content: string): { __html: string } => {
    let formattedContent = content;
    
    // Convert code blocks
    formattedContent = formattedContent.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    
    // Convert inline code
    formattedContent = formattedContent.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Convert bold text
    formattedContent = formattedContent.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Convert italic text
    formattedContent = formattedContent.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // Convert line breaks
    formattedContent = formattedContent.replace(/\n/g, '<br>');
    
    return { __html: formattedContent };
  };
  
  // Handle sending a message
  const sendMessage = async () => {
    if (isWaitingForResponse || !userInput.trim()) return;
    
    // Add user message to chat
    const userMessage: Message = { role: 'user', content: userInput.trim() };
    setChatHistory(prevHistory => [...prevHistory, userMessage]);
    setUserInput('');
    
    // Show thinking indicator
    setChatHistory(prevHistory => [...prevHistory, { role: 'assistant', content: 'Thinking...' }]);
    setIsWaitingForResponse(true);
    
    try {
      // Send to API
      const response = await chatService.sendMessage([...chatHistory, userMessage], selectedModel);
      
      // Remove thinking indicator and add response
      setChatHistory(prevHistory => {
        const newHistory = prevHistory.filter(msg => msg.content !== 'Thinking...');
        
        if (response.error) {
          // Add error message
          return [...newHistory, { role: 'assistant', content: `Error: ${response.error}` }];
        }
        
        // Add assistant response
        return [...newHistory, response.message];
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
  
  // Handle Enter key press in textarea
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };
  
  // Auto-resize textarea as user types
  const handleTextareaInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = event.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };
  
  return (
    <div className="flex flex-col h-screen bg-amber-50">
      <div className="flex flex-col h-full max-w-2xl mx-auto w-full">
        <div className="p-4 border-b border-amber-200 bg-amber-100 text-center">
          <h1 className="text-xl text-gray-800">ember.ai</h1>
        </div>
        
        <div 
          ref={chatHistoryRef}
          className="flex-1 overflow-y-auto p-5 flex flex-col gap-5"
        >
          {chatHistory.map((message, index) => (
            <div 
              key={index}
              className={`max-w-[80%] leading-relaxed ${
                message.role === 'user' ? 'user-message' : 
                message.content === 'Thinking...' ? 'thinking' : 'assistant-message'
              }`}
            >
              {message.content === 'Thinking...' ? (
                message.content
              ) : (
                <div dangerouslySetInnerHTML={formatMessageContent(message.content)} />
              )}
            </div>
          ))}
        </div>
        
        <div className="p-5 border-t border-amber-200 bg-amber-100">
          <div className="mb-2.5">
            <label htmlFor="model-selector" className="mr-2">Model:</label>
            <select 
              id="model-selector"
              className="p-2 rounded border border-gray-300 bg-white text-sm"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as ModelType)}
            >
              <option value="gpt-4.1-mini-2025-04-14">Standard GPT</option>
              <option value="o4-mini-2025-04-16">Reasoning</option>
              <option value="gpt-4o-mini-search-preview-2025-03-11">Search GPT</option>
            </select>
          </div>
          
          <div className="flex gap-2.5 items-end">
            <textarea 
              className="flex-1 p-3 border border-gray-300 rounded resize-none h-[60px] text-base max-h-[200px]"
              placeholder="Type your message here..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onInput={handleTextareaInput}
            />
            
            <button 
              className="p-3.5 bg-red-600 text-white border-none rounded cursor-pointer flex items-center justify-center hover:bg-red-900"
              onClick={sendMessage}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;