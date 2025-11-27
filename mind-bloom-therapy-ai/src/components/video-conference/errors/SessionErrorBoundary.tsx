import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  children: ReactNode;
  sessionId?: string;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
  retryCount: number;
}

export class SessionErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;
  private retryTimeout?: NodeJS.Timeout;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
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
    console.error('🚨 Session Error Boundary caught an error:', error, errorInfo);
    
    const errorId = this.generateErrorId();
    
    this.setState({
      error,
      errorInfo,
      errorId
    });

    // Log error to analytics
    this.logErrorToAnalytics(error, errorInfo, errorId);
    
    // Call parent error handler
    this.props.onError?.(error, errorInfo);

    // Show toast notification
    toast.error('An unexpected error occurred in the video session', {
      action: {
        label: 'Retry',
        onClick: () => this.handleRetry()
      }
    });
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async logErrorToAnalytics(error: Error, errorInfo: ErrorInfo, errorId: string) {
    try {
      await supabase.functions.invoke('session-analytics', {
        body: {
          action: 'track_event',
          sessionId: this.props.sessionId || 'unknown',
          eventType: 'error_occurred',
          metadata: {
            errorId,
            errorMessage: error.message,
            errorStack: error.stack,
            componentStack: errorInfo.componentStack,
            errorBoundary: 'SessionErrorBoundary',
            retryCount: this.state.retryCount,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
          },
          timestamp: new Date().toISOString()
        }
      });
    } catch (analyticsError) {
      console.error('Failed to log error to analytics:', analyticsError);
    }
  }

  private handleRetry = () => {
    if (this.state.retryCount >= this.maxRetries) {
      toast.error('Maximum retry attempts reached. Please refresh the page.');
      return;
    }

    console.log(`🔄 Retrying session (attempt ${this.state.retryCount + 1}/${this.maxRetries})`);
    
    this.setState(prevState => ({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: undefined,
      retryCount: prevState.retryCount + 1
    }));

    // Log retry attempt
    if (this.props.sessionId) {
      this.logErrorToAnalytics(
        new Error('Session retry attempt'),
        { componentStack: 'Retry initiated by user' } as ErrorInfo,
        `retry_${this.state.retryCount + 1}`
      );
    }
  };

  private handleRefreshPage = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private getErrorSeverity(error: Error): 'low' | 'medium' | 'high' | 'critical' {
    const errorMessage = error.message.toLowerCase();
    
    if (errorMessage.includes('network') || errorMessage.includes('connection')) {
      return 'medium';
    }
    
    if (errorMessage.includes('permission') || errorMessage.includes('camera') || errorMessage.includes('microphone')) {
      return 'high';
    }
    
    if (errorMessage.includes('agora') || errorMessage.includes('token') || errorMessage.includes('session')) {
      return 'critical';
    }
    
    return 'low';
  }

  private getErrorRecommendation(error: Error): string {
    const errorMessage = error.message.toLowerCase();
    
    if (errorMessage.includes('network') || errorMessage.includes('connection')) {
      return 'Check your internet connection and try again.';
    }
    
    if (errorMessage.includes('permission')) {
      return 'Please grant camera and microphone permissions and refresh the page.';
    }
    
    if (errorMessage.includes('camera') || errorMessage.includes('microphone')) {
      return 'Check your camera and microphone settings, then try again.';
    }
    
    if (errorMessage.includes('token')) {
      return 'Session token expired. Please rejoin the session.';
    }
    
    return 'Try refreshing the page or rejoin the session.';
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const error = this.state.error!;
      const severity = this.getErrorSeverity(error);
      const recommendation = this.getErrorRecommendation(error);
      const canRetry = this.state.retryCount < this.maxRetries;

      return (
        <div className="flex items-center justify-center min-h-[400px] p-6 bg-gradient-to-br from-gray-900 to-gray-800">
          <div className="max-w-md w-full space-y-6">
            <Alert variant={severity === 'critical' ? 'destructive' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="text-lg font-semibold">
                Video Session Error
              </AlertTitle>
              <AlertDescription className="mt-2 space-y-3">
                <p className="text-sm">
                  {recommendation}
                </p>
                
                <div className="text-xs text-gray-400 space-y-1">
                  <p><strong>Error:</strong> {error.message}</p>
                  {this.state.errorId && (
                    <p><strong>Error ID:</strong> {this.state.errorId}</p>
                  )}
                  <p><strong>Retry Count:</strong> {this.state.retryCount}/{this.maxRetries}</p>
                </div>
              </AlertDescription>
            </Alert>

            <div className="flex flex-col gap-3">
              {canRetry && (
                <Button 
                  onClick={this.handleRetry}
                  className="w-full"
                  variant="default"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Session ({this.maxRetries - this.state.retryCount} attempts left)
                </Button>
              )}
              
              <Button 
                onClick={this.handleRefreshPage}
                className="w-full"
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Page
              </Button>
              
              <Button 
                onClick={this.handleGoHome}
                className="w-full"
                variant="ghost"
              >
                <Home className="h-4 w-4 mr-2" />
                Go to Home
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-300">
                  <Bug className="inline h-3 w-3 mr-1" />
                  Developer Details
                </summary>
                <div className="mt-2 p-3 bg-gray-800 rounded text-xs text-gray-300 font-mono">
                  <p><strong>Error Stack:</strong></p>
                  <pre className="whitespace-pre-wrap break-all text-xs">
                    {error.stack}
                  </pre>
                  
                  {this.state.errorInfo && (
                    <>
                      <p className="mt-2"><strong>Component Stack:</strong></p>
                      <pre className="whitespace-pre-wrap break-all text-xs">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}