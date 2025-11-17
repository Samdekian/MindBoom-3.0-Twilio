import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  placeholder?: string;
}

export function ChatInput({ 
  onSend, 
  disabled = false, 
  isLoading = false,
  placeholder = 'Type your message...'
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled && !isLoading) {
      onSend(message);
      setMessage('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative flex items-end gap-2 p-4 bg-white border border-gray-200 rounded-2xl shadow-lg input-glow transition-all">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? 'Sign up to continue chatting...' : placeholder}
          disabled={disabled || isLoading}
          rows={1}
          className={cn(
            'flex-1 resize-none bg-transparent border-0 outline-none text-sm md:text-base',
            'placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50',
            'max-h-[200px] overflow-y-auto'
          )}
          style={{ minHeight: '24px' }}
        />
        
        <Button
          type="submit"
          size="icon"
          disabled={!message.trim() || disabled || isLoading}
          className={cn(
            'flex-shrink-0 h-10 w-10 rounded-xl transition-all',
            message.trim() && !disabled && !isLoading
              ? 'bg-therapy-purple hover:bg-therapy-deep-purple'
              : 'bg-gray-200 cursor-not-allowed'
          )}
        >
          <Send className={cn(
            'w-5 h-5',
            message.trim() && !disabled && !isLoading ? 'text-white' : 'text-gray-400'
          )} />
        </Button>
      </div>
      
      {message.length > 0 && (
        <div className="absolute -top-6 right-0 text-xs text-gray-400">
          {message.length} / 2000
        </div>
      )}
    </form>
  );
}

