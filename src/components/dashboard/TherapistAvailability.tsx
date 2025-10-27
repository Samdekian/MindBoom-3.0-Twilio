
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { Calendar, Clock, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const TherapistAvailability = () => {
  const { user } = useAuthRBAC();
  const [availability, setAvailability] = useState([
    { day: "Monday", start: "09:00", end: "17:00", available: true },
    { day: "Tuesday", start: "09:00", end: "17:00", available: true },
    { day: "Wednesday", start: "09:00", end: "17:00", available: true },
    { day: "Thursday", start: "09:00", end: "17:00", available: true },
    { day: "Friday", start: "09:00", end: "17:00", available: true },
    { day: "Saturday", start: "10:00", end: "14:00", available: false },
    { day: "Sunday", start: "10:00", end: "14:00", available: false },
  ]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Weekly Availability
          </CardTitle>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-1" />
            Add Exception
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {availability.map((slot) => (
            <div
              key={slot.day}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <span className="font-medium w-20">{slot.day}</span>
                {slot.available ? (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-500" />
                    <span className="text-sm">
                      {slot.start} - {slot.end}
                    </span>
                  </div>
                ) : (
                  <Badge variant="secondary">Unavailable</Badge>
                )}
              </div>
              <Button size="sm" variant="ghost">
                Edit
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Set your regular weekly availability. You can add exceptions for holidays or special events.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TherapistAvailability;
