
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation } from "@tanstack/react-query";
import { UserCheck, UserX, UserMinus, User } from "lucide-react";

interface PatientStatusManagerProps {
  patientId: string;
  currentStatus: string;
  onStatusUpdate: () => void;
}

const PatientStatusManager: React.FC<PatientStatusManagerProps> = ({
  patientId,
  currentStatus,
  onStatusUpdate
}) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [newStatus, setNewStatus] = useState(currentStatus);
  const [notes, setNotes] = useState("");

  const statusOptions = [
    { value: 'active', label: 'Active', icon: UserCheck, color: 'text-green-600' },
    { value: 'inactive', label: 'Inactive', icon: UserMinus, color: 'text-yellow-600' },
    { value: 'discharged', label: 'Discharged', icon: UserX, color: 'text-gray-600' },
  ];

  const updateStatusMutation = useMutation({
    mutationFn: async ({ status, notes }: { status: string; notes: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          status,
          admin_notes: notes ? `Status changed to ${status}: ${notes}` : `Status changed to ${status}`
        })
        .eq('id', patientId);

      if (error) throw error;

      // Log the status change
      await supabase.from('audit_logs').insert({
        user_id: patientId,
        activity_type: 'patient_status_changed',
        resource_type: 'profiles',
        resource_id: patientId,
        metadata: {
          old_status: currentStatus,
          new_status: status,
          notes,
          changed_by: 'therapist'
        }
      });
    },
    onSuccess: () => {
      toast({
        title: "Status Updated",
        description: `Patient status has been changed to ${newStatus}`,
      });
      onStatusUpdate();
      setIsOpen(false);
      setNotes("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update patient status",
        variant: "destructive",
      });
    }
  });

  const handleStatusUpdate = () => {
    if (newStatus === currentStatus) {
      setIsOpen(false);
      return;
    }
    
    updateStatusMutation.mutate({ status: newStatus, notes });
  };

  const getCurrentStatusIcon = () => {
    const status = statusOptions.find(s => s.value === currentStatus);
    if (!status) return User;
    return status.icon;
  };

  const CurrentIcon = getCurrentStatusIcon();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <CurrentIcon className="h-4 w-4 mr-2" />
          Change Status
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Patient Status</DialogTitle>
          <DialogDescription>
            Change the patient's status and add any relevant notes.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">New Status</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center">
                      <option.icon className={`h-4 w-4 mr-2 ${option.color}`} />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this status change..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleStatusUpdate}
            disabled={updateStatusMutation.isPending}
          >
            Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PatientStatusManager;
