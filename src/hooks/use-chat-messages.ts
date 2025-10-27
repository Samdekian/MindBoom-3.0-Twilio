
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ChatMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  message: string;
  timestamp: string;
  appointment_id: string;
  is_system?: boolean;
  file_url?: string | null;
  file_name?: string | null;
}

export const useChatMessages = (appointmentId: string, userId: string, userName: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const { toast } = useToast();

  // Mock implementation for demo purposes since we don't have the actual database table
  // In real implementation, this would interact with the actual Supabase table
  useEffect(() => {
    if (!appointmentId) return;

    setIsLoading(true);
    // Mock data to simulate database fetch
    const mockMessages: ChatMessage[] = [
      {
        id: "1",
        sender_id: "system",
        sender_name: "System",
        message: "Welcome to the session chat!",
        timestamp: new Date().toISOString(),
        appointment_id: appointmentId,
        is_system: true
      }
    ];
    
    setMessages(mockMessages);
    setIsLoading(false);

    // In a real implementation, we would set up a Supabase subscription:
    const channel = supabase
      .channel(`chat-${appointmentId}`)
      .on("broadcast", { event: "new_message" }, (payload) => {
        setMessages((prev) => [...prev, payload.payload as ChatMessage]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [appointmentId]);

  // Send a new message
  const sendMessage = useCallback(
    async (text: string, fileUrl?: string, fileName?: string) => {
      if (!appointmentId || (!text.trim() && !fileUrl)) return;

      try {
        const newMsg: ChatMessage = {
          id: Math.random().toString(),
          appointment_id: appointmentId,
          sender_id: userId,
          sender_name: userName,
          message: text.trim(),
          timestamp: new Date().toISOString(),
          file_url: fileUrl || null,
          file_name: fileName || null,
        };

        // In a real app, we would insert to Supabase:
        // await supabase.from("video_chat_messages").insert(newMsg);
        
        // For demo, we'll just update the local state:
        setMessages(prev => [...prev, newMsg]);
        
        // Clear message input after sending
        setNewMessage("");
      } catch (error) {
        console.error("Error sending message:", error);
        toast({
          title: "Error",
          description: "Failed to send message",
          variant: "destructive",
        });
      }
    },
    [appointmentId, userId, userName, toast]
  );

  // Send a system message (e.g., "User joined the session")
  const sendSystemMessage = useCallback(
    async (text: string) => {
      try {
        const systemMsg: ChatMessage = {
          id: Math.random().toString(),
          appointment_id: appointmentId,
          sender_id: "system",
          sender_name: "System",
          message: text,
          timestamp: new Date().toISOString(),
          is_system: true,
        };

        // In a real app, we would insert to Supabase
        // await supabase.from("video_chat_messages").insert(systemMsg);
        
        // For demo, we'll just update the local state:
        setMessages(prev => [...prev, systemMsg]);
      } catch (error) {
        console.error("Error sending system message:", error);
      }
    },
    [appointmentId]
  );

  // Upload a file
  const uploadFile = useCallback(
    async (file: File): Promise<string | null> => {
      try {
        const fileExt = file.name.split(".").pop();
        const fileName = `${appointmentId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        // In a real app, we would upload to Supabase Storage
        // const { error: uploadError, data } = await supabase.storage
        //   .from("video-chat-files")
        //   .upload(fileName, file);

        // For demo purposes, we'll create a fake URL
        const fakeUrl = `https://example.com/files/${fileName}`;
        
        return fakeUrl;
      } catch (error) {
        console.error("Error uploading file:", error);
        toast({
          title: "Upload Failed",
          description: "Could not upload file",
          variant: "destructive",
        });
        return null;
      }
    },
    [appointmentId, toast]
  );

  return {
    messages,
    isLoading,
    newMessage,
    setNewMessage,
    sendMessage,
    sendSystemMessage,
    uploadFile,
  };
};
