
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Plus, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePatientInquiries } from "@/hooks/usePatientInquiries";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PatientInquiryForm from "@/components/inquiries/PatientInquiryForm";
import { formatDistanceToNow } from "date-fns";

const InquiriesWidget = () => {
  const navigate = useNavigate();
  const { patientInquiries, loadingPatientInquiries } = usePatientInquiries();
  const [showQuickInquiry, setShowQuickInquiry] = useState(false);

  // Calculate inquiry statistics
  const pendingInquiries = patientInquiries.filter(i => i.status === 'pending').length;
  const respondedInquiries = patientInquiries.filter(i => i.status === 'responded').length;
  const totalInquiries = patientInquiries.length;
  const hasUnreadResponses = respondedInquiries > 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-orange-500" />;
      case 'responded': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <MessageSquare className="h-4 w-4 text-blue-500" />;
    }
  };

  const handleQuickInquirySuccess = () => {
    setShowQuickInquiry(false);
  };

  if (loadingPatientInquiries) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <span className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              My Inquiries
            </span>
            {hasUnreadResponses && (
              <Badge variant="destructive" className="text-xs">
                {respondedInquiries} new
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            {totalInquiries === 0 
              ? "Connect with therapists by sending inquiries" 
              : `${totalInquiries} total inquiries sent`
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {totalInquiries === 0 ? (
            <div className="text-center py-4">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-3">
                No inquiries yet. Start by contacting a therapist.
              </p>
              <Button 
                onClick={() => navigate("/book-therapist")}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Find Therapists
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  {pendingInquiries > 0 && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span className="text-orange-600">{pendingInquiries} pending</span>
                    </div>
                  )}
                  {respondedInquiries > 0 && (
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-green-600">{respondedInquiries} responded</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent inquiries preview */}
              <div className="space-y-2">
                {patientInquiries.slice(0, 2).map((inquiry) => (
                  <div key={inquiry.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {getStatusIcon(inquiry.status)}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          Dr. {inquiry.therapist?.full_name || "Therapist"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(inquiry.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {inquiry.status}
                    </Badge>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/patient/inquiries")}
                  className="flex-1"
                >
                  View All
                </Button>
                <Button 
                  onClick={() => setShowQuickInquiry(true)}
                  className="flex-1"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Inquiry
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Quick Inquiry Modal */}
      <Dialog open={showQuickInquiry} onOpenChange={setShowQuickInquiry}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Contact a Therapist</DialogTitle>
            <DialogDescription>
              First, browse and select a therapist to send your inquiry to.
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-8">
            <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Choose a Therapist</h3>
            <p className="text-muted-foreground mb-4">
              Browse our therapist directory to find the right fit for you.
            </p>
            <Button onClick={() => {
              setShowQuickInquiry(false);
              navigate("/book-therapist");
            }}>
              Browse Therapists
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InquiriesWidget;
