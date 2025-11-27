
import React from "react";
import { CardFooter } from "@/components/ui/card";

const BookingFooter: React.FC = () => {
  return (
    <CardFooter className="flex flex-col space-y-2 items-start text-xs text-muted-foreground">
      <p>• Appointments can be rescheduled or canceled up to 24 hours before the scheduled time.</p>
      <p>• Timezone is automatically set to your local time.</p>
      <p>• Video session details will be sent to your email.</p>
    </CardFooter>
  );
};

export default BookingFooter;
