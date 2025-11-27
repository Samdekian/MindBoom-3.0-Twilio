
import { useState } from "react";
import { useChatMessages, ChatMessage } from "./use-chat-messages";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";

export function useVideoChat(appointmentId: string) {
  const [chatOpen, setChatOpen] = useState(false);
  const { user } = useAuthRBAC();
  
  // Use the existing chat messages hook
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
    user?.user_metadata?.fullName || user?.user_metadata?.email || 'User'
  );

  // Toggle chat panel visibility
  const toggleChat = () => {
    setChatOpen(prev => !prev);
  };

  return {
    chatOpen,
    toggleChat,
    messages,
    chatLoading,
    newMessage,
    setNewMessage,
    sendMessage,
    uploadFile
  };
}
