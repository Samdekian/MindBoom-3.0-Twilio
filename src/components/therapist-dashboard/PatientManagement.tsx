import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Users, Calendar, FileText, TrendingUp, TrendingDown, Minus, Plus, Filter } from "lucide-react";
import { usePatientManagement } from "@/hooks/use-patient-management";
import { usePatientAssignments } from "@/hooks/use-patient-assignments";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Patient } from "@/types/patient";

const PatientManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  
  const { patients, isLoading: patientsLoading, filterPatients } = usePatientManagement();
  const { assignments, isLoading: assignmentsLoading, updateAssignmentStatus, updatePriorityLevel } = usePatientAssignments();

  // Filter patients based on search term and status
  const filteredPatients = React.useMemo(() => {
    let filtered = filterPatients(searchTerm);
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(patient => patient.status === statusFilter);
    }
    
    return filtered;
  }, [filterPatients, searchTerm, statusFilter]);

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

  const handlePatientSelect = (patientId: string) => {
    setSelectedPatients(prev => 
      prev.includes(patientId) 
        ? prev.filter(id => id !== patientId)
        : [...prev, patientId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPatients.length === filteredPatients.length) {
      setSelectedPatients([]);
    } else {
      setSelectedPatients(filteredPatients.map(p => p.id));
    }
  };

  if (patientsLoading || assignmentsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Patient Management
          </CardTitle>
          <CardDescription>Manage your patient caseload efficiently</CardDescription>
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
          Patient Management
          {patients.length > 0 && (
            <Badge variant="secondary">{patients.length} Total</Badge>
          )}
        </CardTitle>
        <CardDescription>Manage your patient caseload efficiently</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Search and Filter Controls */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search patients by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bulk Actions */}
        {selectedPatients.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">
                {selectedPatients.length} patient{selectedPatients.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Calendar className="h-4 w-4 mr-1" />
                  Schedule
                </Button>
                <Button size="sm" variant="outline">
                  <FileText className="h-4 w-4 mr-1" />
                  Notes
                </Button>
              </div>
            </div>
          </div>
        )}

        {filteredPatients.length > 0 ? (
          <div className="space-y-3">
            {/* Select All */}
            <div className="flex items-center gap-2 pb-2 border-b">
              <input
                type="checkbox"
                checked={selectedPatients.length === filteredPatients.length}
                onChange={handleSelectAll}
                className="rounded"
              />
              <span className="text-sm text-gray-600">Select All</span>
            </div>

            {filteredPatients.map((patient) => {
              const assignment = getPatientAssignment(patient.id);
              
              return (
                <div key={patient.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedPatients.includes(patient.id)}
                      onChange={() => handlePatientSelect(patient.id)}
                      className="rounded"
                    />
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-700">
                          {patient.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getMoodIcon(patient.moodTrend)}
                      </div>
                    </div>
                    
                    <div>
                      <p className="font-medium">{patient.fullName}</p>
                      <p className="text-sm text-gray-600">{patient.email}</p>
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
                      {patient.activeTreatmentPlan && (
                        <div className="text-xs text-green-600 mt-1">
                          Active Treatment Plan
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline">
                      <Calendar className="h-4 w-4 mr-1" />
                      Schedule
                    </Button>
                    <Button size="sm" variant="outline">
                      <FileText className="h-4 w-4 mr-1" />
                      Notes
                    </Button>
                    <Button size="sm" variant="ghost">
                      View Details
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-600">No patients found</p>
            <p className="text-sm text-gray-500">
              {searchTerm ? "Try adjusting your search terms" : "Your patient list will appear here"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientManagement;
