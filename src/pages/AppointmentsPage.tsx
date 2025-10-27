
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Video, Plus, Search, Filter } from "lucide-react";
import useRequireAuth from '@/hooks/useRequireAuth';
import { SimpleLoading } from '@/components/ui/simple-loading';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';

const AppointmentsPage: React.FC = () => {
  const { loading } = useRequireAuth();
  const { primaryRole } = useAuthRBAC();
  const [searchTerm, setSearchTerm] = useState("");

  if (loading) {
    return <SimpleLoading text="Loading appointments..." className="min-h-screen" />;
  }

  // Mock appointments data
  const upcomingAppointments = [
    {
      id: "1",
      title: "Therapy Session",
      patient: "John Doe",
      therapist: "Dr. Smith",
      date: "2024-01-20",
      time: "10:00 AM",
      duration: "50 minutes",
      status: "confirmed",
      type: "video"
    },
    {
      id: "2",
      title: "Follow-up Session",
      patient: "Jane Wilson",
      therapist: "Dr. Johnson",
      date: "2024-01-22",
      time: "2:00 PM",
      duration: "50 minutes",
      status: "scheduled",
      type: "in-person"
    }
  ];

  const pastAppointments = [
    {
      id: "3",
      title: "Initial Consultation",
      patient: "Mike Brown",
      therapist: "Dr. Smith",
      date: "2024-01-15",
      time: "11:00 AM",
      duration: "50 minutes",
      status: "completed",
      type: "video"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const AppointmentCard = ({ appointment }: { appointment: any }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg">{appointment.title}</h3>
          <Badge className={getStatusColor(appointment.status)}>
            {appointment.status}
          </Badge>
        </div>
        
        <div className="space-y-2 text-sm text-gray-600">
          {primaryRole === 'therapist' ? (
            <p><strong>Patient:</strong> {appointment.patient}</p>
          ) : (
            <p><strong>Therapist:</strong> {appointment.therapist}</p>
          )}
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {appointment.date}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {appointment.time}
            </div>
            {appointment.type === 'video' && (
              <div className="flex items-center gap-1">
                <Video className="h-4 w-4" />
                Video Session
              </div>
            )}
          </div>
          
          <p><strong>Duration:</strong> {appointment.duration}</p>
        </div>
        
        <div className="flex gap-2 mt-4">
          {appointment.status === 'confirmed' && (
            <Button size="sm" className="flex items-center gap-1">
              <Video className="h-4 w-4" />
              Join Session
            </Button>
          )}
          <Button variant="outline" size="sm">
            View Details
          </Button>
          {appointment.status !== 'completed' && (
            <Button variant="outline" size="sm">
              Reschedule
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Appointments</h1>
          <p className="text-gray-600 mt-1">
            Manage your {primaryRole === 'therapist' ? 'patient sessions' : 'therapy sessions'}
          </p>
        </div>
        
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {primaryRole === 'therapist' ? 'Add Appointment' : 'Book Session'}
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="space-y-4">
          {upcomingAppointments.length > 0 ? (
            upcomingAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No upcoming appointments</h3>
                <p className="text-gray-600 mb-4">
                  {primaryRole === 'therapist' 
                    ? 'You don\'t have any upcoming patient sessions.' 
                    : 'You don\'t have any upcoming therapy sessions.'}
                </p>
                <Button>
                  {primaryRole === 'therapist' ? 'Add Appointment' : 'Book a Session'}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="past" className="space-y-4">
          {pastAppointments.length > 0 ? (
            pastAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No past appointments</h3>
                <p className="text-gray-600">
                  Your appointment history will appear here.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AppointmentsPage;
