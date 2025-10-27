
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAppointments } from "@/hooks/use-appointments";
import { format } from "date-fns";
import { formatInUserTimeZone } from "@/utils/timezone";
import { Textarea } from "@/components/ui/textarea";
import RecurrenceSelector from "./RecurrenceSelector";
import { useAppointmentConflicts } from "@/hooks/appointment/use-appointment-conflicts";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useAppointmentRecurrence } from "@/hooks/use-appointment-recurrence";

interface AppointmentFormProps {
  startTime: Date;
  onSuccess: () => void;
  onCancel: () => void;
  timeZone?: string;
  appointment?: any; // Existing appointment for editing mode
  isEditing?: boolean;
}

interface FormValues {
  title: string;
  description: string;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ 
  startTime, 
  onSuccess, 
  onCancel, 
  timeZone,
  appointment,
  isEditing = false
}) => {
  const { createAppointment, updateAppointment } = useAppointments();
  const { user } = useAuthRBAC();
  const { toast } = useToast();
  const [recurrence, setRecurrence] = useState<{ rule: string | null; endDate: Date | null }>({ 
    rule: null, 
    endDate: null 
  });
  const { createRecurringAppointments } = useAppointmentRecurrence();

  // Set default form values based on whether we're editing or creating
  const defaultValues = isEditing && appointment 
    ? {
        title: appointment.title,
        description: appointment.description || "",
      }
    : {
        title: "",
        description: "",
      };

  const form = useForm<FormValues>({
    defaultValues,
  });

  // Check for conflicts
  const therapistId = appointment?.therapist_id || ""; // For editing mode
  const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour duration
  
  const { conflicts, isLoading: loadingConflicts } = useAppointmentConflicts(
    startTime.toISOString(),
    endTime.toISOString(),
    therapistId || (user?.id || ""),
    isEditing ? appointment?.id : undefined
  );

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEditing && appointment) {
        // Update existing appointment
        const appointmentData = {
          ...appointment,
          title: values.title,
          description: values.description,
          updated_at: new Date().toISOString(),
        };

        await updateAppointment.mutateAsync(appointmentData);
        
        toast({
          title: "Success",
          description: "Appointment updated successfully",
        });
      } else {
        // Create new appointment - use the correct status type
        const result = await createAppointment.mutateAsync({
          title: values.title,
          description: values.description,
          start_time: startTime.toISOString(),
          end_time: new Date(startTime.getTime() + 60 * 60 * 1000).toISOString(),
          status: "scheduled" as const,
          patient_id: user?.id || "",
          therapist_id: user?.id || "",
          video_enabled: false,
        });
        
        // If this is a recurring appointment, create the series
        if (recurrence.rule && recurrence.endDate && result && typeof result === 'object' && 'id' in result) {
          const appointmentId = (result as any).id;
          
          await createRecurringAppointments(
            appointmentId,
            recurrence.rule,
            recurrence.endDate
          );

          toast({
            title: "Success",
            description: "Recurring appointments created successfully",
          });
        } else {
          toast({
            title: "Success",
            description: "Appointment created successfully",
          });
        }
      }
      
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save appointment",
        variant: "destructive",
      });
      console.error(error);
    }
  };

  const displayTime = timeZone 
    ? formatInUserTimeZone(startTime, 'PPp', timeZone)
    : format(startTime, 'PPp');

  const handleRecurrenceChange = (newRecurrence: { rule: string | null; endDate: Date | null }) => {
    setRecurrence(newRecurrence);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter appointment title" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Enter appointment description" 
                  className="min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="text-sm text-muted-foreground mb-4">
          Start Time: {displayTime}
          {timeZone && (
            <div className="text-xs mt-1">
              Timezone: {timeZone}
            </div>
          )}
        </div>
        
        {conflicts && conflicts.length > 0 && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Potential Calendar Conflicts</AlertTitle>
            <AlertDescription>
              This appointment time conflicts with {conflicts.length} existing {conflicts.length === 1 ? 'event' : 'events'}.
            </AlertDescription>
          </Alert>
        )}

        {!isEditing && (
          <div className="mb-4">
            <h3 className="font-medium mb-2">Recurrence</h3>
            <RecurrenceSelector onRecurrenceChange={handleRecurrenceChange} />
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {isEditing ? "Update Appointment" : "Create Appointment"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AppointmentForm;
