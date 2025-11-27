import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MobileOptimizedButton } from '@/components/mobile/MobileOptimizedButton';
import { MobileOptimizedInput } from '@/components/mobile/MobileOptimizedInput';
import { MobileOptimizedModal, useMobileModal } from '@/components/mobile/MobileOptimizedModal';
import { TouchGestureHandler } from '@/components/mobile/TouchGestureHandler';
import { OptimizedImage } from '@/components/performance/ImageOptimizer';
import { VirtualizedList } from '@/components/performance/VirtualizedList';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { useIsMobile } from '@/hooks/use-mobile';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Smartphone, Zap, Image, List } from 'lucide-react';

export default function MobileOptimizationDemo() {
  const isMobile = useIsMobile();
  const { metrics, recommendations } = usePerformanceMonitor();
  const modal = useMobileModal();
  const [swipeDirection, setSwipeDirection] = useState<string>('');
  const [inputValue, setInputValue] = useState('');

  // Demo data for virtualized list
  const listItems = Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    title: `Item ${i + 1}`,
    description: `This is a description for item ${i + 1}`
  }));

  const handleSwipe = (direction: string) => {
    setSwipeDirection(direction);
    setTimeout(() => setSwipeDirection(''), 2000);
  };

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Mobile Optimization Demo</h1>
          <p className="text-muted-foreground">
            Experience mobile-first optimizations and performance enhancements
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Smartphone className="h-5 w-5" />
            <span className="text-sm">
              {isMobile ? 'Mobile View' : 'Desktop View'}
            </span>
          </div>
        </div>

        {/* Performance Metrics */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-2 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{metrics.fps}</div>
                <div className="text-xs text-muted-foreground">FPS</div>
              </div>
              <div className="text-center p-2 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{metrics.memoryUsage}</div>
                <div className="text-xs text-muted-foreground">Memory (MB)</div>
              </div>
              <div className="text-center p-2 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{Math.round(metrics.loadTime / 1000)}</div>
                <div className="text-xs text-muted-foreground">Load Time (s)</div>
              </div>
              <div className="text-center p-2 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{metrics.isSlowDevice ? 'Yes' : 'No'}</div>
                <div className="text-xs text-muted-foreground">Slow Device</div>
              </div>
            </div>
            {recommendations.length > 0 && (
              <div className="text-sm text-orange-600 dark:text-orange-400">
                Recommendations: {recommendations.join(', ')}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Touch-Optimized Components */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Touch-Optimized Components</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Mobile-Optimized Buttons</h4>
              <div className="flex flex-wrap gap-2">
                <MobileOptimizedButton variant="default">
                  Primary Action
                </MobileOptimizedButton>
                <MobileOptimizedButton variant="outline">
                  Secondary
                </MobileOptimizedButton>
                <MobileOptimizedButton variant="ghost">
                  Ghost Button
                </MobileOptimizedButton>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Mobile-Optimized Input</h4>
              <MobileOptimizedInput
                placeholder="Touch-optimized input field"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>

            <div>
              <h4 className="font-medium mb-2">Modal Dialog</h4>
              <Button onClick={modal.open}>
                Open Mobile-Optimized Modal
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Touch Gestures */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Touch Gesture Detection</CardTitle>
          </CardHeader>
          <CardContent>
            <TouchGestureHandler
              onSwipeLeft={() => handleSwipe('Left')}
              onSwipeRight={() => handleSwipe('Right')}
              onSwipeUp={() => handleSwipe('Up')}
              onSwipeDown={() => handleSwipe('Down')}
              className="bg-muted rounded-lg p-8 text-center touch-none select-none"
            >
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {isMobile ? 'Swipe in any direction' : 'Touch gestures work on mobile devices'}
                </p>
                <div className="flex justify-center gap-2">
                  <ArrowLeft className={`h-6 w-6 ${swipeDirection === 'Left' ? 'text-green-500' : 'text-muted-foreground'}`} />
                  <ArrowUp className={`h-6 w-6 ${swipeDirection === 'Up' ? 'text-green-500' : 'text-muted-foreground'}`} />
                  <ArrowDown className={`h-6 w-6 ${swipeDirection === 'Down' ? 'text-green-500' : 'text-muted-foreground'}`} />
                  <ArrowRight className={`h-6 w-6 ${swipeDirection === 'Right' ? 'text-green-500' : 'text-muted-foreground'}`} />
                </div>
                {swipeDirection && (
                  <p className="text-green-600 font-medium">
                    Swiped {swipeDirection}!
                  </p>
                )}
              </div>
            </TouchGestureHandler>
          </CardContent>
        </Card>

        {/* Optimized Image */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Image Optimization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Lazy-loaded Image</h4>
                <OptimizedImage
                  src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop"
                  alt="Optimized mobile image"
                  className="rounded-lg w-full max-w-sm"
                  lazy={true}
                />
              </div>
              <div>
                <h4 className="font-medium mb-2">Priority Image</h4>
                <OptimizedImage
                  src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=300&fit=crop"
                  alt="Priority loaded image"
                  className="rounded-lg w-full max-w-sm"
                  priority={true}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Virtualized List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <List className="h-5 w-5" />
              Performance: Virtualized List
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Rendering 1000 items efficiently using virtualization
            </p>
            <VirtualizedList
              items={listItems}
              itemHeight={60}
              containerHeight={300}
              renderItem={(item, index) => (
                <div className="flex items-center p-3 border-b border-border hover:bg-muted/50">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{item.title}</div>
                    <div className="text-sm text-muted-foreground">{item.description}</div>
                  </div>
                </div>
              )}
              className="border rounded-lg"
            />
          </CardContent>
        </Card>
      </div>

      {/* Mobile Modal */}
      <MobileOptimizedModal
        isOpen={modal.isOpen}
        onClose={modal.close}
        title="Mobile-Optimized Modal"
        fullScreen={isMobile}
      >
        <div className="space-y-4">
          <p>This modal adapts to mobile devices:</p>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>Full-screen on mobile</li>
            <li>Touch-optimized close button</li>
            <li>Prevents body scroll</li>
            <li>Smooth animations</li>
          </ul>
          <MobileOptimizedButton 
            onClick={modal.close}
            className="w-full"
          >
            Close Modal
          </MobileOptimizedButton>
        </div>
      </MobileOptimizedModal>
    </div>
  );
}