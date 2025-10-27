
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SessionNoteHistory from "./SessionNoteHistory";

interface PatientInfo {
  full_name: string;
}

interface SessionSidebarProps {
  isTherapist: boolean;
  patientInfo: PatientInfo | null;
  patientId: string;
}

const SessionSidebar: React.FC<SessionSidebarProps> = ({
  isTherapist,
  patientInfo,
  patientId,
}) => {
  return (
    <div className="space-y-6">
      {isTherapist && patientInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Name:</span> {patientInfo.full_name}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {isTherapist && (
        <Tabs defaultValue="notes">
          <TabsList className="w-full">
            <TabsTrigger value="notes" className="flex-1">Notes History</TabsTrigger>
            <TabsTrigger value="calendar" className="flex-1">Calendar</TabsTrigger>
          </TabsList>
          <TabsContent value="notes" className="pt-4">
            <SessionNoteHistory patientId={patientId} />
          </TabsContent>
          <TabsContent value="calendar" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Calendar integration shows upcoming appointments here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default SessionSidebar;
