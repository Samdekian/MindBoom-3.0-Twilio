
import { useState, useEffect } from "react";
import { useChatMessages } from "@/hooks/use-chat-messages";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";

export function useSessionChat(appointmentId: string, isInSession: boolean, waitingRoomActive: boolean) {
  const [chatOpen, setChatOpen] = useState(false);
  const { user } = useAuthRBAC();

  // Initialize chat
  const { 
    messages, 
    isLoading: chatLoading, 
    newMessage, 
    setNewMessage, 
    sendMessage, 
    sendSystemMessage,
    uploadFile
  } = useChatMessages(
    appointmentId,
    user?.id || '',
    user?.user_metadata?.name || user?.email || 'User'
  );

  // Send system message when joining/leaving
  useEffect(() => {
    if (isInSession && !waitingRoomActive) {
      const userName = user?.user_metadata?.name || user?.email || 'User';
      sendSystemMessage(`${userName} joined the session`);
    }
    
    return () => {
      if (isInSession && !waitingRoomActive) {
        const userName = user?.user_metadata?.name || user?.email || 'User';
        sendSystemMessage(`${userName} left the session`);
      }
    };
  }, [isInSession, waitingRoomActive, user, sendSystemMessage]);

  const toggleChat = () => setChatOpen(prev => !prev);

  return {
    chatOpen,
    setChatOpen,
    toggleChat,
    messages,
    chatLoading,
    newMessage,
    setNewMessage,
    sendMessage,
    sendSystemMessage,
    uploadFile,
    userId: user?.id || ''
  };
}
