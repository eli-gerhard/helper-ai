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
      className="flex-1 overflow-y-auto p-5 flex flex-col gap-5"
    >
      {chatHistory.filter(msg => msg.role !== 'system').map((message, index) => (
        <Message key={index} message={message} />
      ))}
    </div>
  );
};

export default ChatArea;