
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Clock, Eye, Mail, MapPin, Phone, Calendar, UserCheck, UserX, Search, Filter } from 'lucide-react';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface TherapistProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  location?: string;
  specializations?: string[];
  bio?: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

const TherapistApprovalTable: React.FC = () => {
  const { user } = useAuthRBAC();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedProfile, setSelectedProfile] = useState<TherapistProfile | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Fetch therapist profiles
  const { data: profiles = [], isLoading, refetch } = useQuery({
    queryKey: ['therapistProfiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_type', 'therapist')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TherapistProfile[];
    }
  });

  // Approve therapist mutation
  const approveMutation = useMutation({
    mutationFn: async (profileId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          approval_status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', profileId);

      if (error) throw error;
      return null;
    },
    onSuccess: () => {
      toast({
        title: 'Therapist Approved',
        description: 'The therapist has been successfully approved.',
      });
      queryClient.invalidateQueries({ queryKey: ['therapistProfiles'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve therapist.',
        variant: 'destructive',
      });
    }
  });

  // Reject therapist mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ profileId, reason }: { profileId: string; reason: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          approval_status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', profileId);

      if (error) throw error;
      return null;
    },
    onSuccess: () => {
      toast({
        title: 'Therapist Rejected',
        description: 'The therapist application has been rejected.',
      });
      queryClient.invalidateQueries({ queryKey: ['therapistProfiles'] });
      setIsRejectDialogOpen(false);
      setRejectionReason('');
      setSelectedProfile(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject therapist.',
        variant: 'destructive',
      });
    }
  });

  const handleApprove = (profileId: string) => {
    approveMutation.mutate(profileId);
  };

  const handleReject = (profile: TherapistProfile) => {
    setSelectedProfile(profile);
    setIsRejectDialogOpen(true);
  };

  const confirmReject = () => {
    if (selectedProfile && rejectionReason.trim()) {
      rejectMutation.mutate({ 
        profileId: selectedProfile.id, 
        reason: rejectionReason.trim() 
      });
    }
  };

  const handleViewProfile = (profile: TherapistProfile) => {
    setSelectedProfile(profile);
    setIsViewDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || profile.approval_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
          <CardDescription>
            Fetching therapist applications...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="border rounded px-3 py-2"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Results Table */}
        <Card>
          <CardHeader>
            <CardTitle>Therapist Applications ({filteredProfiles.length})</CardTitle>
            <CardDescription>
              Review and manage therapist approval requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProfiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">{profile.full_name}</TableCell>
                    <TableCell>{profile.email}</TableCell>
                    <TableCell>{getStatusBadge(profile.approval_status)}</TableCell>
                    <TableCell>{format(new Date(profile.created_at), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewProfile(profile)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        {profile.approval_status === 'pending' && (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleApprove(profile.id)}
                              disabled={approveMutation.isPending}
                            >
                              <UserCheck className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleReject(profile)}
                              disabled={rejectMutation.isPending}
                            >
                              <UserX className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredProfiles.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No therapist applications found.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Profile Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Therapist Profile Details</DialogTitle>
            <DialogDescription>
              Review the therapist's application information
            </DialogDescription>
          </DialogHeader>
          {selectedProfile && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Full Name</Label>
                  <p className="text-sm text-gray-600">{selectedProfile.full_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-gray-600">{selectedProfile.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <p className="text-sm text-gray-600">{selectedProfile.phone || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Location</Label>
                  <p className="text-sm text-gray-600">{selectedProfile.location || 'Not provided'}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Bio</Label>
                <p className="text-sm text-gray-600 mt-1">{selectedProfile.bio || 'No bio provided'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Specializations</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedProfile.specializations?.map((spec, index) => (
                    <Badge key={index} variant="outline">{spec}</Badge>
                  )) || <span className="text-sm text-gray-600">None specified</span>}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Therapist Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this application.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejection-reason">Reason for Rejection</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Enter the reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmReject}
              disabled={!rejectionReason.trim() || rejectMutation.isPending}
            >
              {rejectMutation.isPending ? 'Rejecting...' : 'Reject Application'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TherapistApprovalTable;
