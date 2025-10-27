
import React from 'react';
import { formatTimeFromDate } from '@/utils/time-formatter';

interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
}

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ 
  messages = [],
  onSendMessage,
  isLoading = false
}) => {
  const [message, setMessage] = React.useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  
  // Scroll to bottom whenever messages change
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-muted/20 rounded-md overflow-hidden">
      <div className="p-3 bg-muted/30 border-b">
        <h3 className="font-medium">Session Chat</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-sm">No messages yet</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="group flex flex-col">
              <div className="flex items-baseline">
                <span className="font-medium text-sm">{msg.sender}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  {formatTimeFromDate(msg.timestamp)}
                </span>
              </div>
              <div className="mt-1 text-sm bg-muted/20 rounded-md p-2">
                {msg.content}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="p-3 border-t flex">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-background rounded-l-md px-3 py-2 border border-r-0 focus:outline-none focus:ring-1 focus:ring-primary"
          disabled={isLoading}
        />
        <button 
          type="submit"
          disabled={!message.trim() || isLoading}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-r-md disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatPanel;
