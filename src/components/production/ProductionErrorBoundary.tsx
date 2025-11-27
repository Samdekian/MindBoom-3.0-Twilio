import React from 'react';
import { errorReporter } from '@/lib/production/monitoring';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  context?: string;
}

export class ProductionErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });

    // Report error to monitoring service
    errorReporter.reportError(error, this.props.context || 'react_error_boundary', {
      componentStack: errorInfo.componentStack,
      errorBoundary: this.constructor.name,
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

interface DefaultErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

const DefaultErrorFallback: React.FC<DefaultErrorFallbackProps> = ({ error, resetError }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Something went wrong
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              We're sorry, but something unexpected happened. Our team has been notified.
            </p>
            <div className="mt-4">
              <button
                onClick={resetError}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Try again
              </button>
            </div>
            
            {/* Show error details in development */}
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4 text-left">
                <summary className="text-sm font-medium text-gray-700 cursor-pointer">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 p-3 bg-gray-100 rounded text-xs text-gray-800 overflow-auto">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Specific error boundaries for different parts of the app
export const VideoConferenceErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProductionErrorBoundary
    context="video_conference"
    fallback={VideoConferenceErrorFallback}
  >
    {children}
  </ProductionErrorBoundary>
);

const VideoConferenceErrorFallback: React.FC<DefaultErrorFallbackProps> = ({ error, resetError }) => (
  <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
    <div className="text-center">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </div>
      <h3 className="mt-4 text-lg font-medium text-gray-900">
        Video Conference Error
      </h3>
      <p className="mt-2 text-sm text-gray-500">
        There was a problem with the video conference. Please try refreshing the page.
      </p>
      <div className="mt-4 space-x-2">
        <button
          onClick={resetError}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
        >
          Retry
        </button>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Refresh Page
        </button>
      </div>
    </div>
  </div>
);

export const SessionErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProductionErrorBoundary
    context="session_management"
    fallback={SessionErrorFallback}
  >
    {children}
  </ProductionErrorBoundary>
);

const SessionErrorFallback: React.FC<DefaultErrorFallbackProps> = ({ error, resetError }) => (
  <div className="flex items-center justify-center h-32 bg-yellow-50 border border-yellow-200 rounded-lg">
    <div className="text-center">
      <div className="mx-auto flex items-center justify-center h-8 w-8 rounded-full bg-yellow-100">
        <svg className="h-4 w-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p className="mt-2 text-sm font-medium text-yellow-800">Session Error</p>
      <button
        onClick={resetError}
        className="mt-2 text-xs text-yellow-600 hover:text-yellow-500 underline"
      >
        Retry
      </button>
    </div>
  </div>
);