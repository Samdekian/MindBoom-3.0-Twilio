import React, { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from '@/hooks/useChat';
import { Sparkles } from 'lucide-react';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  error?: string | null;
}

const SUGGESTED_PROMPTS = [
  "What is MindBloom?",
  "How can you help me?",
  "Tell me about mental health",
  "What services do you offer?"
];

export function ChatInterface({ 
  messages, 
  onSendMessage, 
  isLoading, 
  disabled = false,
  error 
}: ChatInterfaceProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handlePromptClick = (prompt: string) => {
    if (!disabled && !isLoading) {
      onSendMessage(prompt);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4 md:px-6 py-6">
        {messages.length === 0 ? (
          // Empty state with welcome message
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 rounded-full bg-therapy-purple/10 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-therapy-purple" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Welcome to MindBloom AI
            </h2>
            <p className="text-gray-600 mb-8 max-w-md">
              Your friendly AI assistant for mental health support and information. 
              Start a conversation or try one of these prompts:
            </p>
            
            {/* Suggested prompts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
              {SUGGESTED_PROMPTS.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handlePromptClick(prompt)}
                  disabled={disabled || isLoading}
                  className="p-4 text-left bg-white border border-gray-200 rounded-xl hover:border-therapy-purple hover:bg-therapy-purple/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed group hover-lift"
                >
                  <p className="text-sm md:text-base text-gray-700 group-hover:text-therapy-purple transition-colors">
                    {prompt}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          // Messages list
          <div className="max-w-4xl mx-auto">
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                role={message.role}
                content={message.content}
                isStreaming={isLoading && index === messages.length - 1 && message.role === 'assistant'}
              />
            ))}
            
            {/* Typing indicator */}
            {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
              <TypingIndicator />
            )}
            
            {/* Error message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <ChatInput
            onSend={onSendMessage}
            disabled={disabled}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

