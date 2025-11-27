import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  Video, 
  CheckCircle2, 
  XCircle,
  Eye,
  EyeOff
} from "lucide-react";
import { usePatientSessionHistory, usePatientSessionNotes } from "@/hooks/use-patient-session-history";
import { format, formatDistanceToNow } from "date-fns";

const PatientHistoryPage = () => {
  const { data: sessionHistory, isLoading: historyLoading } = usePatientSessionHistory();
  const { data: sessionNotes, isLoading: notesLoading } = usePatientSessionNotes();
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "no_show": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "cancelled": return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="h-4 w-4" />;
      case "phone": return <Calendar className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  if (historyLoading || notesLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-10 bg-muted rounded w-full"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Session History</h1>
        <p className="text-muted-foreground">Your therapy journey and session records</p>
      </div>

      <Tabs defaultValue="sessions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="space-y-4">
          {sessionHistory && sessionHistory.length > 0 ? (
            <div className="space-y-4">
              {sessionHistory.map((session) => (
                <Card key={session.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {getSessionTypeIcon(session.appointment_type)}
                          <h3 className="font-semibold">{session.title}</h3>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(session.start_time), "MMM dd, yyyy")}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {format(new Date(session.start_time), "h:mm a")} - {format(new Date(session.end_time), "h:mm a")}
                          </div>
                          {session.duration && (
                            <span>{session.duration} minutes</span>
                          )}
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {session.therapist_name}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(session.status)}>
                          {getStatusIcon(session.status)}
                          {session.status}
                        </Badge>
                        {session.session_notes && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedSession(
                              expandedSession === session.id ? null : session.id
                            )}
                          >
                            {expandedSession === session.id ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(session.start_time), { addSuffix: true })}
                    </div>
                    
                    {expandedSession === session.id && session.session_notes && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="font-medium mb-2">Session Notes</h4>
                        <div className="bg-muted p-3 rounded text-sm">
                          {session.session_notes}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Sessions Yet</h3>
                <p className="text-muted-foreground">
                  Your completed therapy sessions will appear here
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          {sessionNotes && sessionNotes.length > 0 ? (
            <div className="space-y-4">
              {sessionNotes.map((note) => (
                <Card key={note.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          {note.title}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                          <span>By: {note.therapist_name}</span>
                          <span>{format(new Date(note.created_at), "MMM dd, yyyy")}</span>
                          <Badge variant="outline">{note.note_type}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      <p>{note.content}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Notes Available</h3>
                <p className="text-muted-foreground">
                  Session notes and therapy documents will appear here when available
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientHistoryPage;