import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

class SessionErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to console for debugging
    console.error('Session Error Boundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1
      }));
    }
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  getErrorMessage = (error: Error | null): string => {
    if (!error) return 'An unexpected error occurred';

    // Check for common video conference errors
    if (error.message.includes('permission')) {
      return 'Camera or microphone permission denied. Please allow access and try again.';
    }
    
    if (error.message.includes('network') || error.message.includes('connection')) {
      return 'Network connection error. Please check your internet connection.';
    }
    
    if (error.message.includes('webrtc') || error.message.includes('peer')) {
      return 'Video connection failed. This might be due to network restrictions.';
    }

    if (error.message.includes('device') || error.message.includes('media')) {
      return 'Device access error. Please check your camera and microphone.';
    }

    return error.message || 'An unexpected error occurred during the session';
  };

  getErrorSeverity = (error: Error | null): 'warning' | 'error' => {
    if (!error) return 'error';
    
    const message = error.message.toLowerCase();
    if (message.includes('permission') || message.includes('device')) {
      return 'warning'; // User can fix these
    }
    
    return 'error'; // System/network errors
  };

  render() {
    if (this.state.hasError) {
      const errorMessage = this.getErrorMessage(this.state.error);
      const severity = this.getErrorSeverity(this.state.error);
      const canRetry = this.state.retryCount < this.maxRetries;

      return (
        <div className="flex items-center justify-center min-h-[400px] p-4">
          <Card className="w-full max-w-lg border-destructive/20">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className={`rounded-full p-4 ${
                  severity === 'warning' 
                    ? 'bg-amber-500/10 text-amber-600' 
                    : 'bg-red-500/10 text-red-600'
                }`}>
                  <AlertTriangle className="h-8 w-8" />
                </div>
              </div>
              <CardTitle className="text-xl font-semibold">
                Session Error
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="text-center space-y-3">
                <p className="text-muted-foreground">
                  {errorMessage}
                </p>
                
                <div className="flex justify-center">
                  <Badge variant={severity === 'warning' ? 'secondary' : 'destructive'}>
                    {severity === 'warning' ? 'Action Required' : 'System Error'}
                  </Badge>
                </div>
              </div>

              {/* Error Details (only in development) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground flex items-center gap-1">
                    <Bug className="h-3 w-3" />
                    Technical Details
                  </summary>
                  <div className="mt-2 p-3 bg-gray-100 rounded text-gray-700 font-mono overflow-auto">
                    <div className="mb-2">
                      <strong>Error:</strong> {this.state.error.message}
                    </div>
                    <div className="mb-2">
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap text-xs mt-1">
                        {this.state.error.stack}
                      </pre>
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="whitespace-pre-wrap text-xs mt-1">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {canRetry && (
                  <Button 
                    onClick={this.handleRetry}
                    className="flex-1"
                    variant="default"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again ({this.maxRetries - this.state.retryCount} left)
                  </Button>
                )}
                
                <Button 
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex-1"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Button>
              </div>

              {!canRetry && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Maximum retry attempts reached. Please refresh the page or contact support.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SessionErrorBoundary;