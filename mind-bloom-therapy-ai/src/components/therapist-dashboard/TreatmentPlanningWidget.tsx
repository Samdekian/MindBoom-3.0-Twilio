import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  Plus, 
  ChevronRight, 
  CheckCircle,
  Clock,
  Users
} from "lucide-react";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const TreatmentPlanningWidget = () => {
  const { user } = useAuthRBAC();
  const navigate = useNavigate();

  // Fetch recent treatment plans
  const { data: treatmentPlans, isLoading } = useQuery({
    queryKey: ['treatment-plans-widget', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('treatment_plans')
        .select(`
          *,
          patient_profile:profiles!treatment_plans_patient_id_fkey (
            full_name
          )
        `)
        .eq('therapist_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'paused':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Target className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success" className="text-xs">Active</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800 text-xs">Completed</Badge>;
      case 'paused':
        return <Badge variant="warning" className="text-xs">Paused</Badge>;
      case 'cancelled':
        return <Badge variant="destructive" className="text-xs">Cancelled</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Unknown</Badge>;
    }
  };

  const handleViewAll = () => {
    navigate('/therapist?section=treatment');
  };

  const handleCreateNew = () => {
    navigate('/therapist/treatment-plan/new');
  };

  if (isLoading) {
    return (
      <Card className="border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Target className="h-5 w-5 text-blue-600" />
            Treatment Planning
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading treatment plans...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Target className="h-5 w-5 text-blue-600" />
            Treatment Planning
            {treatmentPlans && treatmentPlans.length > 0 && (
              <Badge variant="secondary">{treatmentPlans.length}</Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-1" />
              New Plan
            </Button>
            <Button variant="ghost" size="sm" onClick={handleViewAll}>
              View All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {treatmentPlans && treatmentPlans.length > 0 ? (
          <div className="space-y-3">
            {treatmentPlans.map((plan) => (
              <div key={plan.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(plan.status)}
                  <div>
                    <p className="font-medium text-sm text-gray-900">{plan.title}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {getStatusBadge(plan.status)}
                      <div className="flex items-center text-xs text-gray-500">
                        <Users className="h-3 w-3 mr-1" />
                        {plan.patient_profile?.full_name || 'Unknown Patient'}
                      </div>
                      <span className="text-xs text-gray-500">
                        Started {new Date(plan.start_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            {treatmentPlans.length >= 5 && (
              <Button variant="ghost" className="w-full text-sm mt-2" onClick={handleViewAll}>
                View All Treatment Plans
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <Target className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No treatment plans created</p>
            <p className="text-xs text-gray-500 mb-4">Create structured treatment plans for your patients</p>
            <Button size="sm" onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-1" />
              Create First Plan
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TreatmentPlanningWidget;
