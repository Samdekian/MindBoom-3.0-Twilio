import React, { useEffect, useState } from 'react';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { TokenCounter } from '@/components/chat/TokenCounter';
import { TokenExhaustedModal } from '@/components/chat/TokenExhaustedModal';
import { useChat } from '@/hooks/useChat';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { LogIn, Sparkles } from 'lucide-react';

const ChatPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthRBAC();
  const { 
    messages, 
    isLoading, 
    error, 
    sendMessage, 
    remainingTokens, 
    updateRemainingTokens 
  } = useChat();
  
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    updateRemainingTokens();
    setIsAuthenticated(!!user);
  }, [user, updateRemainingTokens]);

  const handleSendMessage = async (content: string) => {
    const success = await sendMessage(content);
    
    if (!success && remainingTokens === 0 && !isAuthenticated) {
      setShowTokenModal(true);
    }
  };

  const handleAuthClick = () => {
    navigate('/login');
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-therapy-light-purple/20 via-white to-therapy-purple/10 animated-gradient">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-therapy-purple flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              MindBloom AI
            </h1>
          </div>

          {/* Right side - Token counter and Auth button */}
          <div className="flex items-center gap-3">
            <TokenCounter 
              remainingTokens={remainingTokens} 
              isAuthenticated={isAuthenticated}
            />
            
            {!isAuthenticated && (
              <Button
                onClick={handleAuthClick}
                variant="outline"
                size="sm"
                className="border-therapy-purple text-therapy-purple hover:bg-therapy-purple hover:text-white transition-colors"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Chat Interface */}
      <main className="flex-1 overflow-hidden">
        <ChatInterface
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          disabled={remainingTokens === 0 && !isAuthenticated}
          error={error}
        />
      </main>

      {/* Token Exhausted Modal */}
      <TokenExhaustedModal
        open={showTokenModal}
        onOpenChange={setShowTokenModal}
      />
    </div>
  );
};

export default ChatPage;

