
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePatientInquiries } from "@/hooks/usePatientInquiries";
import { MessageSquare, Clock, TrendingUp, Users, AlertTriangle, CheckCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useMigrationTracking } from "@/utils/migration/migration-helpers";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";

const DailyOverview = () => {
  const { therapistInquiries, relationships } = usePatientInquiries();
  const { user } = useAuthRBAC();
  const navigate = useNavigate();

  // Track migration
  useMigrationTracking('TherapistDailyOverview', 'useAuthRBAC');

  // Fetch real patient data
  const { data: patientData, isLoading: patientsLoading } = useQuery({
    queryKey: ['therapist-patients', user?.id],
    queryFn: async () => {
      if (!user?.id) return { activePatients: 0, totalPatients: 0 };

      const { data: assignments, error } = await supabase
        .from('patient_assignments')
        .select('id, status, patient_id')
        .eq('therapist_id', user.id);

      if (error) throw error;

      const activePatients = assignments?.filter(a => a.status === 'active').length || 0;
      const totalPatients = assignments?.length || 0;

      return {
        activePatients,
        totalPatients
      };
    },
    enabled: !!user?.id
  });

  const pendingInquiries = therapistInquiries.filter(i => i.status === 'pending');
  const overdueInquiries = pendingInquiries.filter(i => 
    new Date().getTime() - new Date(i.created_at).getTime() > 24 * 60 * 60 * 1000
  );
  const todayInquiries = therapistInquiries.filter(i => 
    new Date(i.created_at).toDateString() === new Date().toDateString()
  );

  const activeRelationships = relationships.filter(r => r.relationship_status === 'active').length;
  const consultationsPending = relationships.filter(r => r.relationship_status === 'consultation_scheduled').length;

  const handleManagePatients = () => {
    navigate('/therapist/patients');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Urgent Items */}
      <Card className={`${overdueInquiries.length > 0 ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            {overdueInquiries.length > 0 ? (
              <AlertTriangle className="h-5 w-5 text-red-600" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-600" />
            )}
            Urgent Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          {overdueInquiries.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-red-600">{overdueInquiries.length}</span>
                <Badge variant="destructive">Overdue</Badge>
              </div>
              <p className="text-sm text-red-700">
                {overdueInquiries.length === 1 ? 'inquiry needs' : 'inquiries need'} immediate attention
              </p>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => navigate('/therapist/inquiries')}
                className="w-full"
              >
                Review Now
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-green-600">0</span>
                <Badge className="bg-green-600">All Clear</Badge>
              </div>
              <p className="text-sm text-green-700">No overdue inquiries</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Today's Activity */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            Today's Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">New Inquiries</span>
              <span className="text-lg font-semibold">{todayInquiries.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pending Responses</span>
              <span className="text-lg font-semibold">{pendingInquiries.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Patients</span>
              <span className="text-lg font-semibold">
                {patientsLoading ? (
                  <span className="inline-block w-6 h-6 bg-gray-200 animate-pulse rounded" />
                ) : (
                  patientData?.activePatients || 0
                )}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start"
              onClick={() => navigate('/therapist/inquiries')}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Review Inquiries ({pendingInquiries.length})
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start"
              onClick={() => navigate('/calendar')}
            >
              <Clock className="h-4 w-4 mr-2" />
              Schedule Consultations ({consultationsPending})
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start"
              onClick={handleManagePatients}
            >
              <Users className="h-4 w-4 mr-2" />
              Manage Patients ({patientsLoading ? '...' : patientData?.activePatients || 0})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Inquiries Preview */}
      {pendingInquiries.length > 0 && (
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                Recent Inquiries
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/therapist/inquiries')}
              >
                View All
              </Button>
            </CardTitle>
            <CardDescription>
              Latest patient inquiries requiring your attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingInquiries.slice(0, 3).map((inquiry) => (
                <div key={inquiry.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{inquiry.patient?.full_name || 'Anonymous'}</span>
                      <Badge variant={inquiry.priority === 'urgent' ? 'destructive' : 'outline'}>
                        {inquiry.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{inquiry.subject}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(inquiry.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <Button 
                    size="sm"
                    onClick={() => navigate('/therapist/inquiries')}
                  >
                    Respond
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DailyOverview;
