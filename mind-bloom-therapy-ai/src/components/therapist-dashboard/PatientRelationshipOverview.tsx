
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { usePatientInquiries } from "@/hooks/usePatientInquiries";
import { Users, TrendingUp, Calendar, MessageSquare, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PatientRelationshipOverview = () => {
  const { relationships } = usePatientInquiries();
  const navigate = useNavigate();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "inquiry":
        return <Badge variant="outline" className="text-blue-600 border-blue-300">Inquiry</Badge>;
      case "consultation_scheduled":
        return <Badge variant="outline" className="text-purple-600 border-purple-300">Consultation</Badge>;
      case "active":
        return <Badge variant="default" className="bg-green-600">Active Therapy</Badge>;
      case "on_hold":
        return <Badge variant="secondary">On Hold</Badge>;
      case "terminated":
        return <Badge variant="outline" className="text-gray-600">Terminated</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusProgress = (status: string) => {
    switch (status) {
      case "inquiry": return 25;
      case "consultation_scheduled": return 50;
      case "active": return 100;
      case "on_hold": return 75;
      case "terminated": return 0;
      default: return 0;
    }
  };

  const statusCounts = relationships.reduce((acc, rel) => {
    acc[rel.relationship_status] = (acc[rel.relationship_status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalRelationships = relationships.length;
  const activeTherapy = statusCounts.active || 0;
  const pendingConsultations = statusCounts.consultation_scheduled || 0;
  const newInquiries = statusCounts.inquiry || 0;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{totalRelationships}</p>
                <p className="text-sm text-gray-600">Total Patients</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{activeTherapy}</p>
                <p className="text-sm text-gray-600">Active Therapy</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{pendingConsultations}</p>
                <p className="text-sm text-gray-600">Consultations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{newInquiries}</p>
                <p className="text-sm text-gray-600">New Inquiries</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patient Relationships List */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Relationships</CardTitle>
          <CardDescription>
            Overview of all patient relationships and their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {relationships.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No patient relationships yet.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => navigate('/therapist/inquiries')}
              >
                View Inquiries
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {relationships.slice(0, 10).map((relationship) => (
                <div key={relationship.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Patient ID: {relationship.patient_id.slice(0, 8)}...</p>
                        <p className="text-sm text-gray-600">
                          Started: {new Date(relationship.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(relationship.relationship_status)}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Relationship Progress</span>
                      <span>{getStatusProgress(relationship.relationship_status)}%</span>
                    </div>
                    <Progress value={getStatusProgress(relationship.relationship_status)} className="h-2" />
                  </div>
                  
                  {relationship.relationship_notes && (
                    <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                      <p className="text-gray-600">{relationship.relationship_notes}</p>
                    </div>
                  )}
                  
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                    {relationship.relationship_status === 'inquiry' && (
                      <Button 
                        size="sm"
                        onClick={() => navigate('/therapist/inquiries')}
                      >
                        Respond to Inquiry
                      </Button>
                    )}
                    {relationship.relationship_status === 'consultation_scheduled' && (
                      <Button 
                        size="sm"
                        onClick={() => navigate('/calendar')}
                      >
                        Schedule Session
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              {relationships.length > 10 && (
                <div className="text-center pt-4">
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/therapist/patients')}
                  >
                    View All Patients ({relationships.length})
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientRelationshipOverview;
