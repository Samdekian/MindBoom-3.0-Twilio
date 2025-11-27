
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { CalendlyFormData } from "@/utils/calendly-validation";

interface VideoProviderFieldProps {
  form: UseFormReturn<CalendlyFormData>;
  show: boolean;
}

export const VideoProviderField = ({ form, show }: VideoProviderFieldProps) => {
  if (!show) return null;

  return (
    <FormField
      control={form.control}
      name="videoProvider"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Video Provider</FormLabel>
          <Select 
            onValueChange={field.onChange}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a video provider" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="zoom">Zoom</SelectItem>
              <SelectItem value="google_meet">Google Meet</SelectItem>
            </SelectContent>
          </Select>
          <FormDescription>
            Choose your preferred video conferencing provider
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
