
import React from 'react';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProductionLayout } from "@/components/production/ProductionWrapper";
import AppRouter from '@/components/routing/AppRouter';
const queryClient = new QueryClient();

function App() {

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <ProductionLayout showHealthIndicator={process.env.NODE_ENV === 'development'}>
          <AppRouter />
        </ProductionLayout>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
