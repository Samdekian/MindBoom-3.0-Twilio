
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Save, UserX, Shield, Clock, Activity } from "lucide-react";
import { format } from "date-fns";

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  account_type: string;
  approval_status: string;
  status: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  roles: string[];
}

interface UserDetailModalProps {
  user: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({
  user,
  isOpen,
  onClose,
  onUserUpdated
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editedUser, setEditedUser] = useState<Partial<UserProfile>>({});
  const [selectedRole, setSelectedRole] = useState<string>("");

  React.useEffect(() => {
    if (user) {
      setEditedUser({
        full_name: user.full_name,
        account_type: user.account_type,
        status: user.status,
        admin_notes: user.admin_notes
      });
    }
  }, [user]);

  // Fetch user audit logs
  const { data: auditLogs = [] } = useQuery({
    queryKey: ['user-audit-logs', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .or(`user_id.eq.${user.id},metadata->>target_user_id.eq.${user.id}`)
        .order('activity_timestamp', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && isOpen
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      if (!user) throw new Error('No user selected');

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: updates.full_name,
          account_type: updates.account_type,
          admin_notes: updates.admin_notes
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update status if changed
      if (updates.status && updates.status !== user.status) {
        const { data, error: statusError } = await supabase.rpc('update_user_status', {
          p_user_id: user.id,
          p_status: updates.status,
          p_admin_notes: updates.admin_notes
        });

        if (statusError) throw statusError;
      }
    },
    onSuccess: () => {
      toast({
        title: "User Updated",
        description: "User details have been updated successfully.",
      });
      onUserUpdated();
      queryClient.invalidateQueries({ queryKey: ['user-audit-logs'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    }
  });

  // Assign role mutation
  const assignRoleMutation = useMutation({
    mutationFn: async (roleName: string) => {
      if (!user) throw new Error('No user selected');

      const { data, error } = await supabase.rpc('manage_user_role', {
        p_user_id: user.id,
        p_role_name: roleName,
        p_operation: 'assign'
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Role Assigned",
        description: `Role ${selectedRole} has been assigned successfully.`,
      });
      setSelectedRole("");
      onUserUpdated();
      queryClient.invalidateQueries({ queryKey: ['user-audit-logs'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign role",
        variant: "destructive",
      });
    }
  });

  // Remove role mutation
  const removeRoleMutation = useMutation({
    mutationFn: async (roleName: string) => {
      if (!user) throw new Error('No user selected');

      const { data, error } = await supabase.rpc('manage_user_role', {
        p_user_id: user.id,
        p_role_name: roleName,
        p_operation: 'remove'
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Role Removed",
        description: "Role has been removed successfully.",
      });
      onUserUpdated();
      queryClient.invalidateQueries({ queryKey: ['user-audit-logs'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove role",
        variant: "destructive",
      });
    }
  });

  const handleSave = () => {
    updateUserMutation.mutate(editedUser);
  };

  const handleAssignRole = () => {
    if (selectedRole) {
      assignRoleMutation.mutate(selectedRole);
    }
  };

  const handleRemoveRole = (roleName: string) => {
    removeRoleMutation.mutate(roleName);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      case 'banned': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            User Details: {user.full_name}
          </DialogTitle>
          <DialogDescription>
            Manage user information, roles, and permissions
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">User Details</TabsTrigger>
            <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={editedUser.full_name || ''}
                  onChange={(e) => setEditedUser(prev => ({...prev, full_name: e.target.value}))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user.email}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="account_type">Account Type</Label>
                <Select 
                  value={editedUser.account_type || user.account_type}
                  onValueChange={(value) => setEditedUser(prev => ({...prev, account_type: value}))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="patient">Patient</SelectItem>
                    <SelectItem value="therapist">Therapist</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={editedUser.status || user.status}
                  onValueChange={(value) => setEditedUser(prev => ({...prev, status: value}))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="banned">Banned</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin_notes">Admin Notes</Label>
              <Textarea
                id="admin_notes"
                value={editedUser.admin_notes || ''}
                onChange={(e) => setEditedUser(prev => ({...prev, admin_notes: e.target.value}))}
                placeholder="Add notes about this user..."
                rows={3}
              />
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Created: {format(new Date(user.created_at), 'MMM d, yyyy')}</span>
              <span>Updated: {format(new Date(user.updated_at), 'MMM d, yyyy')}</span>
              <Badge className={getStatusColor(user.status)}>
                {user.status}
              </Badge>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={updateUserMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="roles" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Current Roles</CardTitle>
                <CardDescription>Manage user roles and permissions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {user.roles.map((role) => (
                    <Badge key={role} variant="secondary" className="flex items-center gap-2">
                      {role}
                      <button
                        onClick={() => handleRemoveRole(role)}
                        className="ml-1 text-red-500 hover:text-red-700"
                        disabled={removeRoleMutation.isPending}
                      >
                        <UserX className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {user.roles.length === 0 && (
                    <span className="text-muted-foreground">No roles assigned</span>
                  )}
                </div>

                <div className="flex gap-2">
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select role to assign" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="therapist">Therapist</SelectItem>
                      <SelectItem value="patient">Patient</SelectItem>
                      <SelectItem value="support">Support</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={handleAssignRole}
                    disabled={!selectedRole || assignRoleMutation.isPending}
                  >
                    Assign Role
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Activity Log
                </CardTitle>
                <CardDescription>Recent user activity and changes</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <Clock className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{log.activity_type}</h4>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(log.activity_timestamp), 'MMM d, yyyy HH:mm')}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Resource: {log.resource_type} - {log.resource_id}
                          </p>
                          {log.metadata && Object.keys(log.metadata).length > 0 && (
                            <div className="mt-2 text-xs bg-gray-50 p-2 rounded">
                              <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {auditLogs.length === 0 && (
                      <div className="text-center text-muted-foreground py-8">
                        No activity logs found
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailModal;
