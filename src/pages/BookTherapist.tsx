
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EnhancedTherapistDirectory } from "@/components/booking/EnhancedTherapistDirectory";
import ScheduleAppointmentModal from "@/components/booking/ScheduleAppointmentModal";

const BookTherapist = () => {
  const [showBookingModal, setShowBookingModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Book Initial Consultation</h1>
          <p className="text-gray-600 mt-2">Find and book your first session with qualified therapists</p>
        </div>
        <Button 
          onClick={() => setShowBookingModal(true)}
          size="lg"
          className="bg-primary hover:bg-primary/90"
        >
          Quick Book Consultation
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Available Therapists</CardTitle>
          <CardDescription>
            Browse therapist profiles and schedule your initial consultation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EnhancedTherapistDirectory />
        </CardContent>
      </Card>

      <ScheduleAppointmentModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
      />
    </div>
  );
};

export default BookTherapist;
