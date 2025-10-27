import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mic, MicOff, MessageSquare, Bot, User, Send } from 'lucide-react';
import { useOpenAIRealtime } from '@/hooks/useOpenAIRealtime';
import { cn } from '@/lib/utils';

interface AISessionInterfaceProps {
  className?: string;
}

export function AISessionInterface({ className }: AISessionInterfaceProps) {
  const [textMessage, setTextMessage] = useState('');
  const { conversationState, connect, disconnect, sendTextMessage, isConnected, isConnecting, isAIResponding } = useOpenAIRealtime();

  const handleSendMessage = () => {
    if (textMessage.trim() && isConnected) {
      sendTextMessage(textMessage.trim());
      setTextMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className={cn("w-full max-w-2xl", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            AI Assistant
            {isConnected && (
              <Badge variant="secondary" className="ml-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                Connected
              </Badge>
            )}
            {isAIResponding && (
              <Badge variant="outline" className="ml-2">
                <Mic className="h-3 w-3 mr-1" />
                Speaking
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {!isConnected ? (
              <Button 
                onClick={connect} 
                disabled={isConnecting}
                size="sm"
                className="bg-primary hover:bg-primary/90"
              >
                {isConnecting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-2" />
                    Start AI Session
                  </>
                )}
              </Button>
            ) : (
              <Button 
                onClick={disconnect} 
                variant="destructive"
                size="sm"
              >
                <MicOff className="h-4 w-4 mr-2" />
                End Session
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Messages Area */}
        <ScrollArea className="h-80 w-full border rounded-md p-4">
          <div className="space-y-4">
            {conversationState.messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Start a conversation with the AI assistant</p>
                <p className="text-sm mt-2">You can speak directly or type a message</p>
              </div>
            ) : (
              conversationState.messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3 p-3 rounded-lg",
                    message.role === 'user' 
                      ? "bg-primary/10 ml-8" 
                      : "bg-muted mr-8"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    message.role === 'user' 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted-foreground text-muted"
                  )}>
                    {message.role === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">
                      {message.role === 'user' ? 'You' : 'AI Assistant'}
                    </p>
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
            
            {/* Current AI transcript */}
            {conversationState.currentTranscript && (
              <div className="flex gap-3 p-3 rounded-lg bg-muted mr-8 opacity-75">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-muted-foreground text-muted">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">AI Assistant</p>
                  <p className="text-sm">{conversationState.currentTranscript}</p>
                  <div className="flex items-center mt-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse mr-2" />
                    <p className="text-xs text-muted-foreground">Speaking...</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Text Input */}
        <div className="flex gap-2">
          <Input
            value={textMessage}
            onChange={(e) => setTextMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isConnected ? "Type a message or speak directly..." : "Connect to AI first"}
            disabled={!isConnected}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!isConnected || !textMessage.trim()}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Status Information */}
        {isConnected && (
          <div className="text-xs text-muted-foreground text-center p-2 bg-muted/50 rounded">
            <MessageSquare className="h-3 w-3 inline mr-1" />
            AI is listening. Speak naturally or type your message.
            {isAIResponding && " AI is currently responding..."}
          </div>
        )}
      </CardContent>
    </Card>
  );
}