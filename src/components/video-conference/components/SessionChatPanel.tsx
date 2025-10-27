import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, 
  X, 
  MessageSquare,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: Date;
  isSystem?: boolean;
}

interface SessionChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  currentUserId: string;
  currentUserName: string;
  isTherapist: boolean;
}

const SessionChatPanel: React.FC<SessionChatPanelProps> = ({
  isOpen,
  onClose,
  sessionId,
  currentUserId,
  currentUserName,
  isTherapist
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      content: "Session chat is now available. Messages are encrypted and not recorded.",
      senderId: "system",
      senderName: "System",
      timestamp: new Date(),
      isSystem: true
    }
  ]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      content: newMessage,
      senderId: currentUserId,
      senderName: currentUserName,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, message]);
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <Card className="fixed top-4 right-4 w-80 h-96 z-50 shadow-2xl border-2">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <MessageSquare className="h-4 w-4" />
            Session Chat
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex flex-col h-80">
        <ScrollArea className="flex-1 p-3">
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex flex-col space-y-1",
                  message.isSystem && "items-center",
                  !message.isSystem && message.senderId === currentUserId && "items-end",
                  !message.isSystem && message.senderId !== currentUserId && "items-start"
                )}
              >
                {message.isSystem ? (
                  <div className="text-xs text-muted-foreground text-center bg-muted px-2 py-1 rounded-full max-w-xs">
                    {message.content}
                  </div>
                ) : (
                  <div className={cn(
                    "max-w-xs px-3 py-2 rounded-lg text-sm",
                    message.senderId === currentUserId 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted"
                  )}>
                    <div className="font-medium text-xs mb-1">
                      {message.senderId === currentUserId ? "You" : message.senderName}
                    </div>
                    <div>{message.content}</div>
                    <div className="flex items-center gap-1 mt-1 opacity-70">
                      <Clock className="h-3 w-3" />
                      <span className="text-xs">{formatTime(message.timestamp)}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>
        
        <div className="border-t p-3">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 text-sm"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Press Enter to send
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionChatPanel;