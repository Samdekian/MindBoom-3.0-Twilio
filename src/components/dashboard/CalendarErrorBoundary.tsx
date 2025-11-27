
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface CalendarErrorBoundaryProps {
  children: React.ReactNode;
}

interface CalendarErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class CalendarErrorBoundary extends React.Component<CalendarErrorBoundaryProps, CalendarErrorBoundaryState> {
  constructor(props: CalendarErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Calendar integration error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || "An unknown error occurred with the calendar integration";
      
      return (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Calendar Integration Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}

export default CalendarErrorBoundary;
