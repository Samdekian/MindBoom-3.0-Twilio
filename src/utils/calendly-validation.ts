
import { z } from "zod";

export type VideoProvider = "zoom" | "google_meet";

export const calendlyUrlSchema = z.object({
  calendlyUrl: z
    .string()
    .url("Please enter a valid URL")
    .min(1, "Calendly URL is required")
    .refine(
      (url) => {
        const calendlyRegex = /^https:\/\/([\w-]+\.)?calendly\.com\/[\w-]+/;
        return calendlyRegex.test(url);
      }, 
      { message: "Must be a valid Calendly profile URL" }
    ),
  enableVideo: z.boolean().default(true),
  videoProvider: z.enum(["zoom", "google_meet"]).default("zoom"),
  calendly_webhook_signing_secret: z.string().optional()
});

export type CalendlyFormData = z.infer<typeof calendlyUrlSchema>;

export const getValidVideoProvider = (provider: string | null | undefined): VideoProvider => {
  if (provider === "zoom" || provider === "google_meet") {
    return provider;
  }
  return "zoom";
};

export const testCalendlyUrl = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url);
    return response.ok;
  } catch (error) {
    return false;
  }
};
