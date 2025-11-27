
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, Eye, Clock, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TherapistApproval: React.FC = () => {
  const { toast } = useToast();
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);

  // Mock therapist applications
  const pendingApplications = [
    {
      id: "1",
      name: "Dr. Sarah Johnson",
      email: "sarah.johnson@email.com",
      license: "LIC123456",
      specialization: "Cognitive Behavioral Therapy",
      experience: "8 years",
      submitted: "2024-01-15",
      status: "pending"
    },
    {
      id: "2",
      name: "Dr. Michael Chen",
      email: "michael.chen@email.com",
      license: "LIC789012",
      specialization: "Family Therapy",
      experience: "12 years",
      submitted: "2024-01-14",
      status: "pending"
    }
  ];

  const approvedApplications = [
    {
      id: "3",
      name: "Dr. Emily Davis",
      email: "emily.davis@email.com",
      license: "LIC345678",
      specialization: "Trauma Therapy",
      experience: "6 years",
      submitted: "2024-01-10",
      status: "approved",
      approvedBy: "Admin User",
      approvedDate: "2024-01-12"
    }
  ];

  const handleApprove = (applicationId: string) => {
    toast({
      title: "Application Approved",
      description: "Therapist application has been approved successfully."
    });
  };

  const handleReject = (applicationId: string) => {
    toast({
      title: "Application Rejected",
      description: "Therapist application has been rejected.",
      variant: "destructive"
    });
  };

  const ApplicationCard = ({ application, showActions = true }: { application: any, showActions?: boolean }) => (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {application.name}
            </CardTitle>
            <CardDescription>{application.email}</CardDescription>
          </div>
          <Badge variant={application.status === 'approved' ? 'default' : 'secondary'}>
            {application.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm font-medium">License Number</p>
            <p className="text-sm text-gray-600">{application.license}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Specialization</p>
            <p className="text-sm text-gray-600">{application.specialization}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Experience</p>
            <p className="text-sm text-gray-600">{application.experience}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Submitted</p>
            <p className="text-sm text-gray-600">{application.submitted}</p>
          </div>
        </div>

        {application.status === 'approved' && (
          <div className="mb-4 p-3 bg-green-50 rounded-lg">
            <p className="text-sm font-medium text-green-800">
              Approved by {application.approvedBy} on {application.approvedDate}
            </p>
          </div>
        )}

        {showActions && (
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setSelectedApplication(application.id)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
            <Button 
              size="sm" 
              onClick={() => handleApprove(application.id)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button 
              size="sm" 
              variant="destructive"
              onClick={() => handleReject(application.id)}
            >
              <X className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Clock className="h-8 w-8" />
          Therapist Approval
        </h1>
        <p className="text-gray-600">Review and approve therapist applications</p>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingApplications.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedApplications.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected (0)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <div className="space-y-4">
            {pendingApplications.length > 0 ? (
              pendingApplications.map((application) => (
                <ApplicationCard key={application.id} application={application} />
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Pending Applications</h3>
                  <p className="text-gray-600">All therapist applications have been processed.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="approved">
          <div className="space-y-4">
            {approvedApplications.map((application) => (
              <ApplicationCard key={application.id} application={application} showActions={false} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rejected">
          <Card>
            <CardContent className="text-center py-8">
              <X className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Rejected Applications</h3>
              <p className="text-gray-600">No therapist applications have been rejected.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TherapistApproval;
