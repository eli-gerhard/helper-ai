'use client';

import React, { useState, useRef } from 'react';
import { Send } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isWaitingForResponse: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage, 
  isWaitingForResponse 
}) => {
  const [userInput, setUserInput] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Handle Enter key press in textarea
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };
  
  // Auto-resize textarea as user types
  const handleTextareaInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = event.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`; // Cap at 200px height
  };
  
  const handleSendMessage = () => {
    if (isWaitingForResponse || !userInput.trim()) return;
    
    onSendMessage(userInput.trim());
    setUserInput('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };
  
  return (
    <div className="w-full bg-[var(--background)] border-t border-blue-600 flex-shrink-0">
      <div className="max-w-4xl mx-auto p-5">
        <div className="flex gap-2.5 items-end align-middle">
          <textarea 
            ref={textareaRef}
            className="flex-1 p-3 border border-blue-600 rounded resize-none h-[60px] text-base max-h-[200px] text-white"
            placeholder="Type your message here..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleTextareaInput}
            disabled={isWaitingForResponse}
          />
          
          <button 
            className="p-3.5 bg-[var(--background)] text-red-600 border border-red-600 rounded cursor-pointer flex items-center justify-center hover:bg-[var(--hover)] disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSendMessage}
            disabled={isWaitingForResponse || !userInput.trim()}
          >
            <Send />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;