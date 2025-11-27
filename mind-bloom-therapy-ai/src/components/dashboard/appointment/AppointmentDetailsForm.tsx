
import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAppointments } from "@/hooks/use-appointments";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { CalendarIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  startTime: z.date(),
  endTime: z.date(),
  notes: z.string().optional(),
  therapistId: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

interface AppointmentDetailsFormProps {
  initialValues: {
    startTime: Date;
    endTime: Date;
    therapistId: string;
  };
  onSuccess: (appointmentId: string) => void;
  onBack: () => void;
  onError: (message: string) => void;
}

const AppointmentDetailsForm: React.FC<AppointmentDetailsFormProps> = ({
  initialValues,
  onSuccess,
  onBack,
  onError
}) => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = React.useState(false);
  const { createAppointment } = useAppointments();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...initialValues,
      notes: "",
    },
  });

  const handleCreateAppointment = async (values: FormValues) => {
    try {
      setSubmitting(true);
      const result = await createAppointment.mutateAsync({
        start_time: values.startTime.toISOString(),
        end_time: values.endTime.toISOString(),
        title: "Appointment", 
        description: values.notes || "",
        status: "scheduled" as const,
        patient_id: "", // This should be set based on context
        therapist_id: values.therapistId,
        video_enabled: true,
        appointment_type: "video"
      });
      
      if (result && typeof result === 'object' && 'id' in result) {
        const appointmentId = (result as any).id;
        onSuccess(appointmentId);
      }
    } catch (error: any) {
      console.error("Error creating appointment:", error);
      onError(error.message || "Failed to create appointment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleCreateAppointment)} className="space-y-6">
        <FormField
          control={form.control}
          name="startTime"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Start Time</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP h:mm a")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date()
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="endTime"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>End Time</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP h:mm a")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date()
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Input placeholder="Appointment notes" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="therapistId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Therapist</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a verified email" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="some-therapist-id">Dr. Therapist</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between">
          <Button variant="secondary" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Create Appointment"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AppointmentDetailsForm;
