import React, { Suspense, lazy } from 'react';
import { LoadingState } from '@/components/ui/loading-state';

interface LazyLoadWrapperProps {
  loadingComponent?: React.ComponentType;
  fallbackText?: string;
  fallbackVariant?: "spinner" | "skeleton" | "progress";
  children: React.ReactNode;
}

export const LazyLoadWrapper: React.FC<LazyLoadWrapperProps> = ({
  loadingComponent: LoadingComponent,
  fallbackText = "Loading component...",
  fallbackVariant = "skeleton",
  children
}) => {
  const fallback = LoadingComponent ? (
    <LoadingComponent />
  ) : (
    <LoadingState 
      variant={fallbackVariant}
      text={fallbackText}
      className="py-8"
    />
  );

  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};

// Higher-order component for lazy loading
export const withLazyLoading = <P extends object>(
  ComponentLoader: () => Promise<{ default: React.ComponentType<P> }>,
  loadingOptions?: Omit<LazyLoadWrapperProps, 'children'>
) => {
  const LazyComponent = lazy(ComponentLoader);
  
  return React.forwardRef<any, P>((props, ref) => (
    <LazyLoadWrapper {...loadingOptions}>
      <LazyComponent ref={ref} {...props} />
    </LazyLoadWrapper>
  ));
};

// Pre-configured lazy loaders for common scenarios
export const LazyPage = withLazyLoading;
export const LazyModal = (loader: () => Promise<{ default: React.ComponentType<any> }>) =>
  withLazyLoading(loader, { fallbackVariant: "spinner", fallbackText: "Loading..." });
export const LazyChart = (loader: () => Promise<{ default: React.ComponentType<any> }>) =>
  withLazyLoading(loader, { fallbackVariant: "skeleton" });