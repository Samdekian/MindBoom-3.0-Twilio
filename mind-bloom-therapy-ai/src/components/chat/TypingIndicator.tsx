import React from 'react';
import { Bot } from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className="flex gap-3 mb-4 message-bubble">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-therapy-purple/10 flex items-center justify-center">
        <Bot className="w-5 h-5 text-therapy-purple" />
      </div>
      
      <div className="max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-3 bg-gray-100 rounded-bl-sm shadow-sm">
        <div className="typing-indicator">
          <span className="bg-gray-500"></span>
          <span className="bg-gray-500"></span>
          <span className="bg-gray-500"></span>
        </div>
      </div>
    </div>
  );
}

