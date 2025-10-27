
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProviderTester } from '@/components/debugging/ProviderTester';
import { PROVIDER_DEPENDENCIES, PROVIDER_ORDER } from '@/types/core/providers';
import { detectCircularDependencies } from '@/utils/provider-utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

export default function ProviderDiagnostics() {
  const [activeTab, setActiveTab] = useState('overview');
  const circularDependencies = detectCircularDependencies();
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Provider Architecture Diagnostics</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
          <TabsTrigger value="order">Nesting Order</TabsTrigger>
          <TabsTrigger value="tester">Availability Tester</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Provider Architecture Overview</CardTitle>
              <CardDescription>
                Analysis of the application's context provider structure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Provider Count</h3>
                  <p>{Object.keys(PROVIDER_DEPENDENCIES).length} providers identified</p>
                </div>
                
                {circularDependencies.length > 0 && (
                  <Alert variant="destructive">
                    <AlertTitle>Circular Dependencies Detected</AlertTitle>
                    <AlertDescription>
                      <div className="mt-2">
                        {circularDependencies.map((cycle, i) => (
                          <div key={i} className="text-sm">
                            Cycle {i+1}: {cycle.join(' → ')}
                          </div>
                        ))}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
                
                <ProviderTester />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="dependencies">
          <Card>
            <CardHeader>
              <CardTitle>Provider Dependencies</CardTitle>
              <CardDescription>
                Dependencies between different providers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(PROVIDER_DEPENDENCIES).map(([provider, deps]) => (
                  <div key={provider} className="border p-3 rounded-md">
                    <h3 className="font-medium">{provider}</h3>
                    {deps.length > 0 ? (
                      <div className="mt-1 text-sm">
                        <span className="text-gray-500">Depends on: </span>
                        {deps.join(', ')}
                      </div>
                    ) : (
                      <div className="mt-1 text-sm text-gray-500">No dependencies</div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="order">
          <Card>
            <CardHeader>
              <CardTitle>Provider Nesting Order</CardTitle>
              <CardDescription>
                Recommended order for provider nesting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {PROVIDER_ORDER.map((provider, index) => (
                  <div key={provider.name} className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                      {provider.level}
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="font-medium">{provider.name}</div>
                      <div className="text-sm text-gray-500">{provider.description}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <Separator className="my-6" />
              
              <div className="text-sm bg-muted p-4 rounded-md font-mono whitespace-pre-wrap">
                {`<HelmetProvider>\n  <QueryClientProvider>\n    <ThemeProvider>\n      <TimeZoneProvider>\n        <TooltipProvider>\n          <AuthProvider>\n            <LanguageProvider>\n              <SecurityProvider>\n                {children}\n              </SecurityProvider>\n            </LanguageProvider>\n          </AuthProvider>\n        </TooltipProvider>\n      </TimeZoneProvider>\n    </ThemeProvider>\n  </QueryClientProvider>\n</HelmetProvider>`}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tester">
          <Card>
            <CardHeader>
              <CardTitle>Provider Availability Test</CardTitle>
              <CardDescription>
                Tests which providers are available in the current component tree
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProviderTester />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
