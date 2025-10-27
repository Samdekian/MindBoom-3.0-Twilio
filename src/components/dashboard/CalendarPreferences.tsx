import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

const CalendarPreferences = () => {
  const { user } = useAuthRBAC();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: preferences, isLoading } = useQuery({
    queryKey: ['calendar-preferences'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calendar_preferences')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: any) => {
      const { data, error } = await supabase
        .from('calendar_preferences')
        .upsert({
          user_id: user?.id,
          ...values
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-preferences'] });
      toast({
        title: "Preferences Updated",
        description: "Your calendar notification preferences have been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating preferences:", error);
    },
  });

  const handleSubmit = (values: any) => {
    mutation.mutate(values);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Calendar Notification Preferences
        </CardTitle>
        <CardDescription>
          Customize how and when you receive appointment notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="notifications-enabled">Enable Notifications</Label>
            <Switch
              id="notifications-enabled"
              checked={preferences?.enabled ?? true}
              onCheckedChange={(enabled) => handleSubmit({ ...preferences, enabled })}
            />
          </div>

          <div className="space-y-2">
            <Label>Notification Type</Label>
            <RadioGroup
              defaultValue={preferences?.notification_type ?? 'email'}
              onValueChange={(value) => handleSubmit({ ...preferences, notification_type: value })}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" id="email" />
                <Label htmlFor="email">Email only</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sms" id="sms" />
                <Label htmlFor="sms">SMS only</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="both" id="both" />
                <Label htmlFor="both">Both Email and SMS</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Reminder Time</Label>
            <Select
              defaultValue={String(preferences?.notification_time_minutes ?? 30)}
              onValueChange={(value) => 
                handleSubmit({ ...preferences, notification_time_minutes: parseInt(value) })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select reminder time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes before</SelectItem>
                <SelectItem value="30">30 minutes before</SelectItem>
                <SelectItem value="60">1 hour before</SelectItem>
                <SelectItem value="120">2 hours before</SelectItem>
                <SelectItem value="1440">24 hours before</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarPreferences;
