import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Search, User, Phone, Mail, MapPin, Clock } from 'lucide-react';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { usePatientAssignments } from '@/hooks/use-patient-assignments';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LoadingState } from '@/components/ui/loading-state';

interface PatientProfile {
  id: string;
  full_name: string;
  email?: string;
  status?: string;
  created_at: string;
  updated_at: string;
}

const PatientAssignmentsTab: React.FC = () => {
  const { user } = useAuthRBAC();
  const [searchTerm, setSearchTerm] = useState('');
  const { assignments, isLoading: assignmentsLoading, updateAssignmentStatus } = usePatientAssignments();

  // Fetch patient profiles for assigned patients
  const { data: patients = [], isLoading: patientsLoading } = useQuery({
    queryKey: ['assigned-patients', user?.id],
    queryFn: async () => {
      if (!user?.id || !assignments.length) return [];

      const patientIds = assignments.map(a => a.patient_id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('id', patientIds)
        .eq('account_type', 'patient');

      if (error) {
        console.error('Error fetching patient profiles:', error);
        throw error;
      }

      return data as PatientProfile[];
    },
    enabled: !!user?.id && assignments.length > 0,
  });

  const isLoading = assignmentsLoading || patientsLoading;

  const filteredPatients = patients.filter(patient =>
    patient.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAssignmentForPatient = (patientId: string) => {
    return assignments.find(a => a.patient_id === patientId);
  };

  if (isLoading) {
    return <LoadingState variant="spinner" text="Loading patient assignments..." />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient Assignments</CardTitle>
        <CardDescription>
          Manage and view your assigned patients ({assignments.length} active assignments).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4" />
          <Input
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {filteredPatients.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {assignments.length === 0 ? 'No patients assigned yet' : 'No patients match your search'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredPatients.map(patient => {
              const assignment = getAssignmentForPatient(patient.id);
              return (
                <Card key={patient.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarFallback>
                            {patient.full_name?.substring(0, 2).toUpperCase() || 'UN'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-lg font-semibold">{patient.full_name}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {patient.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {patient.email}
                              </span>
                            )}
                            {assignment && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Assigned: {new Date(assignment.start_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          {assignment && (
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={assignment.status === 'active' ? 'default' : 'secondary'}>
                                {assignment.status}
                              </Badge>
                              <Badge variant="outline">
                                {assignment.priority_level} priority
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <User className="h-4 w-4 mr-2" />
                          View Profile
                        </Button>
                        <Button variant="secondary" size="sm">
                          <Calendar className="h-4 w-4 mr-2" />
                          Schedule
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientAssignmentsTab;
