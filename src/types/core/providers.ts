
import { ReactNode } from 'react';

export interface ProviderProps {
  children: ReactNode;
}

export type ProviderComponent = React.FC<ProviderProps>;

export interface ProviderOrder {
  name: string;
  level: number;
  description: string;
}

// Mapping of context provider dependencies
export const PROVIDER_DEPENDENCIES: Record<string, string[]> = {
  'ThemeProvider': [],
  'HelmetProvider': [],
  'QueryClientProvider': [],
  'TooltipProvider': [],
  'TimeZoneProvider': ['ThemeProvider'],
  'AuthProvider': ['QueryClientProvider'],
  'LanguageProvider': ['AuthProvider'],
  'SecurityProvider': ['AuthProvider'],
  'VideoSessionProvider': ['AuthProvider', 'TimeZoneProvider'],
  'VideoEffectsProvider': ['VideoSessionProvider'],
  'VideoContextProvider': ['VideoSessionProvider', 'AuthProvider']
};

// Calculated optimal provider order based on dependencies
export const PROVIDER_ORDER: ProviderOrder[] = [
  { name: 'ThemeProvider', level: 1, description: 'Theme styling and mode preferences' },
  { name: 'HelmetProvider', level: 1, description: 'Document head management' },
  { name: 'QueryClientProvider', level: 1, description: 'Data fetching and cache' },
  { name: 'TooltipProvider', level: 2, description: 'UI component tooltips' },
  { name: 'TimeZoneProvider', level: 2, description: 'Time zone preferences' },
  { name: 'AuthProvider', level: 3, description: 'Authentication and user session' },
  { name: 'LanguageProvider', level: 4, description: 'Internationalization' },
  { name: 'SecurityProvider', level: 4, description: 'Security settings and monitoring' },
  { name: 'VideoSessionProvider', level: 5, description: 'Video conferencing session' },
  { name: 'VideoEffectsProvider', level: 6, description: 'Video effects and filters' },
  { name: 'VideoContextProvider', level: 6, description: 'Video context and state' },
];
