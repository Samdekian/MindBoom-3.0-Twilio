
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePatientInquiries } from "@/hooks/usePatientInquiries";
import { MessageSquare, Clock, User, Phone, Mail, Video, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const TherapistInquiryInbox = () => {
  const { 
    therapistInquiries, 
    relationships,
    loadingTherapistInquiries, 
    respondToInquiry, 
    isResponding,
    updateRelationship,
    isUpdatingRelationship
  } = usePatientInquiries();
  
  const [selectedInquiry, setSelectedInquiry] = useState<string | null>(null);
  const [response, setResponse] = useState("");

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'secondary';
      case 'normal': return 'outline';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'destructive';
      case 'in_progress': return 'secondary';
      case 'responded': return 'default';
      case 'resolved': return 'default';
      case 'closed': return 'outline';
      default: return 'outline';
    }
  };

  const getRelationshipColor = (status: string) => {
    switch (status) {
      case 'inquiry': return 'outline';
      case 'consultation_scheduled': return 'secondary';
      case 'consultation_completed': return 'default';
      case 'active': return 'default';
      case 'on_hold': return 'secondary';
      case 'completed': return 'outline';
      case 'terminated': return 'destructive';
      default: return 'outline';
    }
  };

  const getContactIcon = (method: string) => {
    switch (method) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'video_call': return <Video className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const handleRespond = (inquiryId: string) => {
    if (!response.trim()) return;
    
    respondToInquiry({ inquiryId, response });
    setResponse("");
    setSelectedInquiry(null);
  };

  const handleRelationshipUpdate = (relationshipId: string, status: string) => {
    updateRelationship({ relationshipId, status });
  };

  const getRelationshipForInquiry = (inquiry: any) => {
    return relationships.find(rel => 
      rel.patient_id === inquiry.patient_id && 
      rel.therapist_id === inquiry.therapist_id
    );
  };

  if (loadingTherapistInquiries) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Patient Inquiries</h2>
          <p className="text-muted-foreground">Manage and respond to patient inquiries and relationships</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="px-3 py-1">
            {therapistInquiries.filter(i => i.status === 'pending').length} pending
          </Badge>
          <Badge variant="secondary" className="px-3 py-1">
            <Users className="h-3 w-3 mr-1" />
            {relationships.filter(r => r.relationship_status === 'active').length} active
          </Badge>
        </div>
      </div>

      {therapistInquiries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Inquiries Yet</h3>
            <p className="text-muted-foreground text-center max-w-md">
              You haven't received any patient inquiries yet. When patients contact you, they'll appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {therapistInquiries.map((inquiry) => {
            const relationship = getRelationshipForInquiry(inquiry);
            
            return (
              <Card key={inquiry.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={inquiry.patient?.avatar_url} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{inquiry.patient?.full_name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(inquiry.created_at), { addSuffix: true })}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge variant={getPriorityColor(inquiry.priority)}>
                        {inquiry.priority}
                      </Badge>
                      <Badge variant={getStatusColor(inquiry.status)}>
                        {inquiry.status}
                      </Badge>
                      {relationship && (
                        <Badge variant={getRelationshipColor(relationship.relationship_status)}>
                          {relationship.relationship_status.replace('_', ' ')}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-1">{inquiry.subject}</h4>
                    <p className="text-sm text-muted-foreground">{inquiry.message}</p>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      {getContactIcon(inquiry.preferred_contact_method)}
                      <span className="capitalize">{inquiry.preferred_contact_method.replace('_', ' ')}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {inquiry.inquiry_type.replace('_', ' ')}
                    </Badge>
                  </div>

                  {relationship && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-800">Relationship Status</p>
                          <p className="text-sm text-blue-700 capitalize">
                            {relationship.relationship_status.replace('_', ' ')}
                          </p>
                        </div>
                        <Select
                          value={relationship.relationship_status}
                          onValueChange={(value) => handleRelationshipUpdate(relationship.id, value)}
                          disabled={isUpdatingRelationship}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="inquiry">Inquiry</SelectItem>
                            <SelectItem value="consultation_scheduled">Consultation Scheduled</SelectItem>
                            <SelectItem value="consultation_completed">Consultation Completed</SelectItem>
                            <SelectItem value="active">Active Treatment</SelectItem>
                            <SelectItem value="on_hold">On Hold</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="terminated">Terminated</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {relationship.relationship_notes && (
                        <p className="text-sm text-blue-600 mt-2">
                          Notes: {relationship.relationship_notes}
                        </p>
                      )}
                    </div>
                  )}

                  {inquiry.status === 'responded' && inquiry.response_message && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-green-800 mb-1">Your Response:</p>
                      <p className="text-sm text-green-700">{inquiry.response_message}</p>
                    </div>
                  )}

                  {inquiry.status === 'pending' && (
                    <div className="border-t pt-4">
                      {selectedInquiry === inquiry.id ? (
                        <div className="space-y-3">
                          <Textarea
                            value={response}
                            onChange={(e) => setResponse(e.target.value)}
                            placeholder="Type your response to the patient..."
                            rows={4}
                          />
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => handleRespond(inquiry.id)}
                              disabled={isResponding || !response.trim()}
                              size="sm"
                            >
                              {isResponding ? "Sending..." : "Send Response"}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedInquiry(null);
                                setResponse("");
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button 
                          onClick={() => setSelectedInquiry(inquiry.id)}
                          size="sm"
                          className="w-full"
                        >
                          Respond to Inquiry
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TherapistInquiryInbox;
