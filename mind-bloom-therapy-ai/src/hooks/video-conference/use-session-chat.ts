
import { useState, useCallback } from 'react';

export interface ChatMessage {
  id: string;
  senderId: string;
  message: string;
  timestamp: Date;
}

export interface UseSessionChatReturn {
  messages: ChatMessage[];
  sendMessage: (message: string) => void;
  isTyping: boolean;
  setIsTyping: (typing: boolean) => void;
  unreadCount: number;
  markAsRead: () => void;
}

export function useSessionChat(sessionId: string): UseSessionChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const sendMessage = useCallback((message: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'current-user',
      message,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);

  const markAsRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  return {
    messages,
    sendMessage,
    isTyping,
    setIsTyping,
    unreadCount,
    markAsRead,
  };
}
