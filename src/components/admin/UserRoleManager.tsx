
import React, { useEffect, useState } from "react";
import { useRoleManagement } from "@/hooks/useRoleManagement";
import { UserRole } from "@/types/core/rbac";
import {
  Table,
  TableBody,
  TableCaption,
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, X } from "lucide-react";
import { asUserRoles } from "@/utils/rbac/type-adapters";

interface UserWithRoles {
  id: string;
  full_name: string | null;
  account_type: string | null;
  user_roles: {
    roles: {
      id: string;
      name: string;
    };
  }[];
}

export const UserRoleManager: React.FC = () => {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [availableRoles, setAvailableRoles] = useState<UserRole[]>([]);
  const [newRoleAssignments, setNewRoleAssignments] = useState<Record<string, UserRole>>({});
  const { isLoading, assignRole, removeRole, listUsers, listRoles } = useRoleManagement();

  const fetchData = async () => {
    const usersData = await listUsers();
    const rolesData = await listRoles();
    setUsers(usersData as UserWithRoles[]);
    // Convert string array to UserRole array
    setAvailableRoles(asUserRoles(rolesData));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignRole = async (userId: string) => {
    const role = newRoleAssignments[userId];
    if (!role) return;

    const success = await assignRole(userId, role);
    if (success) {
      // Clear the selection and refresh the user list
      setNewRoleAssignments(prev => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
      fetchData();
    }
  };

  const handleRemoveRole = async (userId: string, role: UserRole) => {
    const success = await removeRole(userId, role);
    if (success) {
      fetchData();
    }
  };

  const getUserRoles = (user: UserWithRoles): UserRole[] => {
    if (!user.user_roles) return [];
    // Convert string array to UserRole array
    return asUserRoles(user.user_roles.map(ur => ur.roles.name));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Role Management</h2>
        <Button
          onClick={fetchData}
          variant="outline"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Refresh
        </Button>
      </div>

      <Table>
        <TableCaption>Manage user roles across the platform</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Account Type</TableHead>
            <TableHead>Current Roles</TableHead>
            <TableHead>Assign New Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const userRoles = getUserRoles(user);
            return (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.full_name || "Unnamed User"}
                </TableCell>
                <TableCell>{user.account_type || "Unknown"}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    {userRoles.map((role) => (
                      <Badge key={role} className="flex items-center gap-1">
                        {role}
                        <button
                          onClick={() => handleRemoveRole(user.id, role)}
                          className="ml-1 hover:text-red-500"
                          disabled={isLoading}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                    {userRoles.length === 0 && (
                      <span className="text-muted-foreground text-sm">No roles assigned</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Select
                      value={newRoleAssignments[user.id]}
                      onValueChange={(value) =>
                        setNewRoleAssignments({ ...newRoleAssignments, [user.id]: value as UserRole })
                      }
                      disabled={isLoading}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRoles
                          .filter(role => !userRoles.includes(role))
                          .map(role => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      disabled={!newRoleAssignments[user.id] || isLoading}
                      onClick={() => handleAssignRole(user.id)}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Assign
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
          {users.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                {isLoading ? (
                  <div className="flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  "No users found"
                )}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserRoleManager;
