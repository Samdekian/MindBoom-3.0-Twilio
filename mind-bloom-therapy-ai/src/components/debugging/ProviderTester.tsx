
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTimeZone } from '@/contexts/TimeZoneContext';
import { useSecurity } from '@/contexts/SecurityContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/**
 * Component that tests availability of various context providers
 * and displays their current state. Useful for debugging provider issues.
 */
export function ProviderTester() {
  // Provider availability test
  const providerTests = {
    ThemeProvider: useProviderTest(() => useTheme()),
    AuthProvider: useProviderTest(() => useAuthRBAC()),
    LanguageProvider: useProviderTest(() => useLanguage()),
    TimeZoneProvider: useProviderTest(() => useTimeZone()),
    SecurityProvider: useProviderTest(() => useSecurity()),
  };

  return (
    <Card className="p-4">
      <h2 className="text-xl font-bold mb-4">Provider Availability Test</h2>
      <div className="space-y-2">
        {Object.entries(providerTests).map(([name, available]) => (
          <div key={name} className="flex items-center justify-between">
            <span>{name}</span>
            <Badge 
              variant={available ? "default" : "destructive"}
              className="ml-2"
            >
              {available ? 'Available' : 'Missing'}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}

/**
 * Helper hook to safely test if a provider is available
 */
function useProviderTest(hook: () => any): boolean {
  try {
    hook();
    return true;
  } catch (e) {
    return false;
  }
}
