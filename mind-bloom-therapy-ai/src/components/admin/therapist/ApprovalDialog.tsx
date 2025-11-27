
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface TherapistProfile {
  id: string;
  full_name: string;
  email: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  account_type: string;
}

interface ApprovalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTherapist: TherapistProfile | null;
  action: 'approve' | 'reject' | null;
  adminNotes: string;
  onNotesChange: (notes: string) => void;
  onConfirm: () => void;
  isUpdating: boolean;
}

export const ApprovalDialog: React.FC<ApprovalDialogProps> = ({
  isOpen,
  onClose,
  selectedTherapist,
  action,
  adminNotes,
  onNotesChange,
  onConfirm,
  isUpdating
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {action === 'approve' ? 'Approve' : 'Reject'} Therapist Application
          </DialogTitle>
          <DialogDescription>
            You are about to {action} the application for {selectedTherapist?.full_name}.
            This action will change their status and they will be notified.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="adminNotes">Admin Notes (Optional)</Label>
            <Textarea
              id="adminNotes"
              placeholder="Add any notes about this decision..."
              value={adminNotes}
              onChange={(e) => onNotesChange(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUpdating}>
            Cancel
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={isUpdating}
            variant={action === 'approve' ? 'default' : 'destructive'}
          >
            {isUpdating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {action === 'approve' ? 'Approve' : 'Reject'} Application
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
