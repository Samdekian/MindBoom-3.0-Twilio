
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share, Check, Mail } from "lucide-react";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent
} from "@/components/ui/card";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

interface ShareButtonProps {
  appointmentId: string;
  appointmentDetails: {
    title: string;
    start_time: string;
    end_time: string;
  };
}

export const ShareButton: React.FC<ShareButtonProps> = ({ appointmentId, appointmentDetails }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const appointmentDate = format(new Date(appointmentDetails.start_time), "MMMM d, yyyy");
  const startTime = format(new Date(appointmentDetails.start_time), "h:mm a");
  const endTime = format(new Date(appointmentDetails.end_time), "h:mm a");

  const shareText = `I have a therapy session "${appointmentDetails.title}" on ${appointmentDate} from ${startTime} to ${endTime}.`;
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareText).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      
      toast({
        title: "Copied to clipboard",
        description: "Appointment details copied to clipboard",
      });
    });
  };
  
  const shareByEmail = () => {
    const subject = encodeURIComponent(`Therapy Appointment: ${appointmentDetails.title}`);
    const body = encodeURIComponent(shareText);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setIsPopoverOpen(false);
  };
  
  // Share via calendar invite (ICS file)
  const addToCalendar = () => {
    // This would typically generate and download an .ics file
    // For now, we'll just show a toast notification
    toast({
      title: "Calendar feature",
      description: "Add to calendar feature will be available soon",
    });
    setIsPopoverOpen(false);
  };

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-1 text-sm"
        >
          <Share className="h-4 w-4 mr-1" />
          Share Appointment
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="center">
        <div className="space-y-4">
          <h4 className="font-medium">Share your appointment</h4>
          <Card className="overflow-hidden">
            <CardContent className="p-3">
              <p className="text-sm">{shareText}</p>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={copyToClipboard}
            >
              {isCopied ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Copied
                </>
              ) : (
                "Copy to clipboard"
              )}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={shareByEmail}
            >
              <Mail className="h-4 w-4 mr-1" />
              Email
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
