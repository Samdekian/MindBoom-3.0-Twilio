import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthRBACProvider } from '@/contexts/AuthRBACContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { SecurityProvider } from '@/contexts/SecurityContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * Integration Test Provider Component
 * 
 * Provides all necessary context providers for integration testing
 * to simulate the full application environment.
 */
interface IntegrationTestProviderProps {
  children: React.ReactNode;
  initialRoute?: string;
  mockQueryClient?: QueryClient;
}

export const IntegrationTestProvider: React.FC<IntegrationTestProviderProps> = ({
  children,
  initialRoute = '/',
  mockQueryClient
}) => {
  // Create a test QueryClient with optimized test settings
  const testQueryClient = mockQueryClient || new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0, // Formerly cacheTime
        staleTime: 0,
      },
    },
  });

  // Set initial route if provided and in browser environment
  if (typeof window !== 'undefined' && initialRoute) {
    window.history.pushState({}, '', initialRoute);
  }

  return (
    <BrowserRouter>
      <QueryClientProvider client={testQueryClient}>
        <ThemeProvider>
          <AuthRBACProvider>
            <LanguageProvider>
              <SecurityProvider>
                {children}
              </SecurityProvider>
            </LanguageProvider>
          </AuthRBACProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default IntegrationTestProvider;
