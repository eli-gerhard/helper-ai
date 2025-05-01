import React, { useState, useEffect, useRef } from 'react';
import { Send, Menu } from 'lucide-react';
import { Message, ModelType } from './types';
import { ChatService } from './ChatService';
import { Routing } from './Routing';

const App: React.FC = () => {
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [isWaitingForResponse, setIsWaitingForResponse] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<ModelType>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(false);
  const [identityPrompt, setIdentityPrompt] = useState<string>('');
  const [queryPrompt, setQueryPrompt] = useState<Message>({role: 'developer', content: ''});
  const [questionPrompt, setQuestionPrompt] = useState<Message>({role: 'developer', content: ''});
  
  const chatHistoryRef = useRef<HTMLDivElement>(null);
  const chatService = new ChatService();
  const routing = new Routing();
  const CHAT_MIN_WIDTH = 320;
  
  // Load identity prompt when component mounts
  useEffect(() => {
    const loadIdentityPrompt = async () => {
      try {
        const identityprompt = await fetch('/identityprompt.txt');
        if (!identityprompt.ok) {
          throw new Error(`Failed to fetch identity prompt: ${identityprompt.status}`);
        }
        const text = await identityprompt.text();
        setIdentityPrompt(text);
      } catch (error) {
        console.log('Error loading identity prompt:', error);
        setIdentityPrompt('You are a helpful assistant.');
      }
    };
    console.log('identity import');
    loadIdentityPrompt();
  }, []);

  // Load query prompt when component mounts
  useEffect(() => {
    const loadQueryPrompt = async () => {
      try {
        const queryprompt = await fetch('/queryprompt.txt');
        if (!queryprompt.ok) {
          throw new Error(`Failed to fetch query prompt: ${queryprompt.status}`);
        }
        const query: Message = {
          role: 'developer',
          content: await queryprompt.text()
        }
        setQueryPrompt(query);
      } catch (error) {
        console.log('Error loading query prompt:', error);
        const query: Message = {
          role: 'developer',
          content: ''
        }
        setQueryPrompt(query);
      }
    };
    console.log('query import');
    loadQueryPrompt();
  }, []);

  // Load question prompt when component mounts
  useEffect(() => {
    const loadQuestionPrompt = async () => {
      try {
        const questionprompt = await fetch('/questionprompt.txt');
        if (!questionprompt.ok) {
          throw new Error(`Failed to fetch question prompt: ${questionprompt.status}`);
        }
        const question: Message = {
          role: 'developer',
          content: await questionprompt.text()
        }
        setQuestionPrompt(question);
      } catch (error) {
        console.log('Error loading question prompt:', error);
        const question: Message = {
          role: 'developer',
          content: ''
        }
        setQuestionPrompt(question);
      }
    };
    console.log('question import');
    loadQuestionPrompt();
  }, []);

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
      console.log('startup');
      setChatHistory([identity, welcomeMessage]);
    }
  }, [identityPrompt]);

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
    
    // Add bullet and hashtag formatting //////////////////////////////////////////////////////////////

    // Add table formatting //////////////////////////////////////////////////////////////

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
      // First, get the routing response
      // const routingResponse = await chatService.sendMessage([...chatHistory, userMessage, queryPrompt], selectedModel);
      const routingResponse = await chatService.sendMessage([...chatHistory, userMessage, queryPrompt], 'chat');
      console.log(routingResponse.message.content);
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
    <div className="flex h-screen bg-gray-800 relative overflow-hidden">
      {/* Sidebar */}
      <div 
        className={`fixed md:relative z-10 h-full bg-gray-800 shadow-lg transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full overflow-hidden'
        }`}
      >
        {isSidebarOpen && (
          <div className="h-full overflow-y-auto">
            <div className="py-[10px] px-5 border-b border-amber-300 flex items-center">
              <button 
                onClick={toggleSidebar} 
                className="p-2 rounded-md hover:bg-amber-300 transition-colors"
                aria-label="Close menu"
              >
                <Menu />
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
        {/* Header bar */}
        <div className="w-full bg-amber-100 border-b border-amber-200">
          <div className="flex items-center">
            {!isSidebarOpen && (
              <button 
                onClick={toggleSidebar}
                className="absolute p-2 m-2 rounded-md hover:bg-amber-200 transition-colors"
                aria-label="Toggle menu"
              >
                <Menu />
              </button>
            )}
            
            <div className="flex-1 flex justify-center">
              <h1 className="text-xl text-gray-800 py-4">ember.ai</h1>
            </div>
          </div>
        </div>
        
        {/* Chat container */}
        <div className="flex-1 overflow-hidden flex flex-col mx-auto w-full max-w-4xl">
          {/* Chat history */}
          <div 
            ref={chatHistoryRef}
            className="flex-1 overflow-y-auto p-5 flex flex-col gap-5"
          >
            {chatHistory.filter(msg => msg.role !== 'system').map((message, index) => (
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
        </div>

        {/* Input area */}
        <div className="w-full bg-amber-100 border-t border-amber-200">
          <div className="max-w-4xl mx-auto p-5">
            {/* <div className="mb-2.5">
              <label htmlFor="model-selector" className="mr-2">Model:</label>
              <select 
                id="model-selector"
                className="p-2 rounded border border-gray-300 bg-white text-sm"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as ModelType)}
              >
                <option value="chat">Standard GPT</option>
                <option value="reason">Reasoning</option>
                <option value="search">Search GPT</option>
              </select>
            </div> */}
            
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
                <Send />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;