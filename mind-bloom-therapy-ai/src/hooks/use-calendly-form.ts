
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { calendlyUrlSchema, CalendlyFormData, getValidVideoProvider } from "@/utils/calendly-validation";

interface UseCalendlyFormProps {
  defaultValues?: Partial<CalendlyFormData>;
}

export const useCalendlyForm = ({ defaultValues }: UseCalendlyFormProps = {}) => {
  const form = useForm<CalendlyFormData>({
    resolver: zodResolver(calendlyUrlSchema),
    defaultValues: {
      calendlyUrl: defaultValues?.calendlyUrl || "",
      enableVideo: defaultValues?.enableVideo ?? true,
      videoProvider: getValidVideoProvider(defaultValues?.videoProvider),
    },
  });

  return form;
};
