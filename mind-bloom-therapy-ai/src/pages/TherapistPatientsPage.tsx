import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, Calendar, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import PatientCard from "@/components/therapist/patient-management/PatientCard";
import PatientFilters from "@/components/therapist/patient-management/PatientFilters";
import PatientStats from "@/components/therapist/patient-management/PatientStats";

interface Patient {
  id: string;
  full_name: string;
  email: string;
  phone_number?: string;
  status: string;
  created_at: string;
  assignment: {
    id: string;
    start_date: string;
    status: string;
    priority_level: string;
    assignment_reason?: string;
  };
  lastSessionDate?: string;
  upcomingSessionDate?: string;
  totalSessions: number;
}

const TherapistPatientsPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthRBAC();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const {
    data: patients = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["patients", user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return [];
      }

      // First get patient assignments for this therapist
      const { data: assignments, error: assignmentError } = await supabase
        .from("patient_assignments")
        .select("id, patient_id, start_date, status, priority_level, assignment_reason")
        .eq("therapist_id", user.id)
        .eq("status", "active");

      if (assignmentError) {
        console.error("Error fetching patient assignments:", assignmentError);
        throw new Error(assignmentError.message);
      }

      if (!assignments || assignments.length === 0) {
        return [];
      }

      // Get patient IDs from assignments
      const patientIds = assignments.map(assignment => assignment.patient_id);

      // Get profile data for these patients
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone_number, status, created_at")
        .in("id", patientIds);

      if (profileError) {
        console.error("Error fetching patient profiles:", profileError);
        throw new Error(profileError.message);
      }

      // Get appointment data for these patients
      const { data: appointments, error: appointmentError } = await supabase
        .from("appointments")
        .select("patient_id, start_time, status")
        .in("patient_id", patientIds)
        .eq("therapist_id", user.id)
        .order("start_time", { ascending: false });

      if (appointmentError) {
        console.error("Error fetching appointments:", appointmentError);
        throw new Error(appointmentError.message);
      }

      // Combine assignment, profile, and appointment data
      const transformedData: Patient[] = assignments.map((assignment: any) => {
        const profile = profiles?.find(p => p.id === assignment.patient_id);
        
        if (!profile) {
          console.warn(`Profile not found for patient_id: ${assignment.patient_id}`);
          return null;
        }

        // Get appointment data for this patient
        const patientAppointments = appointments?.filter(apt => apt.patient_id === profile.id) || [];
        const completedAppointments = patientAppointments.filter(apt => apt.status === 'completed');
        const upcomingAppointments = patientAppointments.filter(apt => 
          apt.status === 'scheduled' && new Date(apt.start_time) > new Date()
        );

        const lastSessionDate = completedAppointments.length > 0 
          ? completedAppointments[0].start_time 
          : undefined;
        
        const upcomingSessionDate = upcomingAppointments.length > 0
          ? upcomingAppointments[upcomingAppointments.length - 1].start_time
          : undefined;

        return {
          id: profile.id,
          full_name: profile.full_name || 'Unknown',
          email: profile.email || '',
          phone_number: profile.phone_number,
          status: profile.status || 'active',
          created_at: profile.created_at,
          assignment: {
            id: assignment.id,
            start_date: assignment.start_date,
            status: assignment.status,
            priority_level: assignment.priority_level,
            assignment_reason: assignment.assignment_reason
          },
          lastSessionDate,
          upcomingSessionDate,
          totalSessions: completedAppointments.length,
        };
      }).filter(Boolean) as Patient[];

      return transformedData;
    },
    enabled: !!user?.id,
  });

  const filteredPatients = useMemo(() => {
    if (!patients) return [];

    return patients.filter(patient => {
      const searchRegex = new RegExp(searchTerm, 'i');
      const searchMatch = searchRegex.test(patient.full_name) ||
                          searchRegex.test(patient.email) ||
                          (patient.assignment.assignment_reason ? searchRegex.test(patient.assignment.assignment_reason) : false);

      const statusMatch = statusFilter === 'all' || patient.status === statusFilter;
      const priorityMatch = priorityFilter === 'all' || patient.assignment.priority_level === priorityFilter;

      return searchMatch && statusMatch && priorityMatch;
    });
  }, [patients, searchTerm, statusFilter, priorityFilter]);

  const sortedPatients = useMemo(() => {
    if (!filteredPatients) return [];

    const sorted = [...filteredPatients];

    sorted.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.full_name.localeCompare(b.full_name);
          break;
        case 'assigned_date':
          comparison = new Date(a.assignment.start_date).getTime() - new Date(b.assignment.start_date).getTime();
          break;
        case 'last_session':
          const dateA = a.lastSessionDate ? new Date(a.lastSessionDate).getTime() : 0;
          const dateB = b.lastSessionDate ? new Date(b.lastSessionDate).getTime() : 0;
          comparison = dateA - dateB;
          break;
        case 'total_sessions':
          comparison = a.totalSessions - b.totalSessions;
          break;
        case 'priority':
          // Custom priority comparison logic
          const priorityOrder = { 'urgent': 1, 'high': 2, 'medium': 3, 'low': 4 };
          const priorityA = priorityOrder[a.assignment.priority_level] || 5; // Default to 5 if not found
          const priorityB = priorityOrder[b.assignment.priority_level] || 5;
          comparison = priorityA - priorityB;
          break;
        default:
          comparison = a.full_name.localeCompare(b.full_name);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [filteredPatients, sortBy, sortOrder]);

  const totalPatients = patients.length;
  const activePatients = patients.filter((patient) => patient.status === "active").length;
  const inactivePatients = patients.filter((patient) => patient.status === "inactive").length;
  const urgentPatients = patients.filter((patient) => patient.assignment.priority_level === "urgent").length;
  
  // Calculate actual statistics
  const upcomingSessions = patients.filter(patient => patient.upcomingSessionDate).length;
  const totalSessions = patients.reduce((sum, patient) => sum + patient.totalSessions, 0);
  const averageSessionsPerPatient = totalPatients > 0 ? totalSessions / totalPatients : 0;
  
  // Get sessions this week (assuming current week calculation)
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  const sessionsThisWeek = patients.filter(patient => {
    if (!patient.lastSessionDate) return false;
    const sessionDate = new Date(patient.lastSessionDate);
    return sessionDate >= startOfWeek && sessionDate <= endOfWeek;
  }).length;
  
  // Calculate overdue patients (those without recent sessions)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const overduePatients = patients.filter(patient => {
    if (!patient.lastSessionDate) return true; // Never had a session
    return new Date(patient.lastSessionDate) < thirtyDaysAgo;
  }).length;

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPriorityFilter("all");
  };

  if (isLoading) {
    return <div>Loading patients...</div>;
  }

  if (isError) {
    return (
      <div>
        Error fetching patients: {error?.message || "Unknown error"}
      </div>
    );
  }

    return (
      <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Patient Management</h1>
      </div>

      <PatientStats
        totalPatients={totalPatients}
        activePatients={activePatients}
        inactivePatients={inactivePatients}
        urgentPatients={urgentPatients}
        sessionsThisWeek={sessionsThisWeek}
        upcomingSessions={upcomingSessions}
        overduePatients={overduePatients}
        averageSessionsPerPatient={averageSessionsPerPatient}
      />

      <div className="mt-6">
        <PatientFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          onClearFilters={handleClearFilters}
          totalPatients={totalPatients}
          filteredCount={filteredPatients.length}
        />
      </div>

      <div className="mt-6 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {sortedPatients.map((patient) => (
          <PatientCard
            key={patient.id}
            patient={patient}
            onViewProfile={(patientId) => navigate(`/therapist/patient/${patientId}`)}
            onSchedule={(patientId) => navigate(`/therapist/schedule?patient=${patientId}`)}
            onSendMessage={(patientId) => {
              toast({
                title: "Send Message",
                description: `Feature not implemented.  Would send message to patient ${patientId}`,
              });
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default TherapistPatientsPage;
