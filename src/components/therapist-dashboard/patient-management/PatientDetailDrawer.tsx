import React, { useState } from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter,
  SheetClose 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Calendar, Clock, FileText, BarChart2, ListCheck } from "lucide-react";
import { format } from "date-fns";
import { usePatientDetail } from "@/hooks/use-patient-detail";
import PatientAppointmentsList from "./PatientAppointmentsList";
import PatientNotesList from "./PatientNotesList";
import { useNavigate } from "react-router-dom";
import { SessionNote } from '@/types/session/note';
import { PatientData } from '@/types/video-conference/types';

interface PatientDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: PatientData | null;
}

const PatientDetailDrawer: React.FC<PatientDetailDrawerProps> = ({
  open,
  onOpenChange,
  patient
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  const { sessions, notes, treatmentPlan, isLoading } = usePatientDetail(patient?.id || "");
  const navigate = useNavigate();
  
  if (!patient) return null;

  // No need to convert notes since they're already SessionNote type

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-2xl">{patient.fullName}</SheetTitle>
          <SheetDescription>{patient.email}</SheetDescription>
        </SheetHeader>
        
        <div className="mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="treatment">Treatment</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Patient Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isLoading ? (
                      <div className="space-y-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="h-6 bg-muted animate-pulse rounded" />
                        ))}
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Total Sessions</p>
                            <p className="text-2xl font-semibold">{sessions.length}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Last Session</p>
                            <p className="text-lg">
                              {patient.lastSessionDate ? (
                                format(new Date(patient.lastSessionDate), "MMM d, yyyy")
                              ) : (
                                "No sessions yet"
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Mood Trend</p>
                            <p className="text-lg capitalize">{patient.moodTrend}</p>
                          </div>
                        </div>
                        
                        <div className="border-t pt-4">
                          <p className="text-sm text-muted-foreground">Next Session</p>
                          {patient.upcomingSessionDate ? (
                            <div className="flex items-center gap-2 mt-1">
                              <Calendar className="h-4 w-4 text-primary" />
                              <span>{format(new Date(patient.upcomingSessionDate), "EEEE, MMMM d, yyyy")}</span>
                              <Clock className="h-4 w-4 ml-2 text-primary" />
                              <span>{format(new Date(patient.upcomingSessionDate), "h:mm a")}</span>
                            </div>
                          ) : (
                            <Button variant="outline" size="sm" className="mt-1">
                              <Calendar className="h-4 w-4 mr-2" />
                              Schedule Session
                            </Button>
                          )}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">Recent Notes</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="space-y-2">
                          {Array.from({ length: 2 }).map((_, i) => (
                            <div key={i} className="h-4 bg-muted animate-pulse rounded" />
                          ))}
                        </div>
                      ) : notes.length > 0 ? (
                        <p className="text-sm line-clamp-3">
                          {notes[0].content}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">No notes available</p>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full text-xs"
                        onClick={() => setActiveTab("notes")}
                      >
                        View All Notes
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">Treatment Plan</CardTitle>
                        <ListCheck className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="space-y-2">
                          {Array.from({ length: 2 }).map((_, i) => (
                            <div key={i} className="h-4 bg-muted animate-pulse rounded" />
                          ))}
                        </div>
                      ) : patient.activeTreatmentPlan ? (
                        <p className="text-sm">
                          {treatmentPlan?.goals.length || 0} active goals
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">No treatment plan</p>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full text-xs"
                        onClick={() => setActiveTab("treatment")}
                      >
                        {patient.activeTreatmentPlan ? "View Plan" : "Create Plan"}
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="sessions">
              <Card>
                <CardHeader>
                  <CardTitle>Session History</CardTitle>
                  <CardDescription>
                    Previous and upcoming therapy sessions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PatientAppointmentsList
                    patientId={patient.id}
                    isLoading={isLoading}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notes">
              <Card>
                <CardHeader>
                  <CardTitle>Session Notes</CardTitle>
                  <CardDescription>
                    Therapy notes and observations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PatientNotesList
                    patientId={patient.id}
                    isLoading={isLoading}
                    notes={notes}
                  />
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => navigate(`/patient/${patient.id}/notes`)}
                    className="w-full"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Manage All Notes
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="treatment">
              <Card>
                <CardHeader>
                  <CardTitle>Treatment Plan</CardTitle>
                  <CardDescription>
                    Goals, milestones, and progress tracking
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                      ))}
                    </div>
                  ) : patient.activeTreatmentPlan && treatmentPlan ? (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Treatment Plan: {treatmentPlan.title}</h4>
                        <div className="space-y-3">
                          {treatmentPlan.goals.map((goal) => (
                            <Card key={goal.id}>
                              <CardContent className="p-3">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium">{goal.description}</p>
                                    <p className="text-xs text-muted-foreground">
                                      Status: <span className="capitalize">{goal.status}</span>
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-sm font-semibold">{goal.progress}%</span>
                                    {goal.targetDate && (
                                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(goal.targetDate).toLocaleDateString()}
                                      </div>
                                    )}
                                    <div className="mt-2 bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                                      <div 
                                        className="bg-primary h-1.5 rounded-full" 
                                        style={{ width: `${goal.progress ?? 0}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                      
                      <Button 
                        onClick={() => navigate(`/patient/${patient.id}/treatment-plan`)}
                        className="w-full"
                      >
                        <ListCheck className="h-4 w-4 mr-2" />
                        View Full Treatment Plan
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <ListCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">No Treatment Plan</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Create a treatment plan to set goals and track progress.
                      </p>
                      <Button onClick={() => navigate(`/patient/${patient.id}/treatment-plan/new`)}>
                        Create Treatment Plan
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <SheetFooter className="mt-6">
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default PatientDetailDrawer;
