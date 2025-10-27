
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useMessaging } from "@/hooks/use-messaging";
import { MessageSquare, Send, Plus } from "lucide-react";
import { format } from "date-fns";

const MessageCenter = () => {
  const { messages, isLoading, sendMessage, markAsRead } = useMessaging();
  const [isComposing, setIsComposing] = useState(false);
  const [newMessage, setNewMessage] = useState({
    recipient_id: '',
    subject: '',
    content: '',
    message_type: 'direct' as const,
    priority: 'normal' as const,
  });

  const handleSendMessage = async () => {
    if (!newMessage.content.trim() || !newMessage.recipient_id) return;
    
    await sendMessage.mutateAsync(newMessage);
    setNewMessage({
      recipient_id: '',
      subject: '',
      content: '',
      message_type: 'direct',
      priority: 'normal',
    });
    setIsComposing(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'secondary';
      case 'normal': return 'outline';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Messages</h2>
        </div>
        <Button onClick={() => setIsComposing(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Message
        </Button>
      </div>

      {isComposing && (
        <Card>
          <CardHeader>
            <CardTitle>Compose Message</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Recipient ID"
              value={newMessage.recipient_id}
              onChange={(e) => setNewMessage(prev => ({ ...prev, recipient_id: e.target.value }))}
            />
            <Input
              placeholder="Subject (optional)"
              value={newMessage.subject}
              onChange={(e) => setNewMessage(prev => ({ ...prev, subject: e.target.value }))}
            />
            <Textarea
              placeholder="Type your message..."
              value={newMessage.content}
              onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
              rows={4}
            />
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setIsComposing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendMessage} disabled={sendMessage.isPending}>
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {messages?.map((message) => (
          <Card key={message.id} className={!message.is_read ? "border-primary" : ""}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {message.subject || "No Subject"}
                  </CardTitle>
                  <CardDescription>
                    {format(new Date(message.created_at), "MMM dd, yyyy 'at' h:mm a")}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant={getPriorityColor(message.priority)}>
                    {message.priority}
                  </Badge>
                  <Badge variant="outline">
                    {message.message_type}
                  </Badge>
                  {!message.is_read && (
                    <Badge>Unread</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{message.content}</p>
              {!message.is_read && (
                <div className="mt-4">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => markAsRead.mutate(message.id)}
                  >
                    Mark as Read
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        
        {messages?.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Messages</h3>
              <p className="text-muted-foreground text-center">
                You haven't received any messages yet.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MessageCenter;
