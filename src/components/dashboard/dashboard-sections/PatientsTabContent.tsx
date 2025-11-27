
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTherapistList } from "@/hooks/use-therapist-list";
import { Button } from "@/components/ui/button";
import { UserRound, Calendar, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PatientsTabContent: React.FC = () => {
  const navigate = useNavigate();

  const handleNewAppointment = () => {
    navigate("/book-therapist");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient Management</CardTitle>
        <CardDescription>
          View and manage your patient relationships, treatment plans, and session history.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-primary/5">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Your Patients</CardTitle>
                <UserRound className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Access patient records, treatment progress, and session notes.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                View All Patients
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-primary/5">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Schedule Sessions</CardTitle>
                <Calendar className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Create and manage appointments with your patients.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={handleNewAppointment}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Appointment
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 border-t pt-6">
          <h3 className="font-medium mb-3">Recent Patient Activities</h3>
          <p className="text-sm text-muted-foreground">
            No recent activities to display. Patient activities will appear here as they occur.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientsTabContent;
