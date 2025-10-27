
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { BellIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ReminderPreferencesProps {
  reminderEnabled: boolean;
  reminderTime: number;
  onReminderEnabledChange: (enabled: boolean) => void;
  onReminderTimeChange: (minutes: number) => void;
  onSave: () => void;
}

const AppointmentReminderPreferences: React.FC<ReminderPreferencesProps> = ({
  reminderEnabled,
  reminderTime,
  onReminderEnabledChange,
  onReminderTimeChange,
  onSave
}) => {
  const { toast } = useToast();

  const handleSave = () => {
    onSave();
    toast({
      title: "Preferences saved",
      description: "Your reminder preferences have been updated"
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BellIcon className="h-5 w-5" />
          Appointment Reminders
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="reminder-switch">Enable appointment reminders</Label>
            <p className="text-sm text-muted-foreground">
              Receive notifications before your appointments
            </p>
          </div>
          <Switch
            id="reminder-switch"
            checked={reminderEnabled}
            onCheckedChange={onReminderEnabledChange}
          />
        </div>
        
        {reminderEnabled && (
          <div className="space-y-2">
            <Label htmlFor="reminder-time">Reminder time</Label>
            <Select 
              value={reminderTime.toString()} 
              onValueChange={(value) => onReminderTimeChange(parseInt(value))}
            >
              <SelectTrigger id="reminder-time">
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes before</SelectItem>
                <SelectItem value="30">30 minutes before</SelectItem>
                <SelectItem value="60">1 hour before</SelectItem>
                <SelectItem value="120">2 hours before</SelectItem>
                <SelectItem value="1440">1 day before</SelectItem>
                <SelectItem value="2880">2 days before</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        
        <div className="pt-4">
          <Button onClick={handleSave}>Save Preferences</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppointmentReminderPreferences;
