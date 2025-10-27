
import React from 'react';
import { cn } from '@/lib/utils';

interface BaseLayoutProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'dashboard' | 'auth' | 'fullscreen';
}

export const BaseLayout: React.FC<BaseLayoutProps> = ({ 
  children, 
  className,
  variant = 'default' 
}) => {
  const layoutClasses = {
    default: 'app-layout',
    dashboard: 'dashboard-layout',
    auth: 'app-layout flex items-center justify-center',
    fullscreen: 'min-h-screen w-full'
  };

  return (
    <div className={cn(layoutClasses[variant], className)}>
      {children}
    </div>
  );
};

export default BaseLayout;
