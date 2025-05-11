'use client';

import React from 'react';
import { Message as MessageType } from '@/lib/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
// import 'highlight.js/styles/github-dark.css';

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
      // Find the ending position (looking for the next ``` after the start)
      const endPos = content.indexOf('```', startPos + 11); // 11 is the length of '```markdown'
      
      if (endPos > startPos) {
        // Extract the content between the backticks
        const beforeBlock = content.substring(0, startPos);
        const markdownContent = content.substring(startPos + 11, endPos);
        const afterBlock = content.substring(endPos + 3); // 3 is the length of '```'
        
        // Return the combined content without the markdown code block markers
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
  
  return (
    <div className={`max-w-[90%] rounded-[8.5px] bg-gradient-to-br
      ${
          message.role === 'user' ? 'self-end from-[var(--accentrd)] to-[var(--accentyl)]' : 
          message.content === 'Thinking...' ? '' : 'self-start from-[var(--accentrd)] to-[var(--accentbl)]'
      }`}>
      <div 
        className={`max-w-[100%] m-px ${
          message.role === 'user' ? 'user-message' : 
          message.content === 'Thinking...' ? 'thinking' : 'assistant-message'
        }`}
      >
        {message.content === 'Thinking...' ? (
          message.content
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight]}
          >
            {processContent(message.content)}
          </ReactMarkdown>
          // processContent(message.content)
          // message.content
        )}
      </div>
    </div>
  );
};

export default Message;