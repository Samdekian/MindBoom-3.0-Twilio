
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Video, 
  FileText, 
  Calendar, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Users,
  ExternalLink
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { getSessionUrl, getSessionStatus, canJoinSession } from "@/utils/session-navigation";

interface SessionWorkflowProps {
  appointment: {
    id: string;
    title: string;
    start_time: string;
    end_time: string;
    status: string;
    session_notes?: string;
    patient?: {
      full_name: string;
    };
  };
  isTherapist: boolean;
}

const SessionWorkflow: React.FC<SessionWorkflowProps> = ({ 
  appointment, 
  isTherapist 
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const sessionStatus = getSessionStatus(appointment.start_time, appointment.end_time);
  const canJoin = canJoinSession(appointment.start_time, appointment.end_time);

  const getPhaseIcon = () => {
    switch (sessionStatus) {
      case "scheduled": 
      case "soon": return <Clock className="h-4 w-4" />;
      case "ready":
      case "active": return <Video className="h-4 w-4" />;
      case "ended": return <CheckCircle className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getPhaseBadge = () => {
    switch (sessionStatus) {
      case "scheduled": return <Badge variant="outline">Scheduled</Badge>;
      case "soon": return <Badge className="bg-yellow-100 text-yellow-800">Starting Soon</Badge>;
      case "ready": return <Badge className="bg-green-100 text-green-800">Ready to Join</Badge>;
      case "active": return <Badge className="bg-orange-100 text-orange-800">In Progress</Badge>;
      case "ended": return <Badge variant="secondary">Completed</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handleJoinSession = () => {
    navigate(getSessionUrl(appointment.id));
  };

  const handleViewNotes = () => {
    // For now, navigate to session page with notes focus
    navigate(`${getSessionUrl(appointment.id)}?tab=notes`);
  };

  const hasNotes = appointment.session_notes && appointment.session_notes.trim().length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {getPhaseIcon()}
            Session Access
          </CardTitle>
          {getPhaseBadge()}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="session">Join</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Session Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>{format(new Date(appointment.start_time), "EEEE, MMMM d, yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>
                      {format(new Date(appointment.start_time), "h:mm a")} - 
                      {format(new Date(appointment.end_time), "h:mm a")}
                    </span>
                  </div>
                  {appointment.patient && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>{appointment.patient.full_name}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Session Status</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      sessionStatus === "active" ? "bg-orange-500" : 
                      sessionStatus === "ready" ? "bg-green-500" :
                      sessionStatus === "ended" ? "bg-blue-500" : "bg-gray-400"
                    }`} />
                    <span className="text-sm capitalize">{sessionStatus}</span>
                  </div>
                  {sessionStatus === "scheduled" && (
                    <p className="text-xs text-gray-500">
                      Session available 15 minutes before start time
                    </p>
                  )}
                  {sessionStatus === "soon" && (
                    <p className="text-xs text-yellow-600">
                      Session will be available shortly
                    </p>
                  )}
                  {sessionStatus === "ready" && (
                    <p className="text-xs text-green-600">
                      Ready to join now
                    </p>
                  )}
                  {sessionStatus === "active" && (
                    <p className="text-xs text-orange-600">
                      Session is currently active
                    </p>
                  )}
                  {sessionStatus === "ended" && (
                    <p className="text-xs text-blue-600">
                      Session completed
                    </p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="session" className="space-y-4">
            <div className="text-center py-6">
              <Video className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <h3 className="text-lg font-medium mb-2">Video Session</h3>
              
              {canJoin ? (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    {sessionStatus === "ready" 
                      ? "Session is ready to join" 
                      : sessionStatus === "active"
                      ? "Session is currently in progress"
                      : "You can join the session now"}
                  </p>
                  <Button onClick={handleJoinSession} className="mb-2">
                    <Video className="h-4 w-4 mr-2" />
                    Join Session
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    {sessionStatus === "ended" 
                      ? "Session has ended. You can review notes and materials."
                      : "Session will be available 15 minutes before the scheduled time."}
                  </p>
                  <Button variant="outline" disabled>
                    <Video className="h-4 w-4 mr-2" />
                    {sessionStatus === "ended" ? "Session Ended" : "Not Available"}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <div className="text-center py-6">
              <FileText className="h-12 w-12 mx-auto mb-4 text-orange-600" />
              <h3 className="text-lg font-medium mb-2">Session Notes</h3>
              
              {hasNotes ? (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Session notes are available for review
                  </p>
                  <Button onClick={handleViewNotes} variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    View Notes
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    {sessionStatus === "ended" 
                      ? "No session notes have been added yet" 
                      : "Notes will be available after the session"}
                  </p>
                  <Button 
                    onClick={handleViewNotes} 
                    variant="outline"
                    disabled={!isTherapist}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {sessionStatus === "ended" ? "Add Notes" : "View Notes"}
                  </Button>
                </div>
              )}
              
              {!isTherapist && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center gap-2 text-amber-700">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-xs">Only therapists can edit session notes</span>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SessionWorkflow;
