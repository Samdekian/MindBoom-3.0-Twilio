
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle2, Play, RotateCcw, Download } from "lucide-react";
import { runAllTests, TestResult } from "@/utils/testing/video-conference-testing";
import { videoConferenceTestSuite, AutomatedTestResults } from "@/utils/testing/automated-test-suite";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TestingPanelProps {
  onComplete?: (results: Record<string, TestResult>) => void;
  onAutomatedComplete?: (results: AutomatedTestResults) => void;
}

const TestingPanel: React.FC<TestingPanelProps> = ({ onComplete, onAutomatedComplete }) => {
  const [results, setResults] = useState<Record<string, TestResult> | null>(null);
  const [automatedResults, setAutomatedResults] = useState<AutomatedTestResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAutomatedLoading, setIsAutomatedLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("basic");

  const startBasicTests = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const testResults = await runAllTests();
      setResults(testResults);
      
      if (onComplete) {
        onComplete(testResults);
      }
    } catch (err) {
      console.error("Error running basic tests:", err);
      setError((err as Error).message || "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const startAutomatedTests = async () => {
    setIsAutomatedLoading(true);
    setError(null);
    
    try {
      const testResults = await videoConferenceTestSuite.runAll();
      setAutomatedResults(testResults);
      
      if (onAutomatedComplete) {
        onAutomatedComplete(testResults);
      }
    } catch (err) {
      console.error("Error running automated tests:", err);
      setError((err as Error).message || "Unknown error");
    } finally {
      setIsAutomatedLoading(false);
    }
  };

  const downloadResults = () => {
    const data = {
      timestamp: new Date().toISOString(),
      basicTests: results,
      automatedTests: automatedResults
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `video-conference-tests-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const overallSuccess = results ? Object.values(results).every(r => r.passed) : false;
  const passCount = results ? Object.values(results).filter(r => r.passed).length : 0;
  const totalTests = results ? Object.values(results).length : 0;
  const passPercentage = totalTests > 0 ? Math.round((passCount / totalTests) * 100) : 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Video Conference System Testing</span>
          <div className="flex items-center gap-2">
            {(results || automatedResults) && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={downloadResults}
                className="flex items-center gap-1"
              >
                <Download className="h-3 w-3" />
                Export
              </Button>
            )}
            {results && (
              <Badge variant={overallSuccess ? "default" : "secondary"}>
                {passCount}/{totalTests} Passed
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Tests</TabsTrigger>
            <TabsTrigger value="automated">Automated Suite</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4">
            {isLoading && (
              <div className="text-center py-6">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Running basic system tests...</p>
              </div>
            )}
            
            {results && !isLoading && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Overall Compatibility</span>
                    <span>{passPercentage}%</span>
                  </div>
                  <Progress value={passPercentage} className="h-2" />
                </div>
                
                {Object.entries(results).map(([testName, result]) => (
                  <div key={testName} className="border rounded-lg p-3">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-medium capitalize">{testName.replace(/([A-Z])/g, ' $1')} Test</h3>
                      {result.passed ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{result.message}</p>
                    {result.details && (
                      <div className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto">
                        <pre>{JSON.stringify(result.details, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {!results && !isLoading && (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground mb-4">
                  Run basic compatibility tests for network, browser, and media devices.
                </p>
                <Button onClick={startBasicTests} className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Start Basic Tests
                </Button>
              </div>
            )}
            
            {results && (
              <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={startBasicTests} className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Run Again
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="automated" className="space-y-4">
            {isAutomatedLoading && (
              <div className="text-center py-6">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Running comprehensive automated test suite...</p>
              </div>
            )}
            
            {automatedResults && !isAutomatedLoading && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">{automatedResults.summary.total}</div>
                    <div className="text-sm text-muted-foreground">Total Tests</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 text-green-800 rounded-lg">
                    <div className="text-2xl font-bold">{automatedResults.summary.passed}</div>
                    <div className="text-sm">Passed</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 text-red-800 rounded-lg">
                    <div className="text-2xl font-bold">{automatedResults.summary.failed}</div>
                    <div className="text-sm">Failed</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 text-blue-800 rounded-lg">
                    <div className="text-2xl font-bold">{automatedResults.summary.passRate}%</div>
                    <div className="text-sm">Pass Rate</div>
                  </div>
                </div>
                
                {automatedResults.summary.criticalFailures.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Critical Test Failures</AlertTitle>
                    <AlertDescription>
                      The following critical tests failed: {automatedResults.summary.criticalFailures.join(', ')}
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-3">
                  {videoConferenceTestSuite.tests.map((test) => {
                    const result = automatedResults.results[test.id];
                    return (
                      <div key={test.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium flex items-center gap-2">
                              {test.name}
                              <Badge variant={test.category === 'critical' ? 'destructive' : test.category === 'important' ? 'default' : 'secondary'}>
                                {test.category}
                              </Badge>
                            </h3>
                            <p className="text-sm text-muted-foreground">{test.description}</p>
                          </div>
                          {result && (
                            result.passed ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                            ) : (
                              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                            )
                          )}
                        </div>
                        {result && (
                          <>
                            <p className="text-sm mb-2">{result.message}</p>
                            {result.details && (
                              <div className="text-xs bg-muted p-2 rounded overflow-x-auto">
                                <pre>{JSON.stringify(result.details, null, 2)}</pre>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {!automatedResults && !isAutomatedLoading && (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground mb-4">
                  Run the comprehensive automated test suite including permission validation, health monitoring, and session management tests.
                </p>
                <Button onClick={startAutomatedTests} className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Start Automated Suite
                </Button>
              </div>
            )}
            
            {automatedResults && (
              <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={startAutomatedTests} className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Run Suite Again
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TestingPanel;
