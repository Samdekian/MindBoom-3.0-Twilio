
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Bell } from "lucide-react";
import { 
  useAppointmentNotifications,
  NotificationType
} from "@/hooks/use-appointment-notifications";

interface NotificationPreferencesProps {
  appointmentId: string;
}

export const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({
  appointmentId
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notificationType, setNotificationType] = useState<NotificationType>("email");
  const [reminderTime, setReminderTime] = useState<number>(24); // Default: 24 hours
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  
  const {
    getNotificationPreferences,
    saveNotificationPreferences,
    sendTestNotification,
    isSaving
  } = useAppointmentNotifications(appointmentId);
  
  useEffect(() => {
    if (isOpen && appointmentId) {
      // Load existing preferences when dialog opens
      const loadPreferences = async () => {
        const prefs = await getNotificationPreferences(appointmentId);
        if (prefs) {
          setNotificationType(prefs.type);
          setReminderTime(prefs.reminderTime);
          if (prefs.phoneNumber) {
            setPhoneNumber(prefs.phoneNumber);
          }
        }
      };
      
      loadPreferences();
    }
  }, [isOpen, appointmentId, getNotificationPreferences]);
  
  const handleSave = async () => {
    const result = await saveNotificationPreferences(appointmentId, {
      type: notificationType,
      reminderTime,
      phoneNumber: notificationType === "sms" || notificationType === "both" ? phoneNumber : undefined
    });
    
    if (result.success) {
      setIsOpen(false);
    }
  };
  
  const handleTest = async () => {
    await sendTestNotification(notificationType, phoneNumber);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-1">
          <Bell className="h-4 w-4 mr-1" />
          Set Reminders
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Notification Preferences</DialogTitle>
          <DialogDescription>
            Choose how you'd like to be reminded about this appointment.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="notification-type">Notification Method</Label>
            <RadioGroup 
              value={notificationType} 
              onValueChange={(value) => setNotificationType(value as NotificationType)}
              className="grid grid-cols-2 gap-2"
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
                <Label htmlFor="both">Both</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="none" />
                <Label htmlFor="none">No reminders</Label>
              </div>
            </RadioGroup>
          </div>
          
          {(notificationType === "sms" || notificationType === "both") && (
            <div className="space-y-2">
              <Label htmlFor="phone-number">Phone Number</Label>
              <Input
                id="phone-number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter your phone number"
              />
              <p className="text-xs text-muted-foreground">
                Standard messaging rates may apply.
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="reminder-time">Reminder Time</Label>
            <Select 
              value={reminderTime.toString()} 
              onValueChange={(value) => setReminderTime(parseInt(value))}
            >
              <SelectTrigger id="reminder-time">
                <SelectValue placeholder="Select reminder time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 hour before</SelectItem>
                <SelectItem value="2">2 hours before</SelectItem>
                <SelectItem value="4">4 hours before</SelectItem>
                <SelectItem value="24">1 day before</SelectItem>
                <SelectItem value="48">2 days before</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:justify-between mt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleTest}
            disabled={
              isSaving || 
              notificationType === "none" || 
              ((notificationType === "sms" || notificationType === "both") && !phoneNumber)
            }
          >
            Test Notification
          </Button>
          <div className="flex gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving || ((notificationType === "sms" || notificationType === "both") && !phoneNumber)}
            >
              {isSaving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                  <span className="ml-2">Saving...</span>
                </>
              ) : (
                "Save Preferences"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
