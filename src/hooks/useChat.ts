import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { tokenManager } from '@/utils/token-manager';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<boolean>;
  clearMessages: () => void;
  remainingTokens: number;
  updateRemainingTokens: () => Promise<void>;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingTokens, setRemainingTokens] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Update remaining tokens
  const updateRemainingTokens = useCallback(async () => {
    const tokens = await tokenManager.getRemainingTokens();
    setRemainingTokens(tokens);
  }, []);

  // Initialize tokens on mount
  useState(() => {
    updateRemainingTokens();
  });

  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!content.trim()) {
      return false;
    }

    // Check if user has tokens
    const hasTokens = await tokenManager.hasTokens();
    if (!hasTokens) {
      setError('No tokens remaining. Please sign up to continue.');
      return false;
    }

    setError(null);
    setIsLoading(true);

    // Create user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    };

    // Optimistically add user message
    setMessages(prev => [...prev, userMessage]);

    // Create assistant message placeholder
    const assistantMessageId = `assistant-${Date.now()}`;
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      // Prepare messages for API
      const apiMessages = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Get Supabase project URL
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 
                          (window.location.hostname.includes('localhost') 
                            ? 'https://yrlzcvvhyaymllpgtcgm.supabase.co'
                            : `https://${window.location.hostname.split('.')[0]}.supabase.co`);

      const functionUrl = `${supabaseUrl}/functions/v1/chat-completion`;

      // Create abort controller for this request
      abortControllerRef.current = new AbortController();

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          messages: apiMessages,
          userId: user?.id,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let accumulatedContent = '';
      let tokenCount = 1; // At least 1 token for the message

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            try {
              const parsed = JSON.parse(data);
              
              if (parsed.type === 'content') {
                accumulatedContent += parsed.content;
                
                // Update assistant message with accumulated content
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === assistantMessageId 
                      ? { ...msg, content: accumulatedContent }
                      : msg
                  )
                );
              } else if (parsed.type === 'done') {
                tokenCount = parsed.tokens || tokenCount;
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }

      // Consume tokens (1 token per message for simplicity)
      await tokenManager.consumeTokens(1);
      await updateRemainingTokens();

      setIsLoading(false);
      return true;

    } catch (err: any) {
      console.error('Error sending message:', err);
      
      if (err.name === 'AbortError') {
        setError('Request cancelled');
      } else {
        setError(err.message || 'Failed to send message. Please try again.');
      }

      // Remove the empty assistant message on error
      setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId));
      
      setIsLoading(false);
      return false;
    }
  }, [messages, updateRemainingTokens]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    remainingTokens,
    updateRemainingTokens,
  };
}

