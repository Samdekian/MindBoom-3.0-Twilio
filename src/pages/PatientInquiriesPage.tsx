import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  MessageCircle, 
  Plus, 
  Clock, 
  AlertCircle, 
  CheckCircle2,
  Eye,
  Calendar
} from "lucide-react";
import { usePatientInquiries, useCreateInquiry, useInquiryResponses } from "@/hooks/use-patient-inquiries";
import { formatDistanceToNow } from "date-fns";

const PatientInquiriesPage = () => {
  const { data: inquiries, isLoading } = usePatientInquiries();
  const createInquiry = useCreateInquiry();
  const [showNewInquiry, setShowNewInquiry] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<string | null>(null);
  const [newInquiry, setNewInquiry] = useState({
    subject: "",
    message: "",
    inquiry_type: "general",
    therapist_id: "",
    priority: "normal"
  });

  const handleCreateInquiry = async () => {
    if (!newInquiry.subject || !newInquiry.message) return;
    
    // For demo purposes, use the first therapist from existing inquiries
    const therapistId = inquiries?.[0]?.therapist_id || "";
    
    await createInquiry.mutateAsync({
      ...newInquiry,
      therapist_id: therapistId
    });
    
    setShowNewInquiry(false);
    setNewInquiry({
      subject: "",
      message: "",
      inquiry_type: "general",
      therapist_id: "",
      priority: "normal"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "responded": return "bg-green-100 text-green-800";
      case "closed": return "bg-gray-100 text-gray-800";
      default: return "bg-blue-100 text-blue-800";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high": return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "medium": return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Inquiries</h1>
          <p className="text-muted-foreground">Communicate with your therapist</p>
        </div>
        <Dialog open={showNewInquiry} onOpenChange={setShowNewInquiry}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Inquiry
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Send New Inquiry</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={newInquiry.subject}
                  onChange={(e) => setNewInquiry({ ...newInquiry, subject: e.target.value })}
                  placeholder="Brief description of your inquiry"
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={newInquiry.inquiry_type} onValueChange={(value) => setNewInquiry({ ...newInquiry, inquiry_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Question</SelectItem>
                    <SelectItem value="appointment">Appointment Related</SelectItem>
                    <SelectItem value="treatment">Treatment Question</SelectItem>
                    <SelectItem value="billing">Billing Question</SelectItem>
                    <SelectItem value="urgent">Urgent Matter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={newInquiry.priority} onValueChange={(value) => setNewInquiry({ ...newInquiry, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={newInquiry.message}
                  onChange={(e) => setNewInquiry({ ...newInquiry, message: e.target.value })}
                  placeholder="Describe your question or concern..."
                  rows={4}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleCreateInquiry} 
                  disabled={!newInquiry.subject || !newInquiry.message || createInquiry.isPending}
                  className="flex-1"
                >
                  {createInquiry.isPending ? "Sending..." : "Send Inquiry"}
                </Button>
                <Button variant="outline" onClick={() => setShowNewInquiry(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Inquiries List */}
      {inquiries && inquiries.length > 0 ? (
        <div className="space-y-4">
          {inquiries.map((inquiry) => (
            <Card key={inquiry.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{inquiry.subject}</h3>
                      {getPriorityIcon(inquiry.priority)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        {inquiry.inquiry_type}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDistanceToNow(new Date(inquiry.created_at), { addSuffix: true })}
                      </div>
                      <span>To: {inquiry.therapist_name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(inquiry.status)}>
                      {inquiry.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedInquiry(selectedInquiry === inquiry.id ? null : inquiry.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {inquiry.message}
                </p>
                {selectedInquiry === inquiry.id && (
                  <InquiryDetails inquiryId={inquiry.id} inquiry={inquiry} />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No inquiries yet</h3>
            <p className="text-muted-foreground mb-4">
              Send your first inquiry to communicate with your therapist
            </p>
            <Button onClick={() => setShowNewInquiry(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Send Your First Inquiry
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const InquiryDetails = ({ inquiryId, inquiry }: { inquiryId: string; inquiry: any }) => {
  const { data: responses } = useInquiryResponses(inquiryId);

  return (
    <div className="mt-4 pt-4 border-t space-y-4">
      <div>
        <h4 className="font-medium mb-2">Full Message</h4>
        <p className="text-sm bg-muted p-3 rounded">{inquiry.message}</p>
      </div>
      
      {responses && responses.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Responses</h4>
          <div className="space-y-3">
            {responses.map((response) => (
              <div key={response.id} className="bg-blue-50 p-3 rounded">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{response.responder_name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(response.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm">{response.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientInquiriesPage;