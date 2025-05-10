'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Message as MessageType } from '@/lib/types';
import Message from './Message';

interface ChatAreaProps {
  chatHistory: MessageType[];
}

const ChatArea: React.FC<ChatAreaProps> = ({ chatHistory }) => {
  const chatHistoryRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  
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
  
  // Update gradient on scroll
  const handleScroll = () => {
    if (chatHistoryRef.current) {
      setScrollPosition(chatHistoryRef.current.scrollTop);
    }
  };
  
  useEffect(() => {
    const chatHistory = chatHistoryRef.current;
    if (chatHistory) {
      chatHistory.addEventListener('scroll', handleScroll);
      return () => chatHistory.removeEventListener('scroll', handleScroll);
    }
  }, []);
  
  return (
    <div 
      ref={chatHistoryRef}
      className="gradient-container h-full w-full overflow-y-auto p-5 flex flex-col gap-5"
      style={{ '--scroll-position': `${scrollPosition}px` } as React.CSSProperties}
    >
      {chatHistory.filter(msg => msg.role !== 'system').map((message, index) => (
        <Message key={index} message={message} />
      ))}
      {/* Add a small spacer at the bottom to ensure there's room when scrolling to the bottom */}
      <div className="h-2 w-full flex-shrink-0"></div>
    </div>
  );
};

export default ChatArea;