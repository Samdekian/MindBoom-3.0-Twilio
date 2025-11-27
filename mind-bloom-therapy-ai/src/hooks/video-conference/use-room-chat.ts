
import { useState, useCallback } from 'react';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  fileUrl?: string;
  fileName?: string;
}

export const useRoomChat = (roomId: string, userId: string, userName: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [newMessage, setNewMessage] = useState('');

  // Send a message
  const sendMessage = useCallback(async (content: string, fileUrl?: string, fileName?: string): Promise<void> => {
    if (!content.trim() && !fileUrl) return;

    try {
      setIsLoading(true);
      
      // Generate a unique ID for the message
      const messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      // Create a new message object
      const message: ChatMessage = {
        id: messageId,
        senderId: userId,
        senderName: userName,
        content: content.trim(),
        timestamp: new Date(),
        isRead: false,
        fileUrl,
        fileName
      };
      
      // In a real implementation, we would send the message to a backend service
      // For now, we'll just add it to the local state
      setMessages(prevMessages => [...prevMessages, message]);
      
      // Clear the input
      setNewMessage('');
      
      // Simulate a reply after 1-3 seconds
      if (Math.random() > 0.3) {
        setTimeout(() => {
          const replyMessage: ChatMessage = {
            id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            senderId: 'system',
            senderName: 'System',
            content: 'This is an automated reply to your message.',
            timestamp: new Date(),
            isRead: false
          };
          
          setMessages(prevMessages => [...prevMessages, replyMessage]);
        }, Math.random() * 2000 + 1000);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to send message'));
    } finally {
      setIsLoading(false);
    }
  }, [userId, userName]);

  // Upload a file (mock implementation)
  const uploadFile = useCallback(async (file: File): Promise<string | null> => {
    try {
      setIsLoading(true);
      
      // Simulate file upload delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock file URL
      const fileUrl = `https://example.com/files/${file.name}`;
      
      return fileUrl;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to upload file'));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Mark messages as read
  const markAsRead = useCallback((messageIds: string[]) => {
    setMessages(prevMessages =>
      prevMessages.map(message =>
        messageIds.includes(message.id) ? { ...message, isRead: true } : message
      )
    );
  }, []);

  return {
    messages,
    isLoading,
    error,
    newMessage,
    setNewMessage,
    sendMessage,
    uploadFile,
    markAsRead
  };
};
