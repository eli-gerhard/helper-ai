'use client';

import React from 'react';
import { Message as MessageType } from '@/lib/types';
import ReactMarkdown from 'react-markdown';

interface MessageProps {
  message: MessageType;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  return (
    <div 
      className={`max-w-[80%] leading-relaxed ${
        message.role === 'user' ? 'user-message' : 
        message.content === 'Thinking...' ? 'thinking' : 'assistant-message'
      }`}
    >
      {message.content === 'Thinking...' ? (
        message.content
      ) : (
        <ReactMarkdown>{message.content}</ReactMarkdown>
      )}
    </div>
  );
};

export default Message;