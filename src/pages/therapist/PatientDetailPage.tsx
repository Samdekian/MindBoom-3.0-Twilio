
import React from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Calendar, 
  FileText, 
  Phone, 
  Mail, 
  MapPin,
  Clock,
  Heart,
  MessageSquare
} from "lucide-react";
import { useAuthRBAC } from '@/contexts/AuthRBACContext';

const PatientDetailPage = () => {
  const { patientId } = useParams();
  const { user } = useAuthRBAC();

  // Mock patient data - replace with actual data fetching
  const patient = {
    id: patientId,
    name: "Jane Doe",
    email: "jane.doe@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, City, State 12345",
    dateOfBirth: "1985-06-15",
    status: "Active",
    joinDate: "2023-08-15",
    lastSession: "2024-01-10",
    nextSession: "2024-01-20",
    emergencyContact: {
      name: "John Doe",
      relationship: "Spouse",
      phone: "+1 (555) 987-6543"
    },
    conditions: ["Anxiety", "Depression"],
    notes: "Patient has been making good progress with CBT techniques."
  };

  const mockNotes = [
    {
      id: "1",
      title: "Session Notes - Jan 10, 2024",
      content: "Patient showed significant improvement in anxiety management.",
      date: "2024-01-10",
      type: "session"
    }
  ];

  const mockTreatmentPlans = [
    {
      id: "1",
      title: "Anxiety Management Plan",
      status: "active",
      startDate: "2024-01-01",
      progress: 65
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-500';
      case 'Inactive':
        return 'bg-yellow-500';
      case 'Paused':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Helmet>
        <title>{patient.name} - Patient Details | Therapy Platform</title>
      </Helmet>
      
      <div className="space-y-6">
        {/* Patient Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{patient.name}</CardTitle>
                  <CardDescription>Patient ID: {patient.id}</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={`${getStatusColor(patient.status)} text-white`}>
                  {patient.status}
                </Badge>
                <Button>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{patient.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{patient.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Born: {patient.dateOfBirth}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Joined: {patient.joinDate}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patient Details Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="treatment">Treatment Plans</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{patient.address}</span>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Emergency Contact</h4>
                    <div className="text-sm space-y-1">
                      <p>{patient.emergencyContact.name} ({patient.emergencyContact.relationship})</p>
                      <p>{patient.emergencyContact.phone}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Medical Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Medical Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-2">Conditions</h4>
                    <div className="flex flex-wrap gap-2">
                      {patient.conditions.map((condition) => (
                        <Badge key={condition} variant="secondary">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Notes</h4>
                    <p className="text-sm text-muted-foreground">{patient.notes}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Session History Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Last Session</div>
                    <div className="font-medium">{patient.lastSession}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Next Session</div>
                    <div className="font-medium">{patient.nextSession}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions">
            <Card>
              <CardHeader>
                <CardTitle>Session History</CardTitle>
                <CardDescription>All therapy sessions for this patient</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Session history will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes">
            <Card>
              <CardHeader>
                <CardTitle>Patient Notes</CardTitle>
                <CardDescription>Session notes and observations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockNotes.map((note) => (
                    <div key={note.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{note.title}</h4>
                        <span className="text-sm text-muted-foreground">{note.date}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{note.content}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="treatment">
            <Card>
              <CardHeader>
                <CardTitle>Treatment Plans</CardTitle>
                <CardDescription>Active and completed treatment plans</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTreatmentPlans.map((plan) => (
                    <div key={plan.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{plan.title}</h4>
                        <Badge className="bg-green-500 text-white">{plan.status}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        Started: {plan.startDate}
                      </div>
                      <div className="text-sm">
                        Progress: {plan.progress}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PatientDetailPage;
