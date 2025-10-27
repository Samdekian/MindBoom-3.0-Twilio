
import React from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePatientInquiries } from "@/hooks/usePatientInquiries";
import { MessageSquare, Clock, CheckCircle, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const PatientInquiryStatusPage = () => {
  const { patientInquiries, loadingPatientInquiries } = usePatientInquiries();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'destructive';
      case 'in_progress': return 'secondary';
      case 'responded': return 'default';
      case 'resolved': return 'default';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'responded': return <CheckCircle className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  if (loadingPatientInquiries) {
    return (
      <div className="container mx-auto p-6">
        <Helmet>
          <title>My Inquiries | Therapy Platform</title>
        </Helmet>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Helmet>
        <title>My Inquiries | Therapy Platform</title>
      </Helmet>
      
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">My Therapist Inquiries</h1>
      </div>

      {patientInquiries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Inquiries Yet</h3>
            <p className="text-muted-foreground text-center max-w-md">
              You haven't sent any inquiries to therapists yet. Browse our therapist directory to find and contact a therapist.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {patientInquiries.map((inquiry) => (
            <Card key={inquiry.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        Dr. {inquiry.therapist?.full_name || "Therapist"}
                      </CardTitle>
                      <CardDescription>
                        Sent {formatDistanceToNow(new Date(inquiry.created_at), { addSuffix: true })}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={getStatusColor(inquiry.status)} className="flex items-center gap-1">
                    {getStatusIcon(inquiry.status)}
                    {inquiry.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-1">{inquiry.subject}</h4>
                  <p className="text-sm text-muted-foreground">{inquiry.message}</p>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <Badge variant="outline" className="text-xs">
                    {inquiry.inquiry_type.replace('_', ' ')}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Priority: {inquiry.priority}
                  </Badge>
                </div>

                {inquiry.status === 'responded' && inquiry.response_message && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-green-800 mb-1">Therapist Response:</p>
                    <p className="text-sm text-green-700">{inquiry.response_message}</p>
                    {inquiry.responded_at && (
                      <p className="text-xs text-green-600 mt-2">
                        Responded {formatDistanceToNow(new Date(inquiry.responded_at), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientInquiryStatusPage;
