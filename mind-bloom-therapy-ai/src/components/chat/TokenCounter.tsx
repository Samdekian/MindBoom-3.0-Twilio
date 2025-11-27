import React from 'react';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

interface TokenCounterProps {
  remainingTokens: number;
  isAuthenticated: boolean;
  className?: string;
}

export function TokenCounter({ remainingTokens, isAuthenticated, className }: TokenCounterProps) {
  if (isAuthenticated) {
    return (
      <div className={cn('flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-sm font-medium', className)}>
        <Sparkles className="w-4 h-4" />
        <span>Unlimited</span>
      </div>
    );
  }

  const getColorClasses = () => {
    if (remainingTokens > 30) {
      return 'bg-green-100 text-green-700';
    } else if (remainingTokens > 10) {
      return 'bg-yellow-100 text-yellow-700';
    } else {
      return 'bg-red-100 text-red-700 animate-pulse';
    }
  };

  return (
    <div className={cn(
      'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
      getColorClasses(),
      className
    )}>
      <Sparkles className="w-4 h-4" />
      <span>{remainingTokens} {remainingTokens === 1 ? 'message' : 'messages'} left</span>
    </div>
  );
}

