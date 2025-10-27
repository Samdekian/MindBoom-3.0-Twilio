
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePatientInquiries } from "@/hooks/usePatientInquiries";
import { Clock, MessageSquare, User, AlertTriangle, CheckCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const responseTemplates = [
  {
    id: "initial_response",
    name: "Initial Response",
    content: "Thank you for reaching out. I've received your inquiry and will review it carefully. I typically respond within 24 hours with next steps."
  },
  {
    id: "consultation_invite",
    name: "Consultation Invitation",
    content: "Thank you for your inquiry. I'd like to schedule a brief consultation to discuss your needs and how I can best support you. Please let me know your availability."
  },
  {
    id: "more_info_needed",
    name: "Request More Information",
    content: "Thank you for reaching out. To better understand how I can help, could you provide a bit more detail about your specific concerns or goals?"
  },
  {
    id: "referral",
    name: "Referral",
    content: "Thank you for your inquiry. Based on what you've shared, I believe you might benefit from a specialist in this area. I'd be happy to provide some referral suggestions."
  }
];

const InquiryQueue = () => {
  const { therapistInquiries, respondToInquiry, isResponding } = usePatientInquiries();
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [customResponse, setCustomResponse] = useState("");
  const [selectedInquiry, setSelectedInquiry] = useState<string | null>(null);

  const getResponseTimeColor = (createdAt: string) => {
    const hoursOld = (new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
    if (hoursOld < 4) return "text-green-600";
    if (hoursOld < 12) return "text-yellow-600";
    if (hoursOld < 24) return "text-orange-600";
    return "text-red-600";
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge variant="destructive">Urgent</Badge>;
      case "high":
        return <Badge variant="secondary">High</Badge>;
      case "normal":
        return <Badge variant="outline">Normal</Badge>;
      case "low":
        return <Badge variant="outline" className="text-gray-500">Low</Badge>;
      default:
        return <Badge variant="outline">Normal</Badge>;
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = responseTemplates.find(t => t.id === templateId);
    if (template) {
      setCustomResponse(template.content);
    }
    setSelectedTemplate(templateId);
  };

  const handleQuickResponse = (inquiryId: string, response: string) => {
    respondToInquiry({ inquiryId, response });
    setCustomResponse("");
    setSelectedTemplate("");
    setSelectedInquiry(null);
  };

  const pendingInquiries = therapistInquiries.filter(i => i.status === 'pending');
  const respondedInquiries = therapistInquiries.filter(i => i.status === 'responded');

  return (
    <div className="space-y-6">
      {/* Pending Inquiries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            Pending Inquiries ({pendingInquiries.length})
          </CardTitle>
          <CardDescription>
            Inquiries awaiting your response
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingInquiries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p>All caught up! No pending inquiries.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingInquiries.map((inquiry) => (
                <div key={inquiry.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{inquiry.patient?.full_name}</span>
                        {getPriorityBadge(inquiry.priority)}
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">{inquiry.subject}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">{inquiry.message}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span className={getResponseTimeColor(inquiry.created_at)}>
                            {formatDistanceToNow(new Date(inquiry.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <span>Type: {inquiry.inquiry_type}</span>
                        <span>Contact: {inquiry.preferred_contact_method}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {new Date().getTime() - new Date(inquiry.created_at).getTime() > 24 * 60 * 60 * 1000 && (
                        <div className="flex items-center" aria-label="Overdue (24h+)">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        </div>
                      )}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" onClick={() => setSelectedInquiry(inquiry.id)}>
                            Respond
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Respond to Inquiry</DialogTitle>
                            <DialogDescription>
                              From: {inquiry.patient?.full_name} | Subject: {inquiry.subject}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm font-medium mb-1">Original Message:</p>
                              <p className="text-sm text-gray-700">{inquiry.message}</p>
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium mb-2 block">Quick Templates</label>
                              <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Choose a template..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {responseTemplates.map((template) => (
                                    <SelectItem key={template.id} value={template.id}>
                                      {template.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium mb-2 block">Your Response</label>
                              <Textarea
                                value={customResponse}
                                onChange={(e) => setCustomResponse(e.target.value)}
                                placeholder="Type your response here..."
                                rows={6}
                              />
                            </div>
                            
                            <div className="flex gap-2 pt-4">
                              <Button
                                onClick={() => handleQuickResponse(inquiry.id, customResponse)}
                                disabled={!customResponse.trim() || isResponding}
                                className="flex-1"
                              >
                                {isResponding ? "Sending..." : "Send Response"}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Responses */}
      {respondedInquiries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Recent Responses ({respondedInquiries.length})
            </CardTitle>
            <CardDescription>
              Inquiries you've recently responded to
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {respondedInquiries.slice(0, 5).map((inquiry) => (
                <div key={inquiry.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{inquiry.patient?.full_name}</span>
                      <Badge variant="outline" className="text-green-700 border-green-300">
                        Responded
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{inquiry.subject}</p>
                    {inquiry.responded_at && (
                      <p className="text-xs text-gray-500">
                        Responded {formatDistanceToNow(new Date(inquiry.responded_at), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InquiryQueue;
