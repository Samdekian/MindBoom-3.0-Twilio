import React, { useState, useCallback } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { LoadingState } from '@/components/ui/loading-state';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  lazy?: boolean;
  responsive?: boolean;
  placeholder?: string;
  errorFallback?: string | React.ReactNode;
  onLoadComplete?: () => void;
  priority?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  lazy = true,
  responsive = true,
  placeholder,
  errorFallback = "Failed to load image",
  className,
  onLoad,
  onError,
  onLoadComplete,
  priority = false,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const isMobile = useIsMobile();

  const handleLoad = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoading(false);
    setHasError(false);
    if (onLoad) onLoad(event);
    if (onLoadComplete) onLoadComplete();
  }, [onLoad, onLoadComplete]);

  const handleError = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoading(false);
    setHasError(true);
    if (onError) onError(event);
  }, [onError]);

  // Use Intersection Observer for lazy loading
  const imgRef = useCallback((node: HTMLImageElement | null) => {
    if (!node || !lazy || priority) {
      if (node && src !== imageSrc) {
        setImageSrc(src);
      }
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && src !== imageSrc) {
          setImageSrc(src);
          observer.disconnect();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: isMobile ? '50px' : '100px' // Smaller margin on mobile
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [src, imageSrc, lazy, priority, isMobile]);

  if (hasError) {
    return (
      <div className={cn(
        "flex items-center justify-center bg-muted text-muted-foreground text-sm",
        responsive && "w-full h-full min-h-[100px]",
        className
      )}>
        {typeof errorFallback === 'string' ? errorFallback : errorFallback}
      </div>
    );
  }

  return (
    <div className={cn("relative", responsive && "w-full", className)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingState variant="spinner" size="sm" />
        </div>
      )}
      
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        className={cn(
          responsive && "w-full h-auto",
          isLoading && "opacity-0",
          !isLoading && "opacity-100 transition-opacity duration-300",
          "select-none" // Prevent image selection on mobile
        )}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? "eager" : lazy ? "lazy" : "eager"}
        decoding="async"
        {...props}
      />
    </div>
  );
};

// Pre-configured image components for common use cases
export const AvatarImage: React.FC<Omit<OptimizedImageProps, 'responsive'>> = (props) => (
  <OptimizedImage 
    {...props} 
    responsive={false}
    className={cn("rounded-full object-cover", props.className)}
  />
);

export const HeroImage: React.FC<OptimizedImageProps> = (props) => (
  <OptimizedImage 
    {...props} 
    priority
    className={cn("object-cover", props.className)}
  />
);