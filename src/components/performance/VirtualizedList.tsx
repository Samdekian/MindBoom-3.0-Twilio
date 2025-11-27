import React, { useMemo, useState, useEffect, useRef } from 'react';
import { LoadingState } from '@/components/ui/loading-state';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  emptyState?: React.ReactNode;
}

export function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className,
  emptyState
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  // Calculate visible range
  const { startIndex, endIndex, totalHeight } = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    const totalHeight = items.length * itemHeight;

    return { startIndex, endIndex, totalHeight };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  // Get visible items
  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index
    }));
  }, [items, startIndex, endIndex]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  // Handle empty state
  if (items.length === 0) {
    return (
      <div className={className} style={{ height: containerHeight }}>
        {emptyState || (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No items to display
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={scrollElementRef}
      className={className}
      style={{ 
        height: containerHeight, 
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch' // Smooth scrolling on iOS
      }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${startIndex * itemHeight}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map(({ item, index }) => (
            <div
              key={index}
              style={{ height: itemHeight }}
              className="flex-shrink-0"
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Hook for managing virtualized list state
export function useVirtualizedList<T>({
  items,
  itemHeight,
  containerHeight
}: {
  items: T[];
  itemHeight: number;
  containerHeight: number;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simulate async operations for large lists
  useEffect(() => {
    if (items.length > 1000) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [items.length]);

  const scrollToItem = (index: number, scrollElement?: HTMLDivElement) => {
    if (scrollElement) {
      const scrollTop = index * itemHeight;
      scrollElement.scrollTo({ top: scrollTop, behavior: 'smooth' });
    }
  };

  return {
    isLoading,
    error,
    scrollToItem,
    itemCount: items.length,
    estimatedHeight: items.length * itemHeight
  };
}