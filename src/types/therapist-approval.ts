
export type ApprovalAction = 'approve' | 'reject';

export interface TherapistProfile {
  id: string;
  full_name: string;
  admin_notes: string | null;
  approval_status: 'pending' | 'approved' | 'rejected';
  approval_request_date: string;
  email: string;
  account_type: string;
}
