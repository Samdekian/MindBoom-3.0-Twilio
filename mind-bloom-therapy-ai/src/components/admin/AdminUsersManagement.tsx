import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Search, Users, Shield, UserCheck, UserX } from 'lucide-react';
import { useAdminData } from '@/hooks/use-admin-data';
import { useToast } from '@/hooks/use-toast';

const AdminUsersManagement: React.FC = () => {
  const { users, isLoading, error, updateUserStatus, updateUserApproval, assignRole, removeRole } = useAdminData();
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.account_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleApprovalChange = async (userId: string, newStatus: string) => {
    try {
      await updateUserApproval(userId, newStatus);
      toast({
        title: "User approval updated",
        description: `User approval status changed to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: "Error updating approval",
        description: "Failed to update user approval status",
        variant: "destructive",
      });
    }
  };

  const handleRoleAction = async (userId: string, roleName: string, action: 'assign' | 'remove') => {
    try {
      if (action === 'assign') {
        await assignRole(userId, roleName);
      } else {
        await removeRole(userId, roleName);
      }
      toast({
        title: `Role ${action}ed`,
        description: `Role ${roleName} ${action}ed successfully`,
      });
    } catch (error) {
      toast({
        title: `Error ${action}ing role`,
        description: `Failed to ${action} role ${roleName}`,
        variant: "destructive",
      });
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
          <h3 className="text-xl font-semibold mb-2">Error Loading Users</h3>
          <p className="text-muted-foreground text-center">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2" />
          User Management
        </CardTitle>
        <CardDescription>
          Manage user roles, approvals, and system access
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading users...</span>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Account Type</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Approval Status</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {user.full_name || 'Unnamed User'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ID: {user.id.substring(0, 8)}...
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {user.email || 'No email'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {user.account_type || 'patient'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles.length > 0 ? (
                            user.roles.map((role) => (
                              <Badge key={role} variant="outline" className="text-xs">
                                {role}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-sm">No roles</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={`${getStatusColor(user.approval_status)} text-white`}
                        >
                          {user.approval_status || 'pending'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {user.last_activity 
                          ? new Date(user.last_activity).toLocaleDateString()
                          : 'Never'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {user.approval_status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleApprovalChange(user.id, 'approved')}
                              >
                                <UserCheck className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleApprovalChange(user.id, 'rejected')}
                              >
                                <UserX className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          {!user.roles.includes('admin') && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRoleAction(user.id, 'admin', 'assign')}
                            >
                              <Shield className="h-4 w-4 mr-1" />
                              Make Admin
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      {searchTerm ? 'No users found matching your search' : 'No users found'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {filteredUsers.length} of {users.length} users
          </span>
          <span>
            Total users with roles: {users.filter(u => u.roles.length > 0).length}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminUsersManagement;