'use client';

import React, { useRef, useEffect } from 'react';
import { Message as MessageType } from '@/lib/types';
import Message from './Message';

interface ChatAreaProps {
  chatHistory: MessageType[];
}

const ChatArea: React.FC<ChatAreaProps> = ({ chatHistory }) => {
  const chatHistoryRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom of chat history
  const scrollToBottom = () => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  };
  
  // Scroll to bottom when chat history changes
  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);
  
  return (
    <div 
      ref={chatHistoryRef}
      className="gradient-container h-full w-full overflow-y-auto p-5 flex flex-col gap-5"
    >
      {chatHistory.filter(msg => msg.role !== 'system').map((message, index) => (
        <Message key={index} message={message} />
      ))}
      {/* Add a small spacer at the bottom to ensure there's room when scrolling to the bottom */}
      <div className="h-1 w-full flex-shrink-0"></div>
    </div>
  );
};

export default ChatArea;