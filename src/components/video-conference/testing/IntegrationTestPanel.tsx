
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, AlertCircle, Play, Users, Shield, Zap } from "lucide-react";
import { runIntegrationTests, IntegrationTestSuite } from "@/utils/testing/integration-test-runner";

interface IntegrationTestPanelProps {
  onComplete?: (results: IntegrationTestSuite[]) => void;
}

const IntegrationTestPanel: React.FC<IntegrationTestPanelProps> = ({ onComplete }) => {
  const [results, setResults] = useState<IntegrationTestSuite[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startIntegrationTests = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const testResults = await runIntegrationTests();
      setResults(testResults);
      
      if (onComplete) {
        onComplete(testResults);
      }
    } catch (err) {
      console.error("Error running integration tests:", err);
      setError((err as Error).message || "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const getOverallStats = () => {
    if (!results) return null;
    
    const allResults = results.flatMap(suite => suite.results);
    const passedTests = allResults.filter(r => r.passed).length;
    const totalDuration = results.reduce((sum, suite) => sum + suite.totalDuration, 0);
    
    return {
      totalTests: allResults.length,
      passedTests,
      passRate: Math.round((passedTests / allResults.length) * 100),
      totalDuration: Math.round(totalDuration / 1000)
    };
  };

  const getSuiteIcon = (suiteName: string) => {
    switch (suiteName) {
      case 'System Compatibility': return Shield;
      case 'User Flow': return Users;
      case 'Real-time Synchronization': return Zap;
      case 'Edge Cases': return AlertCircle;
      default: return CheckCircle2;
    }
  };

  const stats = getOverallStats();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Complete Video Session Integration Tests
          </span>
          {stats && (
            <Badge variant={stats.passRate === 100 ? "default" : "destructive"}>
              {stats.passedTests}/{stats.totalTests} Passed
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Test Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {isLoading && (
          <div className="text-center py-8">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Running Integration Tests</h3>
            <p className="text-sm text-muted-foreground">
              Testing complete patient-to-therapist video session flow...
            </p>
          </div>
        )}
        
        {stats && !isLoading && (
          <div className="space-y-6">
            {/* Overall Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.passRate}%</div>
                <div className="text-sm text-muted-foreground">Pass Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.totalTests}</div>
                <div className="text-sm text-muted-foreground">Total Tests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.totalDuration}s</div>
                <div className="text-sm text-muted-foreground">Duration</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Progress</span>
                <span>{stats.passRate}%</span>
              </div>
              <Progress value={stats.passRate} className="h-3" />
            </div>

            {/* Test Suite Results */}
            <div className="space-y-4">
              {results.map((suite, index) => {
                const IconComponent = getSuiteIcon(suite.suiteName);
                const suitePassRate = Math.round(
                  (suite.results.filter(r => r.passed).length / suite.results.length) * 100
                );
                
                return (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-5 w-5" />
                        <h3 className="font-medium">{suite.suiteName}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={suite.passed ? "default" : "destructive"}>
                          {suitePassRate}%
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {Math.round(suite.totalDuration / 1000)}s
                        </span>
                      </div>
                    </div>
                    
                    {/* Individual Test Results */}
                    <div className="space-y-2">
                      {suite.results.map((result, resultIndex) => (
                        <div 
                          key={resultIndex} 
                          className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded"
                        >
                          <div className="flex items-center gap-2">
                            {result.passed ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span className="text-sm">{result.testName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{result.duration}ms</span>
                            {result.error && (
                              <span className="text-red-500 max-w-40 truncate">
                                {result.error}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {!results && !isLoading && (
          <div className="text-center py-8">
            <div className="mb-4">
              <Play className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            </div>
            <h3 className="text-lg font-medium mb-2">
              Complete Integration Test Suite
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Test the complete patient-to-therapist video session flow including booking, 
              authorization, real-time synchronization, and edge cases.
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                System Compatibility
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                User Flow Testing
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Real-time Sync
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Edge Cases
              </div>
            </div>
            <Button onClick={startIntegrationTests} size="lg">
              <Play className="h-4 w-4 mr-2" />
              Run Integration Tests
            </Button>
          </div>
        )}
        
        {results && (
          <div className="flex justify-end mt-6">
            <Button variant="outline" onClick={startIntegrationTests}>
              Run Tests Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IntegrationTestPanel;
