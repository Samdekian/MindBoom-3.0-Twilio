
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import type { SimpleTherapistProfile } from "@/hooks/useSimpleTherapistApproval";

interface SimpleApprovalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  therapist: SimpleTherapistProfile | null;
  action: 'approved' | 'rejected' | null;
  adminNotes: string;
  onNotesChange: (notes: string) => void;
  isUpdating: boolean;
}

export const SimpleApprovalDialog: React.FC<SimpleApprovalDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  therapist,
  action,
  adminNotes,
  onNotesChange,
  isUpdating,
}) => {
  if (!therapist || !action) return null;

  const isApproval = action === 'approved';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isApproval ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            {isApproval ? 'Approve' : 'Reject'} Therapist
          </DialogTitle>
          <DialogDescription>
            {isApproval ? 'Approve' : 'Reject'} <strong>{therapist.full_name}</strong> as a therapist.
            {isApproval && ' This will grant them therapist access to the platform.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="admin-notes">Admin Notes</Label>
            <Textarea
              id="admin-notes"
              placeholder={isApproval ? "Add approval notes..." : "Provide rejection reason..."}
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
            variant={isApproval ? "default" : "destructive"}
          >
            {isUpdating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : isApproval ? (
              <CheckCircle className="h-4 w-4 mr-2" />
            ) : (
              <XCircle className="h-4 w-4 mr-2" />
            )}
            {isApproval ? 'Approve' : 'Reject'} Therapist
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
