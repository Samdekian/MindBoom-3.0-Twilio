
import * as React from "react";
import { ToastActionElement, ToastProps } from "./toast";

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

const TOAST_LIMIT = 20;
const TOAST_REMOVE_DELAY = 1000000;

// Create a static array to store toasts
const toastsStore: ToasterToast[] = [];

// Create a unique ID for each toast
const generateId = () => Math.random().toString(36).substring(2, 9);

export function toast({
  title,
  description,
  action,
  ...props
}: Omit<ToasterToast, "id">) {
  const id = generateId();
  
  const newToast = {
    id,
    title,
    description,
    action,
    ...props,
  };

  // Update the store
  toastsStore.push(newToast);
  if (toastsStore.length > TOAST_LIMIT) {
    toastsStore.shift();
  }

  return newToast;
}

// Create context to store the toast state
export const ToastContext = React.createContext<{
  toasts: ToasterToast[];
  toast: typeof toast;
  dismiss: (toastId?: string) => void;
}>({
  toasts: [],
  toast,
  dismiss: () => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToasterToast[]>([]);
  
  // Sync with toastsStore when it changes
  React.useEffect(() => {
    // Initial sync once
    setToasts([...toastsStore]);
    
    // Set up interval for checking changes
    const interval = setInterval(() => {
      // Compare stringified arrays to avoid unnecessary state updates
      if (toastsStore.length > 0 || toasts.length > 0) {
        const currentStoreString = JSON.stringify(toastsStore);
        const currentStateString = JSON.stringify(toasts);
        
        if (currentStoreString !== currentStateString) {
          setToasts(JSON.parse(currentStoreString));
        }
      }
    }, 1000); // Increased interval to reduce CPU usage
    
    return () => clearInterval(interval);
  }, []); // Empty dependency array - only run on mount
  
  const dismiss = React.useCallback((toastId?: string) => {
    if (toastId) {
      const index = toastsStore.findIndex(t => t.id === toastId);
      if (index !== -1) {
        toastsStore.splice(index, 1);
        setToasts([...toastsStore]);
      }
    }
  }, []);
  
  return React.createElement(
    ToastContext.Provider,
    { value: { toasts, toast, dismiss } },
    children
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  
  if (context === undefined) {
    // Use a fallback if outside provider
    return {
      toasts: toastsStore,
      toast,
      dismiss: (toastId?: string) => {
        if (toastId) {
          const index = toastsStore.findIndex(t => t.id === toastId);
          if (index !== -1) {
            toastsStore.splice(index, 1);
          }
        }
      }
    };
  }
  
  return context;
}

export type { ToasterToast };
