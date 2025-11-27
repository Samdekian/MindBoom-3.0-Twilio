import React, { useState, useEffect } from "react";
import { useRoleManagement } from "@/hooks/useRoleManagement";
import { UserRole } from "@/types/core/rbac";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Search, Plus, X, Filter, Loader2 } from "lucide-react";
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

export const UserRoleTable = () => {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [availableRoles, setAvailableRoles] = useState<UserRole[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithRoles[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [accountTypeFilter, setAccountTypeFilter] = useState<string | "all">("all");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [newRoleAssignments, setNewRoleAssignments] = useState<Record<string, UserRole>>({});
  const { isLoading, assignRole, removeRole, listUsers, listRoles } = useRoleManagement();

  const fetchData = async () => {
    const usersData = await listUsers();
    const rolesData = await listRoles();
    setUsers(usersData);
    // Convert string array to UserRole array
    setAvailableRoles(asUserRoles(rolesData));
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let result = [...users];
    
    // Apply account type filter
    if (accountTypeFilter !== "all") {
      result = result.filter(user => 
        user.account_type === accountTypeFilter
      );
    }
    
    // Apply role filter
    if (roleFilter !== "all") {
      result = result.filter(user => 
        user.user_roles.some(ur => ur.roles.name === roleFilter)
      );
    }
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(user => 
        user.full_name?.toLowerCase().includes(query) || 
        user.account_type?.toLowerCase().includes(query)
      );
    }
    
    setFilteredUsers(result);
  }, [users, searchQuery, accountTypeFilter, roleFilter]);

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
  
  const getAccountTypes = () => {
    const types = new Set<string>();
    users.forEach(user => {
      if (user.account_type) {
        types.add(user.account_type);
      }
    });
    return Array.from(types);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={accountTypeFilter} onValueChange={setAccountTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Account Types</SelectItem>
              {getAccountTypes().map(type => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select 
            value={roleFilter as string} 
            onValueChange={(value) => setRoleFilter(value as UserRole | "all")}
          >
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {availableRoles.map(role => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            onClick={fetchData}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Refresh
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Account Type</TableHead>
              <TableHead>Current Roles</TableHead>
              <TableHead className="text-right">Assign Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 && (
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
            
            {filteredUsers.map((user) => {
              const userRoles = getUserRoles(user);
              return (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.full_name || "Unnamed User"}
                  </TableCell>
                  <TableCell>
                    {user.account_type && (
                      <Badge variant="outline" className="capitalize">
                        {user.account_type}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {userRoles.map((role) => (
                        <Badge key={role} className="flex items-center gap-1">
                          {role}
                          <button
                            onClick={() => handleRemoveRole(user.id, role)}
                            className="ml-1 hover:text-red-500 focus:outline-none"
                            disabled={isLoading}
                            aria-label={`Remove ${role} role`}
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
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Select
                        value={newRoleAssignments[user.id]}
                        onValueChange={(value) =>
                          setNewRoleAssignments({ ...newRoleAssignments, [user.id]: value as UserRole })
                        }
                        disabled={isLoading}
                      >
                        <SelectTrigger className="w-[120px]">
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
                        variant="outline"
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
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UserRoleTable;
