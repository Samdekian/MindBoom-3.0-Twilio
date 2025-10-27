import React, { useCallback, useRef, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface TouchGestureProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinch?: (scale: number) => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  swipeThreshold?: number;
  pinchThreshold?: number;
  longPressDelay?: number;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

export const TouchGestureHandler: React.FC<TouchGestureProps> = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPinch,
  onDoubleTap,
  onLongPress,
  swipeThreshold = 50,
  pinchThreshold = 0.1,
  longPressDelay = 500,
  children,
  className,
  disabled = false
}) => {
  const isMobile = useIsMobile();
  const touchStart = useRef<TouchPoint | null>(null);
  const touchEnd = useRef<TouchPoint | null>(null);
  const lastTap = useRef<TouchPoint | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [initialPinchDistance, setInitialPinchDistance] = useState<number | null>(null);

  const getTouchPoint = (touch: React.Touch): TouchPoint => ({
    x: touch.clientX,
    y: touch.clientY,
    timestamp: Date.now()
  });

  const getDistance = (touch1: React.Touch, touch2: React.Touch): number => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || !isMobile) return;

    const touch = e.touches[0];
    const touchPoint = getTouchPoint(touch);
    touchStart.current = touchPoint;

    // Handle pinch gesture
    if (e.touches.length === 2 && onPinch) {
      const distance = getDistance(e.touches[0], e.touches[1]);
      setInitialPinchDistance(distance);
    }

    // Handle long press
    if (onLongPress && e.touches.length === 1) {
      longPressTimer.current = setTimeout(() => {
        onLongPress();
      }, longPressDelay);
    }

    // Handle double tap
    if (onDoubleTap && lastTap.current) {
      const timeDiff = touchPoint.timestamp - lastTap.current.timestamp;
      const distance = Math.sqrt(
        Math.pow(touchPoint.x - lastTap.current.x, 2) +
        Math.pow(touchPoint.y - lastTap.current.y, 2)
      );

      if (timeDiff < 300 && distance < 50) {
        onDoubleTap();
        lastTap.current = null;
        return;
      }
    }

    lastTap.current = touchPoint;
  }, [disabled, isMobile, onPinch, onLongPress, onDoubleTap, longPressDelay]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (disabled || !isMobile) return;

    // Clear long press timer on move
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    // Handle pinch gesture
    if (e.touches.length === 2 && onPinch && initialPinchDistance) {
      const currentDistance = getDistance(e.touches[0], e.touches[1]);
      const scale = currentDistance / initialPinchDistance;
      
      if (Math.abs(scale - 1) > pinchThreshold) {
        onPinch(scale);
      }
    }
  }, [disabled, isMobile, onPinch, initialPinchDistance, pinchThreshold]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (disabled || !isMobile || !touchStart.current) return;

    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    const touch = e.changedTouches[0];
    touchEnd.current = getTouchPoint(touch);

    // Reset pinch distance
    if (e.touches.length === 0) {
      setInitialPinchDistance(null);
    }

    // Handle swipe gestures
    if (touchStart.current && touchEnd.current) {
      const deltaX = touchEnd.current.x - touchStart.current.x;
      const deltaY = touchEnd.current.y - touchStart.current.y;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      // Check if movement is significant enough to be a swipe
      if (Math.max(absDeltaX, absDeltaY) > swipeThreshold) {
        if (absDeltaX > absDeltaY) {
          // Horizontal swipe
          if (deltaX > 0 && onSwipeRight) {
            onSwipeRight();
          } else if (deltaX < 0 && onSwipeLeft) {
            onSwipeLeft();
          }
        } else {
          // Vertical swipe
          if (deltaY > 0 && onSwipeDown) {
            onSwipeDown();
          } else if (deltaY < 0 && onSwipeUp) {
            onSwipeUp();
          }
        }
      }
    }

    touchStart.current = null;
    touchEnd.current = null;
  }, [disabled, isMobile, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, swipeThreshold]);

  // Don't add touch handlers if not on mobile or disabled
  if (!isMobile || disabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      className={className}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: 'none' }} // Prevent default browser gestures
    >
      {children}
    </div>
  );
};

// Higher-order component for adding touch gestures
export const withTouchGestures = <P extends object>(
  Component: React.ComponentType<P>,
  gestureProps: Omit<TouchGestureProps, 'children'>
) => {
  const WrappedComponent = (props: P & { className?: string }) => (
    <TouchGestureHandler {...gestureProps} className={props.className}>
      <Component {...props} />
    </TouchGestureHandler>
  );
  
  WrappedComponent.displayName = `withTouchGestures(${Component.displayName || Component.name})`;
  return WrappedComponent;
};