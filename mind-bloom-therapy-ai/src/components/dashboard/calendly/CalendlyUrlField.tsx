
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { testCalendlyUrl } from "@/utils/calendly-validation";
import { UseFormReturn } from "react-hook-form";
import { CalendlyFormData } from "@/utils/calendly-validation";

interface CalendlyUrlFieldProps {
  form: UseFormReturn<CalendlyFormData>;
}

export const CalendlyUrlField = ({ form }: CalendlyUrlFieldProps) => {
  const { toast } = useToast();

  const handleTestUrl = async (url: string) => {
    const isValid = await testCalendlyUrl(url);
    if (isValid) {
      toast({
        title: "Success",
        description: "Your Calendly URL is valid and accessible.",
      });
    } else {
      toast({
        title: "Warning",
        description: "This URL might not be accessible to your patients. Please verify it's public.",
        variant: "destructive",
      });
    }
  };

  return (
    <FormField
      control={form.control}
      name="calendlyUrl"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Your Calendly URL</FormLabel>
          <div className="flex gap-2">
            <FormControl>
              <Input 
                placeholder="https://calendly.com/your-profile"
                {...field}
                className="flex-1"
              />
            </FormControl>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleTestUrl(field.value)}
              disabled={!field.value}
            >
              <Link2 className="w-4 h-4 mr-2" />
              Test URL
            </Button>
          </div>
          <FormDescription>
            Enter your public Calendly scheduling page URL
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
