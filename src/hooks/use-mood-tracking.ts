import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, startOfWeek, endOfWeek, subDays } from "date-fns";

export interface MoodEntry {
  id: string;
  patient_id: string;
  mood_value: number;
  mood_label: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const useMoodTracking = (patientId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get mood entries for the last 7 days
  const { data: moodEntries = [], isLoading } = useQuery({
    queryKey: ['mood-entries', patientId],
    queryFn: async () => {
      const sevenDaysAgo = subDays(new Date(), 7);
      
      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('patient_id', patientId)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as MoodEntry[];
    },
    enabled: !!patientId,
  });

  // Get current streak
  const { data: currentStreak = 0 } = useQuery({
    queryKey: ['mood-streak', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mood_entries')
        .select('created_at')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) throw error;
      
      // Calculate consecutive days with entries
      let streak = 0;
      const today = new Date();
      
      for (let i = 0; i < 30; i++) {
        const checkDate = subDays(today, i);
        const hasEntry = data.some(entry => 
          format(new Date(entry.created_at), 'yyyy-MM-dd') === format(checkDate, 'yyyy-MM-dd')
        );
        
        if (hasEntry) {
          streak++;
        } else if (i > 0) {
          break; // Stop counting if we hit a day without an entry (but allow today)
        }
      }
      
      return streak;
    },
    enabled: !!patientId,
  });

  // Create mood entry mutation
  const createMoodEntry = useMutation({
    mutationFn: async ({ moodValue, moodLabel, notes }: { 
      moodValue: number; 
      moodLabel: string; 
      notes?: string; 
    }) => {
      const { data, error } = await supabase
        .from('mood_entries')
        .insert({
          patient_id: patientId,
          mood_value: moodValue,
          mood_label: moodLabel,
          notes,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Real-time updates will handle invalidation
      // but we keep this for immediate UI feedback
      queryClient.invalidateQueries({ queryKey: ['mood-entries', patientId] });
      queryClient.invalidateQueries({ queryKey: ['mood-streak', patientId] });
      
      // Note: Toast will be shown via real-time subscription
    },
    onError: (error) => {
      toast({
        title: "Error logging mood",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Process mood data for chart display
  const processedMoodData = (() => {
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dayName = format(date, 'EEE');
      const dateStr = format(date, 'yyyy-MM-dd');
      
      const entry = moodEntries.find(entry => 
        format(new Date(entry.created_at), 'yyyy-MM-dd') === dateStr
      );
      
      last7Days.push({
        day: dayName,
        value: entry?.mood_value || 0,
        mood: entry?.mood_label || 'No data',
        hasEntry: !!entry,
      });
    }
    
    return last7Days;
  })();

  return {
    moodEntries,
    processedMoodData,
    currentStreak,
    isLoading,
    createMoodEntry: createMoodEntry.mutate,
    isCreating: createMoodEntry.isPending,
  };
};