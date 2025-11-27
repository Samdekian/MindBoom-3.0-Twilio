
import { useState, useCallback } from 'react';

export interface WhiteboardState {
  isActive: boolean;
  isDrawing: boolean;
  currentTool: 'pen' | 'eraser' | 'text';
  strokeWidth: number;
  strokeColor: string;
}

export interface UseSessionWhiteboardReturn {
  whiteboardState: WhiteboardState;
  toggleWhiteboard: () => void;
  setTool: (tool: 'pen' | 'eraser' | 'text') => void;
  setStrokeWidth: (width: number) => void;
  setStrokeColor: (color: string) => void;
  clearWhiteboard: () => void;
}

export function useSessionWhiteboard(sessionId: string): UseSessionWhiteboardReturn {
  const [whiteboardState, setWhiteboardState] = useState<WhiteboardState>({
    isActive: false,
    isDrawing: false,
    currentTool: 'pen',
    strokeWidth: 2,
    strokeColor: '#000000',
  });

  const toggleWhiteboard = useCallback(() => {
    setWhiteboardState(prev => ({ ...prev, isActive: !prev.isActive }));
  }, []);

  const setTool = useCallback((tool: 'pen' | 'eraser' | 'text') => {
    setWhiteboardState(prev => ({ ...prev, currentTool: tool }));
  }, []);

  const setStrokeWidth = useCallback((width: number) => {
    setWhiteboardState(prev => ({ ...prev, strokeWidth: width }));
  }, []);

  const setStrokeColor = useCallback((color: string) => {
    setWhiteboardState(prev => ({ ...prev, strokeColor: color }));
  }, []);

  const clearWhiteboard = useCallback(() => {
    // Implementation for clearing whiteboard
  }, []);

  return {
    whiteboardState,
    toggleWhiteboard,
    setTool,
    setStrokeWidth,
    setStrokeColor,
    clearWhiteboard,
  };
}
