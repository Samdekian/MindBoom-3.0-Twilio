
import React, { useEffect, useState } from 'react';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ApprovalStatusBanner = () => {
  const { user, userRoles } = useAuthRBAC();
  const [approvalStatus, setApprovalStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  // Safe check for approval status
  const checkApprovalStatus = async () => {
    try {
      if (!user) return;
      
      setLoading(true);
      
      // Use the profile's account_type from metadata or fall back to profile table
      const status = user.user_metadata?.approval_status || 'pending';
      setApprovalStatus(status);
    } catch (error) {
      console.error('Error checking approval status:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    checkApprovalStatus();
  }, [user]);

  if (!user || !approvalStatus || userRoles.includes('admin') || userRoles.includes('patient')) {
    return null;
  }

  if (approvalStatus === 'approved') {
    return (
      <Alert className="bg-green-50 border-green-200 text-green-800">
        <CheckCircle2 className="h-4 w-4" />
        <AlertTitle>Account Approved</AlertTitle>
        <AlertDescription>
          Your therapist account has been approved. You can now access all therapist features.
        </AlertDescription>
      </Alert>
    );
  }

  if (approvalStatus === 'rejected') {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Account Rejected</AlertTitle>
        <AlertDescription>
          Your therapist application has been rejected. Please contact support for more information.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="bg-amber-50 border-amber-200 text-amber-800">
      <Clock className="h-4 w-4" />
      <AlertTitle>Pending Approval</AlertTitle>
      <AlertDescription className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <span>
          Your therapist account is pending administrator approval.
          This usually takes 1-2 business days.
        </span>
        <Button 
          variant="outline" 
          size="sm"
          onClick={checkApprovalStatus}
          disabled={loading}
          className="border-amber-300 text-amber-800 hover:bg-amber-100"
        >
          Check Status
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default ApprovalStatusBanner;
