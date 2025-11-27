
import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, ClipboardCheck, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ErrorEvent {
  timestamp: Date;
  type: string;
  message: string;
  location?: string;
  stackTrace?: string;
}

interface ErrorReportingProps {
  errors: ErrorEvent[];
  onReportSubmit?: (report: { errors: ErrorEvent[], feedback: string }) => void;
}

const ErrorReporting: React.FC<ErrorReportingProps> = ({ 
  errors = [], 
  onReportSubmit 
}) => {
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Combine errors with user feedback
      const report = {
        errors,
        feedback,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };
      
      if (onReportSubmit) {
        await onReportSubmit(report);
      } else {
        // Log to console if no submit handler provided
        console.log("Error report:", report);
      }
      
      toast({
        title: "Report Submitted",
        description: "Thank you for helping us improve our system.",
      });
      
      setFeedback("");
    } catch (error) {
      console.error("Error submitting report:", error);
      toast({
        title: "Submission Failed",
        description: "There was a problem submitting your report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const copyReportToClipboard = () => {
    const reportText = JSON.stringify({
      errors,
      userFeedback: feedback,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date()
    }, null, 2);
    
    navigator.clipboard.writeText(reportText).then(() => {
      toast({
        title: "Copied to Clipboard",
        description: "Error report has been copied to your clipboard.",
      });
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-500" />
          Error Reporting
        </CardTitle>
      </CardHeader>
      <CardContent>
        {errors.length > 0 ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Detected Issues</h3>
              <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                {errors.map((error, index) => (
                  <div key={index} className="p-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-sm">{error.type}</span>
                      <span className="text-xs text-muted-foreground">
                        {error.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm mt-1">{error.message}</p>
                    {error.location && (
                      <p className="text-xs text-muted-foreground mt-1">{error.location}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Describe What Happened</h3>
              <Textarea
                placeholder="Please provide any details about what you were doing when the error occurred..."
                className="min-h-28"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Your feedback helps us improve our video conferencing system.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="bg-green-100 text-green-800 rounded-full p-2 mb-3">
              <ClipboardCheck className="h-6 w-6" />
            </div>
            <p className="text-center">No errors detected in your current session.</p>
            <p className="text-sm text-muted-foreground text-center mt-1">
              If you're experiencing issues, please describe them below.
            </p>
            <Textarea
              placeholder="Describe any issues you're experiencing..."
              className="min-h-28 mt-4"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" onClick={copyReportToClipboard}>
          Copy Report
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting || (!errors.length && !feedback.trim())}
          size="sm"
        >
          {isSubmitting ? (
            <>
              <span className="mr-2">Submitting</span>
              <Send className="h-4 w-4 animate-pulse" />
            </>
          ) : (
            <>
              <span className="mr-2">Submit Report</span>
              <Send className="h-4 w-4" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ErrorReporting;
