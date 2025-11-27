
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, ChevronRight, Calendar, FileText, TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePatientManagement } from "@/hooks/use-patient-management";
import { usePatientAssignments } from "@/hooks/use-patient-assignments";
import { format } from "date-fns";

const PatientsListCard = () => {
  const navigate = useNavigate();
  const { patients, isLoading: patientsLoading } = usePatientManagement();
  const { assignments, isLoading: assignmentsLoading, updateAssignmentStatus, updatePriorityLevel } = usePatientAssignments();

  // Show only first 5 patients for the card overview
  const displayPatients = patients.slice(0, 5);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "inactive":
        return <Badge variant="outline" className="bg-gray-100 text-gray-600">Inactive</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Urgent</Badge>;
      case "high":
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">High</Badge>;
      case "medium":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Medium</Badge>;
      case "low":
        return <Badge className="bg-gray-100 text-gray-600 border-gray-200">Low</Badge>;
      default:
        return <Badge variant="outline">Normal</Badge>;
    }
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case "improving":
        return <TrendingUp className="h-3 w-3 text-green-600" />;
      case "declining":
        return <TrendingDown className="h-3 w-3 text-red-600" />;
      case "stable":
        return <Minus className="h-3 w-3 text-blue-600" />;
      default:
        return <Minus className="h-3 w-3 text-gray-400" />;
    }
  };

  const getPatientAssignment = (patientId: string) => {
    return assignments.find(assignment => assignment.patient_id === patientId);
  };

  const handlePatientView = (patientId: string) => {
    navigate(`/patient/${patientId}`);
  };

  const handleViewAllPatients = () => {
    navigate('/therapist/patients');
  };

  const handlePriorityChange = async (assignmentId: string, newPriority: string) => {
    await updatePriorityLevel.mutateAsync({ assignmentId, priorityLevel: newPriority });
  };

  if (patientsLoading || assignmentsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            My Patients
          </CardTitle>
          <CardDescription>Your active patient caseload</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading patients...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          My Patients
          {patients.length > 0 && (
            <Badge variant="secondary">{patients.length}</Badge>
          )}
        </CardTitle>
        <CardDescription>Your active patient caseload with assignment details</CardDescription>
      </CardHeader>
      <CardContent>
        {displayPatients.length > 0 ? (
          <div className="space-y-3">
            {displayPatients.map((patient) => {
              const assignment = getPatientAssignment(patient.id);
              
              return (
                <div key={patient.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-700">
                          {patient.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getMoodIcon(patient.moodTrend)}
                        {assignment?.priority_level === 'urgent' && (
                          <AlertTriangle className="h-3 w-3 text-red-600" />
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{patient.fullName}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        {getStatusBadge(patient.status)}
                        {assignment && getPriorityBadge(assignment.priority_level)}
                        {patient.lastSessionDate && (
                          <span className="text-xs text-gray-500">
                            Last: {format(new Date(patient.lastSessionDate), "MMM d")}
                          </span>
                        )}
                        {patient.upcomingSessionDate && (
                          <span className="text-xs text-blue-600">
                            Next: {format(new Date(patient.upcomingSessionDate), "MMM d")}
                          </span>
                        )}
                      </div>
                      {assignment && (
                        <div className="text-xs text-gray-500 mt-1">
                          Assigned: {format(new Date(assignment.start_date), "MMM d, yyyy")}
                          {assignment.assignment_reason && (
                            <span className="ml-2">• {assignment.assignment_reason}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handlePatientView(patient.id)}
                    className="text-xs"
                  >
                    <ChevronRight className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </div>
              );
            })}
            
            {patients.length > 5 && (
              <Button 
                variant="ghost" 
                className="w-full text-sm mt-2"
                onClick={handleViewAllPatients}
              >
                View All {patients.length} Patients
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No patients assigned</p>
            <p className="text-xs text-gray-500">Your patient caseload will appear here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientsListCard;
