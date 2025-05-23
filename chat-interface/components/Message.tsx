'use client';

import React from 'react';
import { Message as MessageType } from '@/lib/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';

interface MessageProps {
  message: MessageType;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  // Remove code block fences if present
  const processContent = (content: string) => {
    // Check if content starts with ```markdown and ends with ```
    if (content.includes('```markdown') && content.includes('```')) {
      // Extract the content between the backticks
      console.log('trim markdown');
      // return content.replace(/^```markdown/, '').replace(/```$/, '').trim();
      // Find the starting position of the markdown block
      const startPos = content.indexOf('```markdown');
      const endPos = content.indexOf('```', startPos + 11);
      
      if (endPos > startPos) {
        // Extract the content between the backticks
        const beforeBlock = content.substring(0, startPos);
        const markdownContent = content.substring(startPos + 11, endPos);
        const afterBlock = content.substring(endPos + 3);
        return beforeBlock + markdownContent + afterBlock;
      }
    }
    // For any code block
    if (content.trim().startsWith('```') && content.trim().endsWith('```')) {
      // Extract the content between the backticks, preserving internal code blocks
      const lines = content.split('\n');
      if (lines.length > 2) {
        // Remove first and last line (the fences)
        return lines.slice(1, -1).join('\n');
      }
    }
    return content;
  };

  if (message.content === 'Thinking...') {
    return (
      <div className="max-w-[90%] self-start">
        <div className="thinking">
          {message.content}
        </div>
      </div>
    );
  }
  
  return (
    <div className={`max-w-[90%] ${
      message.role === 'user' ? 'self-end' : 'self-start'
    }`}>
      {/* Container with fixed gradient background - only visible in padding */}
      <div 
        className="rounded-[8.5px] p-[1px] gradient-window-border"
      >
        {/* Inner content covers the gradient except in the padding border */}
        <div 
          className="rounded-[7.5px] px-3 py-2"
          style={{
            backgroundColor: message.role === 'user' ? 'var(--textboxbl)' : 'var(--textboxrd)',
            color: 'var(--foreground)'
          }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight]}
          >
            {processContent(message.content)}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default Message;