
import { useState, useCallback } from 'react';

export interface Action {
  id: string;
  type: 'create' | 'update' | 'delete' | 'move' | 'bulk_create' | 'bulk_delete' | 'bulk_update';
  description: string;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  timestamp: Date;
}

export const useUndoRedo = () => {
  const [history, setHistory] = useState<Action[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const canUndo = currentIndex >= 0;
  const canRedo = currentIndex < history.length - 1;

  const addAction = useCallback((action: Action) => {
    setHistory(prev => {
      // Remove any actions after current index
      const newHistory = prev.slice(0, currentIndex + 1);
      // Add new action
      newHistory.push(action);
      // Limit history to last 50 actions
      if (newHistory.length > 50) {
        newHistory.shift();
      }
      return newHistory;
    });
    setCurrentIndex(prev => Math.min(prev + 1, 49));
  }, [currentIndex]);

  const undo = useCallback(async () => {
    if (!canUndo) return;
    
    const action = history[currentIndex];
    try {
      await action.undo();
      setCurrentIndex(prev => prev - 1);
    } catch (error) {
      console.error('Undo failed:', error);
      throw error;
    }
  }, [canUndo, currentIndex, history]);

  const redo = useCallback(async () => {
    if (!canRedo) return;
    
    const action = history[currentIndex + 1];
    try {
      await action.redo();
      setCurrentIndex(prev => prev + 1);
    } catch (error) {
      console.error('Redo failed:', error);
      throw error;
    }
  }, [canRedo, currentIndex, history]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
  }, []);

  const getCurrentAction = useCallback(() => {
    if (currentIndex >= 0 && currentIndex < history.length) {
      return history[currentIndex];
    }
    return null;
  }, [currentIndex, history]);

  return {
    addAction,
    undo,
    redo,
    canUndo,
    canRedo,
    clearHistory,
    getCurrentAction,
    history: history.slice(0, currentIndex + 1)
  };
};
