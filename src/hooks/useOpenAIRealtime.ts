import { useState, useEffect, useCallback, useRef } from 'react';
import { OpenAIRealtimeClient, RealtimeAudioEvent } from '@/lib/ai/realtime-client';
import { useToast } from '@/hooks/use-toast';

export interface AIConversationState {
  isConnected: boolean;
  isConnecting: boolean;
  isAIResponding: boolean;
  currentTranscript: string;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    isComplete: boolean;
  }>;
}

export function useOpenAIRealtime() {
  const { toast } = useToast();
  const clientRef = useRef<OpenAIRealtimeClient | null>(null);
  const [conversationState, setConversationState] = useState<AIConversationState>({
    isConnected: false,
    isConnecting: false,
    isAIResponding: false,
    currentTranscript: '',
    messages: []
  });

  const handleMessage = useCallback((event: RealtimeAudioEvent) => {
    console.log('AI Event:', event.type);
  }, []);

  const handleTranscript = useCallback((text: string, isFinal: boolean) => {
    setConversationState(prev => {
      if (isFinal) {
        // Add completed message
        const newMessage = {
          id: `msg-${Date.now()}`,
          role: 'assistant' as const,
          content: text,
          timestamp: new Date(),
          isComplete: true
        };
        
        return {
          ...prev,
          currentTranscript: '',
          messages: [...prev.messages, newMessage]
        };
      } else {
        // Update current transcript
        return {
          ...prev,
          currentTranscript: prev.currentTranscript + text
        };
      }
    });
  }, []);

  const handleAudioResponse = useCallback((isPlaying: boolean) => {
    setConversationState(prev => ({
      ...prev,
      isAIResponding: isPlaying
    }));
  }, []);

  const connect = useCallback(async () => {
    if (clientRef.current || conversationState.isConnecting) {
      return;
    }

    setConversationState(prev => ({ ...prev, isConnecting: true }));

    try {
      clientRef.current = new OpenAIRealtimeClient(
        handleMessage,
        handleTranscript,
        handleAudioResponse
      );

      await clientRef.current.connect();

      setConversationState(prev => ({
        ...prev,
        isConnected: true,
        isConnecting: false
      }));

      toast({
        title: "AI Assistant Connected",
        description: "You can now speak with the AI assistant",
      });

    } catch (error) {
      console.error('Failed to connect to AI:', error);
      
      setConversationState(prev => ({
        ...prev,
        isConnecting: false,
        isConnected: false
      }));

      toast({
        title: "Connection Failed",
        description: "Failed to connect to AI assistant",
        variant: "destructive",
      });
    }
  }, [conversationState.isConnecting, handleMessage, handleTranscript, handleAudioResponse, toast]);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.disconnect();
      clientRef.current = null;
    }

    setConversationState({
      isConnected: false,
      isConnecting: false,
      isAIResponding: false,
      currentTranscript: '',
      messages: []
    });

    toast({
      title: "AI Assistant Disconnected",
      description: "AI conversation has ended",
    });
  }, [toast]);

  const sendTextMessage = useCallback((text: string) => {
    if (clientRef.current && conversationState.isConnected) {
      // Add user message to state
      const userMessage = {
        id: `msg-${Date.now()}`,
        role: 'user' as const,
        content: text,
        timestamp: new Date(),
        isComplete: true
      };

      setConversationState(prev => ({
        ...prev,
        messages: [...prev.messages, userMessage]
      }));

      clientRef.current.sendTextMessage(text);
    }
  }, [conversationState.isConnected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect();
      }
    };
  }, []);

  return {
    conversationState,
    connect,
    disconnect,
    sendTextMessage,
    isConnected: conversationState.isConnected,
    isConnecting: conversationState.isConnecting,
    isAIResponding: conversationState.isAIResponding
  };
}