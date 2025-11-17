import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Sparkles, MessageSquare, Clock, Shield } from 'lucide-react';

interface TokenExhaustedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TokenExhaustedModal({ open, onOpenChange }: TokenExhaustedModalProps) {
  const navigate = useNavigate();

  const handleCreateAccount = () => {
    navigate('/register');
  };

  const handleSignIn = () => {
    navigate('/login');
  };

  const benefits = [
    {
      icon: MessageSquare,
      title: 'Unlimited Messages',
      description: 'Chat as much as you want without any limits'
    },
    {
      icon: Clock,
      title: 'Chat History',
      description: 'Access your previous conversations anytime'
    },
    {
      icon: Shield,
      title: 'Personalized Experience',
      description: 'Get tailored responses based on your needs'
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-therapy-purple/10 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-therapy-purple" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl font-bold">
            Unlock Unlimited Conversations
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            You've used all your free messages. Create an account to continue chatting with MindBloom AI.
          </DialogDescription>
        </DialogHeader>

        {/* Benefits */}
        <div className="space-y-4 my-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div key={index} className="flex gap-3 items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-therapy-purple/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-therapy-purple" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">{benefit.title}</h4>
                  <p className="text-sm text-gray-600">{benefit.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTAs */}
        <div className="space-y-3">
          <Button
            onClick={handleCreateAccount}
            className="w-full h-12 text-base bg-therapy-purple hover:bg-therapy-deep-purple"
            size="lg"
          >
            Create Free Account
          </Button>
          <Button
            onClick={handleSignIn}
            variant="outline"
            className="w-full h-12 text-base border-2 border-therapy-purple text-therapy-purple hover:bg-therapy-purple/5"
            size="lg"
          >
            Sign In
          </Button>
        </div>

        {/* Footer note */}
        <p className="text-xs text-center text-gray-500 mt-4">
          Free forever. No credit card required.
        </p>
      </DialogContent>
    </Dialog>
  );
}

