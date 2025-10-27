import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ActivityItem {
  id: string;
  type: 'mood' | 'goal' | 'appointment' | 'message' | 'resource' | 'general';
  title: string;
  description: string;
  timestamp: Date;
  isNew?: boolean;
}

// Global activity feed manager
class ActivityFeedManager {
  private listeners: Set<(activity: ActivityItem) => void> = new Set();
  
  addListener(callback: (activity: ActivityItem) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
  
  addActivity(activity: Omit<ActivityItem, 'id'>) {
    const newActivity: ActivityItem = {
      ...activity,
      id: Date.now().toString() + Math.random().toString(36),
      isNew: true
    };
    
    this.listeners.forEach(listener => listener(newActivity));
  }
}

export const activityFeedManager = new ActivityFeedManager();

export const useActivityFeed = (maxItems = 10) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  
  useEffect(() => {
    const unsubscribe = activityFeedManager.addListener((newActivity) => {
      setActivities(prev => [newActivity, ...prev].slice(0, maxItems));
      
      setTimeout(() => {
        setActivities(prev => 
          prev.map(item => 
            item.id === newActivity.id ? { ...item, isNew: false } : item
          )
        );
      }, 3000);
    });
    
    return () => {
      unsubscribe();
    };
  }, [maxItems]);
  
  return activities;
};