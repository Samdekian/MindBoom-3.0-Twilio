
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation } from "@tanstack/react-query";
import { Users, UserCheck, UserX, Download } from "lucide-react";

interface BulkUserActionsProps {
  selectedUsers: string[];
  onActionComplete: () => void;
  onClearSelection: () => void;
}

const BulkUserActions: React.FC<BulkUserActionsProps> = ({
  selectedUsers,
  onActionComplete,
  onClearSelection
}) => {
  const { toast } = useToast();
  const [bulkAction, setBulkAction] = useState("");
  const [bulkRole, setBulkRole] = useState("");
  const [bulkStatus, setBulkStatus] = useState("");

  const bulkOperationMutation = useMutation({
    mutationFn: async ({ action, value }: { action: string; value: string }) => {
      const promises = selectedUsers.map(async (userId) => {
        if (action === 'assign_role' || action === 'remove_role') {
          const operation = action === 'assign_role' ? 'assign' : 'remove';
          const { data, error } = await supabase.rpc('manage_user_role', {
            p_user_id: userId,
            p_role_name: value,
            p_operation: operation
          });
          if (error) throw error;
          return data;
        } else if (action === 'update_status') {
          const { data, error } = await supabase.rpc('update_user_status', {
            p_user_id: userId,
            p_status: value,
            p_admin_notes: `Bulk status update to ${value}`
          });
          if (error) throw error;
          return data;
        }
      });

      return Promise.all(promises);
    },
    onSuccess: () => {
      toast({
        title: "Bulk Operation Complete",
        description: `Successfully updated ${selectedUsers.length} users`,
      });
      onActionComplete();
      onClearSelection();
      setBulkAction("");
      setBulkRole("");
      setBulkStatus("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Bulk operation failed",
        variant: "destructive",
      });
    }
  });

  const handleBulkAction = () => {
    let value = "";
    
    if (bulkAction === 'assign_role' || bulkAction === 'remove_role') {
      if (!bulkRole) {
        toast({
          title: "Error",
          description: "Please select a role",
          variant: "destructive",
        });
        return;
      }
      value = bulkRole;
    } else if (bulkAction === 'update_status') {
      if (!bulkStatus) {
        toast({
          title: "Error",
          description: "Please select a status",
          variant: "destructive",
        });
        return;
      }
      value = bulkStatus;
    }

    bulkOperationMutation.mutate({ action: bulkAction, value });
  };

  const exportUsers = () => {
    // This would typically export to CSV
    toast({
      title: "Export Started",
      description: "User export functionality will be implemented",
    });
  };

  if (selectedUsers.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Bulk Actions
          <Badge variant="secondary">{selectedUsers.length} selected</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium">Action</label>
            <Select value={bulkAction} onValueChange={setBulkAction}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="assign_role">Assign Role</SelectItem>
                <SelectItem value="remove_role">Remove Role</SelectItem>
                <SelectItem value="update_status">Update Status</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(bulkAction === 'assign_role' || bulkAction === 'remove_role') && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select value={bulkRole} onValueChange={setBulkRole}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="therapist">Therapist</SelectItem>
                  <SelectItem value="patient">Patient</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {bulkAction === 'update_status' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={bulkStatus} onValueChange={setBulkStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleBulkAction}
              disabled={!bulkAction || bulkOperationMutation.isPending}
            >
              {bulkAction === 'assign_role' && <UserCheck className="h-4 w-4 mr-2" />}
              {bulkAction === 'remove_role' && <UserX className="h-4 w-4 mr-2" />}
              Apply
            </Button>
            
            <Button variant="outline" onClick={exportUsers}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            
            <Button variant="outline" onClick={onClearSelection}>
              Clear Selection
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkUserActions;
