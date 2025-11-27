
import React, { useState } from "react";
import { useTherapistApprovalManagement } from "@/hooks/useTherapistApprovalManagement";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ApprovalDialog } from "./therapist/ApprovalDialog";
import { Loader2, RefreshCw, UserPlus, Search, Filter, CheckCircle, XCircle, AlertCircle } from "lucide-react";

// Define local interface to match hook return type
interface LocalTherapistProfile {
  id: string;
  full_name: string;
  email: string;
  admin_notes: string | null;
  approval_status: 'pending' | 'approved' | 'rejected';
  approval_request_date: string;
  account_type: string;
}

type ApprovalAction = 'approve' | 'reject';

const SimpleTherapistTable: React.FC = () => {
  const {
    therapists,
    isLoading,
    isUpdating,
    error,
    refreshTherapists,
    updateApprovalStatus,
    createSampleTherapist,
    canManageTherapists
  } = useTherapistApprovalManagement();

  // Local state for UI
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedTherapist, setSelectedTherapist] = useState<LocalTherapistProfile | null>(null);
  const [dialogAction, setDialogAction] = useState<ApprovalAction | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Filter therapists
  const filteredTherapists = therapists.filter(therapist => {
    const matchesSearch = !searchQuery || 
      (therapist.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (therapist.email?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || therapist.approval_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleOpenDialog = (therapist: LocalTherapistProfile, action: ApprovalAction) => {
    if (!canManageTherapists) return;
    
    setSelectedTherapist(therapist);
    setDialogAction(action);
    setAdminNotes(therapist.admin_notes || "");
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedTherapist(null);
    setDialogAction(null);
    setAdminNotes("");
  };

  const handleConfirmAction = async () => {
    if (!selectedTherapist || !dialogAction) return;
    
    const success = await updateApprovalStatus(selectedTherapist, dialogAction, adminNotes);
    
    if (success) {
      handleCloseDialog();
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Show access denied if not admin
  if (!canManageTherapists) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              You must be an administrator to access therapist approval management.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search therapists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status Types</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            onClick={refreshTherapists}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Refresh
          </Button>
          
          <Button 
            variant="default" 
            onClick={createSampleTherapist}
            disabled={isUpdating}
          >
            {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
            Create Sample
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Therapist Accounts</CardTitle>
          <CardDescription>
            Manage therapist approval status and view account details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-lg text-muted-foreground">Loading therapist accounts...</p>
              </div>
            </div>
          ) : filteredTherapists.length === 0 ? (
            <div className="text-center py-12">
              <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Therapists Found</h3>
              <p className="text-muted-foreground mb-4">
                {therapists.length === 0 
                  ? "There are no therapist accounts in the system yet."
                  : "No therapists match your current filters."
                }
              </p>
              {therapists.length === 0 && (
                <Button onClick={createSampleTherapist} disabled={isUpdating}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Sample Therapist
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Request Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTherapists.map((therapist) => (
                  <TableRow 
                    key={therapist.id}
                    className={therapist.approval_status === 'pending' ? "bg-amber-50 dark:bg-amber-950/20" : ""}
                  >
                    <TableCell className="font-medium">
                      {therapist.full_name || "Unknown"}
                    </TableCell>
                    <TableCell>{therapist.email}</TableCell>
                    <TableCell>{formatDate(therapist.approval_request_date)}</TableCell>
                    <TableCell>
                      {getStatusBadge(therapist.approval_status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex space-x-2 justify-end">
                        {therapist.approval_status === 'pending' ? (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-green-500 text-green-500 hover:bg-green-50"
                              onClick={() => handleOpenDialog(therapist, 'approve')}
                              disabled={isUpdating}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" /> Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-red-500 text-red-500 hover:bg-red-50"
                              onClick={() => handleOpenDialog(therapist, 'reject')}
                              disabled={isUpdating}
                            >
                              <XCircle className="h-4 w-4 mr-1" /> Reject
                            </Button>
                          </>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleOpenDialog(
                              therapist, 
                              therapist.approval_status === 'approved' ? 'reject' : 'approve'
                            )}
                            disabled={isUpdating}
                          >
                            {therapist.approval_status === 'approved' ? 'Revoke' : 'Approve'}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <ApprovalDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        selectedTherapist={selectedTherapist}
        action={dialogAction}
        adminNotes={adminNotes}
        onNotesChange={setAdminNotes}
        onConfirm={handleConfirmAction}
        isUpdating={isUpdating}
      />
    </div>
  );
};

export default SimpleTherapistTable;
