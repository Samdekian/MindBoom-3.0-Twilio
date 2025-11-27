
import React from 'react';
import { ToastProvider } from '@/components/ui/use-toast';
import { Toaster } from './toaster';

export function ToastContainer({ children }: { children: React.ReactNode }) {
  return React.createElement(
    ToastProvider,
    null,
    [
      children,
      React.createElement(Toaster, { key: "toaster" })
    ]
  );
}
