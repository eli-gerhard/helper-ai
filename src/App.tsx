import React, { useState, useEffect, useRef } from 'react';
import { Message, ModelType } from './types';
import { ChatService } from './ChatService';

const App: React.FC = () => {
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [isWaitingForResponse, setIsWaitingForResponse] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<ModelType>('gpt-4.1-mini-2025-04-14');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(false);
  
  const chatHistoryRef = useRef<HTMLDivElement>(null);
  const chatService = new ChatService();
  const CHAT_MIN_WIDTH = 320; // Minimum width for chat in pixels
  
  // Check screen size on component mount and window resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth - 250 < CHAT_MIN_WIDTH);
    };
    
    window.addEventListener('resize', checkScreenSize);
    checkScreenSize();
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
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
  
  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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

  // Menu icon SVG component
  const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
  
  return (
    <div className="flex h-screen bg-amber-50 relative overflow-hidden">
      {/* Sidebar - Content visibility tied to open state */}
      <div 
        className={`fixed md:relative z-10 h-full bg-amber-200 shadow-lg transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full overflow-hidden'
        }`}
      >
        {isSidebarOpen && (
          <div className="h-full overflow-y-auto">
            <div className="py-[10px] px-7 border-b border-amber-300 flex items-center">
              <button 
                onClick={toggleSidebar} 
                className="p-2 rounded-md hover:bg-amber-300 transition-colors"
                aria-label="Close menu"
              >
                <MenuIcon />
              </button>
            </div>
            <nav className="p-4">
              <ul className="space-y-3">
                {['Home', 'Conversations', 'Settings', 'Models', 'Account', 'Help'].map((item) => (
                  <li key={item}>
                    <a href="#" className="block p-2 rounded hover:bg-amber-300 transition-colors text-gray-800">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        )}
      </div>
      
      {/* Darkening overlay for small screens */}
      {isSidebarOpen && isSmallScreen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[5] md:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Main content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header bar - Full width with menu icon positioned at the edge */}
        <div className="w-full bg-amber-100 border-b border-amber-200">
          <div className="flex items-center">
            {/* Menu button only shown when sidebar is closed */}
            {!isSidebarOpen && (
              <button 
                onClick={toggleSidebar}
                className="p-4 hover:bg-amber-200 transition-colors"
                aria-label="Toggle menu"
              >
                <MenuIcon />
              </button>
            )}
            
            {/* Title centered in the remaining space */}
            <div className="flex-1 flex justify-center">
              <h1 className="text-xl text-gray-800 py-4">ember.ai</h1>
            </div>
          </div>
        </div>
        
        {/* Chat container - 25% larger max width */}
        <div className="flex-1 overflow-hidden flex flex-col mx-auto w-full max-w-4xl">
          {/* Chat history */}
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
          
          {/* Input area - Full width background, content constrained */}
          <div className="w-full bg-amber-100 border-t border-amber-200">
            <div className="max-w-4xl mx-auto p-5">
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
      </div>
    </div>
  );
};

export default App;