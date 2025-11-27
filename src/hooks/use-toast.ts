
// Import directly from the ui component implementation
import { 
  useToast as useToastUI, 
  toast as toastUI, 
  ToasterToast 
} from "@/components/ui/use-toast";

import { cva } from "class-variance-authority";

// Re-export everything
export const useToast = useToastUI;
export const toast = toastUI;
export type { ToasterToast };

// Re-export toast component types
export type { ToastProps, ToastActionElement } from "@/components/ui/toast";

// Export toast variants
export const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive:
          "destructive group border-destructive bg-destructive text-destructive-foreground",
        warning: 
          "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400",
        success: 
          "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)
