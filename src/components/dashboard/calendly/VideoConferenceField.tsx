
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { UseFormReturn } from "react-hook-form";
import { CalendlyFormData } from "@/utils/calendly-validation";

interface VideoConferenceFieldProps {
  form: UseFormReturn<CalendlyFormData>;
}

export const VideoConferenceField = ({ form }: VideoConferenceFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="enableVideo"
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">
              Enable Video Conferencing
            </FormLabel>
            <FormDescription>
              Automatically create video meetings for appointments
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};
