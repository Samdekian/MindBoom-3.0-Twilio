
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePatientInquiries } from "@/hooks/usePatientInquiries";
import { Users, UserCheck, UserX, Clock, TrendingUp } from "lucide-react";

const PatientRelationshipOverview = () => {
  const { relationships, loadingRelationships } = usePatientInquiries();

  if (loadingRelationships) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  const stats = {
    total: relationships.length,
    active: relationships.filter(r => r.relationship_status === 'active').length,
    inquiry: relationships.filter(r => r.relationship_status === 'inquiry').length,
    consultation: relationships.filter(r => 
      r.relationship_status === 'consultation_scheduled' || 
      r.relationship_status === 'consultation_completed'
    ).length,
    completed: relationships.filter(r => r.relationship_status === 'completed').length,
    terminated: relationships.filter(r => r.relationship_status === 'terminated').length
  };

  const getStatusColor = (status: string) => {
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

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Patient Relationships</h3>
        <p className="text-muted-foreground">Overview of your patient relationships and their current status</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Relationships</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              All patient connections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              Currently in treatment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Inquiries</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.inquiry}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultations</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.consultation}</div>
            <p className="text-xs text-muted-foreground">
              Scheduled or completed
            </p>
          </CardContent>
        </Card>
      </div>

      {relationships.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Relationships</CardTitle>
            <CardDescription>Your most recent patient connections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {relationships.slice(0, 5).map((relationship) => (
                <div key={relationship.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Patient ID: {relationship.patient_id.slice(0, 8)}...</p>
                    <p className="text-sm text-muted-foreground">
                      Started {new Date(relationship.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={getStatusColor(relationship.relationship_status)}>
                    {relationship.relationship_status.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PatientRelationshipOverview;
