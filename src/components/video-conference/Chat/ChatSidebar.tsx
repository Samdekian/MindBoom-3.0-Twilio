
import React, { useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import ChatPanel from './ChatPanel'; // Import the now-created ChatPanel

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  userId: string;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ 
  isOpen, 
  onClose, 
  sessionId, 
  userId 
}) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  
  // Function to send a message
  const handleSendMessage = async (text: string, fileUrl?: string, fileName?: string) => {
    if (!text.trim() && !fileUrl) return;
    
    setIsLoading(true);
    
    try {
      // Create a new message object
      const newMsg = {
        id: `msg-${Date.now()}`,
        senderId: userId,
        message: text,
        timestamp: new Date(),
        fileUrl,
        fileName
      };
      
      // Add to messages
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
      
      // In a real app, you would send this message to a backend or WebRTC data channel
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API call
      
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const uploadFile = async (file: File): Promise<string> => {
    // Simulate file upload
    await new Promise(resolve => setTimeout(resolve, 1000));
    return URL.createObjectURL(file);
  };
  
  return (
    <div className={`fixed inset-y-0 right-0 w-80 bg-background border-l shadow-lg transform transition-transform duration-300 ease-in-out ${
      isOpen ? 'translate-x-0' : 'translate-x-full'
    }`}>
      <ChatPanel
        messages={messages}
        isLoading={isLoading}
        onSendMessage={handleSendMessage}
        onClose={onClose}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        currentUserId={userId}
      />
    </div>
  );
};

export default ChatSidebar;
