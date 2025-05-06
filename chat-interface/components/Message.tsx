'use client';

import React from 'react';
import { Message as MessageType } from '@/lib/types';

interface MessageProps {
  message: MessageType;
}

const Message: React.FC<MessageProps> = ({ message }) => {
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
        <div dangerouslySetInnerHTML={formatMessageContent(message.content)} />
      )}
    </div>
  );
};

export default Message;