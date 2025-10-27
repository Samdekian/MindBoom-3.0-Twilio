import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Plus, Edit, Trash2, Calendar } from 'lucide-react';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LoadingState } from '@/components/ui/loading-state';

interface PatientGroup {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  lastActivity: string;
  color?: string;
  group_type?: string;
}

const PatientGroupsTab: React.FC = () => {
  const { user } = useAuthRBAC();

  // Fetch patient groups from Supabase
  const { data: patientGroups = [], isLoading, error } = useQuery({
    queryKey: ['patient-groups', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data: groups, error } = await supabase
        .from('patient_groups')
        .select(`
          *,
          patient_group_memberships(count)
        `)
        .eq('created_by', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching patient groups:', error);
        throw error;
      }

      return groups?.map(group => ({
        id: group.id,
        name: group.name,
        description: group.description || '',
        memberCount: group.patient_group_memberships?.[0]?.count || 0,
        lastActivity: new Date(group.updated_at).toLocaleDateString(),
        color: group.color,
        group_type: group.group_type
      })) || [];
    },
    enabled: !!user?.id
  });

  if (isLoading) {
    return <LoadingState variant="spinner" text="Loading patient groups..." />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive">Failed to load patient groups</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient Groups</CardTitle>
        <CardDescription>Manage and view your patient groups.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create New Group
          </Button>
        </div>
        {patientGroups.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No patient groups found</p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Group
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {patientGroups.map((group) => (
              <Card key={group.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {group.color && (
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: group.color }}
                        />
                      )}
                      {group.name}
                    </div>
                    <Badge variant="secondary">{group.memberCount} Members</Badge>
                  </CardTitle>
                  <CardDescription>{group.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Updated: {group.lastActivity}</span>
                    {group.group_type && (
                      <Badge variant="outline">{group.group_type}</Badge>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientGroupsTab;
