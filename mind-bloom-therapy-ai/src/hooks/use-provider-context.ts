
import { useContext } from 'react';

/**
 * Custom hook that safely checks if a context provider is available
 * and throws a helpful error message if it's not.
 * 
 * @param context The React context object to check
 * @param providerName The name of the provider for error messages
 * @returns The context value if available
 */
export function useProviderContext<T>(
  context: React.Context<T | null>, 
  providerName: string
): T {
  const contextValue = useContext(context);
  
  if (contextValue === null || contextValue === undefined) {
    throw new Error(
      `use${providerName} must be used within a ${providerName}Provider. ` +
      `Please check that ${providerName}Provider is present in the component tree.`
    );
  }
  
  return contextValue;
}

/**
 * Creates a provider availability report for testing and debugging
 * @returns Object with provider availability status
 */
export function useProviderAvailability() {
  const providers = [
    'ThemeProvider',
    'QueryClientProvider',
    'TimeZoneProvider',
    'AuthProvider',
    'LanguageProvider',
    'SecurityProvider',
    'TooltipProvider',
    'VideoSessionProvider',
    'VideoEffectsProvider'
  ];
  
  // Report which providers are found in the tree
  // This is for testing/debugging purposes
  const report: Record<string, boolean> = {};
  
  // We can't actually dynamically check for arbitrary providers
  // This would need to be expanded with actual specific checks
  // for each provider context if truly needed
  
  return report;
}
