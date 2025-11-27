
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { usePatientManagement } from "@/hooks/use-patient-management";
import { 
  Users, 
  Search, 
  Plus, 
  Calendar, 
  FileText, 
  Phone, 
  Mail,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight
} from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import PatientInvitationModal from "@/components/patient-management/PatientInvitationModal";

const MyPatientsPage = () => {
  const navigate = useNavigate();
  const { patients, isLoading, filterPatients } = usePatientManagement();
  const [searchTerm, setSearchTerm] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    filterPatients(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "inactive":
        return "bg-gray-100 text-gray-600 border-gray-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "archived":
        return "bg-red-100 text-red-600 border-red-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case "improving":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "declining":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case "stable":
        return <Minus className="h-4 w-4 text-blue-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const handlePatientView = (patientId: string) => {
    navigate(`/therapist/patient/${patientId}`);
  };

  const handleScheduleAppointment = (patientId: string) => {
    navigate(`/book-therapist?patient=${patientId}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Patients</h1>
            <p className="text-gray-600">Manage your patient caseload and relationships</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-3 py-1">
            {patients.length} patients
          </Badge>
          <Button onClick={() => setShowInviteModal(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Invite Patient
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search patients by name..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patient List */}
      {patients.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Patients Found</h3>
            <p className="text-gray-600 text-center max-w-md mb-6">
              {searchTerm 
                ? "No patients match your search criteria."
                : "You haven't been assigned any patients yet. Invite patients or wait for assignments."
              }
            </p>
            <Button onClick={() => setShowInviteModal(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Invite Your First Patient
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {patients.map((patient) => (
            <Card key={patient.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {patient.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <CardTitle className="text-xl">{patient.fullName}</CardTitle>
                        <Badge className={getStatusColor(patient.status)}>
                          {patient.status}
                        </Badge>
                        {getMoodIcon(patient.moodTrend)}
                      </div>
                      <CardDescription>
                        Patient since {format(new Date(patient.createdAt), 'MMM yyyy')}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleScheduleAppointment(patient.id)}
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      Schedule
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handlePatientView(patient.id)}
                    >
                      View Details
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Session Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-sm text-blue-900">Sessions</p>
                      <p className="text-xs text-blue-700">View history & schedule</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <FileText className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-sm text-green-900">Treatment Plan</p>
                      <p className="text-xs text-green-700">
                        {patient.activeTreatmentPlan ? 'Active plan' : 'No active plan'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-sm text-purple-900">Progress</p>
                      <p className="text-xs text-purple-700">
                        Mood: {patient.moodTrend}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                {patient.lastSessionDate && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm">
                      <span className="font-medium">Last session:</span>{' '}
                      {format(new Date(patient.lastSessionDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                )}

                {patient.upcomingSessionDate && (
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-sm">
                      <span className="font-medium">Next session:</span>{' '}
                      {format(new Date(patient.upcomingSessionDate), 'MMM dd, yyyy')} at{' '}
                      {format(new Date(patient.upcomingSessionDate), 'h:mm a')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Patient Invitation Modal */}
      <PatientInvitationModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
      />
    </div>
  );
};

export default MyPatientsPage;
