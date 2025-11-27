
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, X, Search, Edit, Save, CheckCircle, ShieldAlert, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string;
  category: string;
}

interface RolePermissionMapping {
  role: string;
  roleId: string;
  permissionId: string;
}

const PermissionManager: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermissionMapping[]>([]);
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterResource, setFilterResource] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [resources, setResources] = useState<string[]>([]);
  const { toast } = useToast();

  // Load permissions and roles
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch all permissions
        const { data: permsData, error: permsError } = await supabase
          .from('permissions')
          .select('*')
          .order('category', { ascending: true })
          .order('resource', { ascending: true })
          .order('action', { ascending: true });
          
        if (permsError) throw permsError;
        setPermissions(permsData || []);
        
        // Extract unique categories and resources for filtering
        const uniqueCategories = [...new Set(permsData?.map(p => p.category) || [])].filter(Boolean);
        const uniqueResources = [...new Set(permsData?.map(p => p.resource) || [])].filter(Boolean);
        
        setCategories(uniqueCategories as string[]);
        setResources(uniqueResources as string[]);

        // Fetch all roles
        const { data: rolesData, error: rolesError } = await supabase
          .from('roles')
          .select('id, name')
          .order('name', { ascending: true });
          
        if (rolesError) throw rolesError;
        setRoles(rolesData || []);

        // Fetch role-permission mappings
        const { data: mappingsData, error: mappingsError } = await supabase
          .from('role_permissions')
          .select('role_id, permission_id');
          
        if (mappingsError) throw mappingsError;

        // Format the mappings with role names for easier use
        const formattedMappings = mappingsData?.map(mapping => {
          const role = rolesData?.find(r => r.id === mapping.role_id);
          return {
            roleId: mapping.role_id,
            role: role?.name || 'Unknown',
            permissionId: mapping.permission_id
          };
        }) || [];
        
        setRolePermissions(formattedMappings);
      } catch (err: any) {
        console.error('Error fetching permission data:', err);
        toast({
          title: 'Error loading permissions',
          description: err.message || 'There was a problem loading the permission data',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Filter permissions based on search term and category/resource filters
  const filteredPermissions = permissions.filter(permission => {
    const matchesSearch = !searchTerm ? true : (
      permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.action.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesCategory = !filterCategory ? true : 
      permission.category === filterCategory;
      
    const matchesResource = !filterResource ? true : 
      permission.resource === filterResource;
    
    return matchesSearch && matchesCategory && matchesResource;
  });

  // Toggle role permission assignment
  const toggleRolePermission = async (roleId: string, permissionId: string, isAssigned: boolean) => {
    try {
      if (isAssigned) {
        // Remove permission from role
        const { error } = await supabase
          .from('role_permissions')
          .delete()
          .eq('role_id', roleId)
          .eq('permission_id', permissionId);
          
        if (error) throw error;
        
        // Update local state
        setRolePermissions(prev => 
          prev.filter(mapping => !(mapping.roleId === roleId && mapping.permissionId === permissionId))
        );
        
        toast({
          title: 'Permission removed',
          description: 'The permission was successfully removed from the role',
        });
      } else {
        // Assign permission to role
        const { error } = await supabase
          .from('role_permissions')
          .insert({ role_id: roleId, permission_id: permissionId });
          
        if (error) throw error;
        
        // Update local state
        const roleName = roles.find(r => r.id === roleId)?.name || 'Unknown';
        setRolePermissions(prev => [
          ...prev, 
          { roleId, role: roleName, permissionId }
        ]);
        
        toast({
          title: 'Permission assigned',
          description: 'The permission was successfully assigned to the role',
        });
      }
    } catch (err: any) {
      console.error('Error updating permission:', err);
      toast({
        title: 'Error updating permission',
        description: err.message || 'There was a problem updating the role permission',
        variant: 'destructive'
      });
    }
  };

  // Check if a permission is assigned to a role
  const isPermissionAssigned = (roleId: string, permissionId: string) => {
    return rolePermissions.some(
      mapping => mapping.roleId === roleId && mapping.permissionId === permissionId
    );
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilterCategory(null);
    setFilterResource(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Permission Management</CardTitle>
              <CardDescription>
                Manage role permissions and access control settings
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="px-2 py-1">
                {permissions.length} Permissions
              </Badge>
              <Badge variant="outline" className="px-2 py-1">
                {roles.length} Roles
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search permissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <Select 
              value={filterCategory || ""} 
              onValueChange={(val) => setFilterCategory(val || null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select 
              value={filterResource || ""} 
              onValueChange={(val) => setFilterResource(val || null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by resource" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Resources</SelectItem>
                {resources.map(resource => (
                  <SelectItem key={resource} value={resource}>
                    {resource}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-1"
              onClick={resetFilters}
            >
              <Filter className="h-4 w-4 mr-1" />
              Reset Filters
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground mt-2">Loading permissions...</span>
              </div>
            </div>
          ) : (
            <div className="border rounded-md overflow-x-auto">
              <Table>
                <TableCaption>List of available permissions and role assignments</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Permission</TableHead>
                    <TableHead className="w-[120px]">Resource</TableHead>
                    <TableHead className="w-[100px]">Action</TableHead>
                    <TableHead className="w-[120px]">Category</TableHead>
                    <TableHead className="min-w-[300px]">Description</TableHead>
                    <TableHead>Assigned Roles</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPermissions.length > 0 ? (
                    filteredPermissions.map((permission) => (
                      <TableRow key={permission.id}>
                        <TableCell className="font-medium">{permission.name}</TableCell>
                        <TableCell>{permission.resource}</TableCell>
                        <TableCell>{permission.action}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{permission.category}</Badge>
                        </TableCell>
                        <TableCell>{permission.description || '-'}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {roles.map((role) => {
                              const assigned = isPermissionAssigned(role.id, permission.id);
                              return (
                                <Badge 
                                  key={role.id}
                                  variant={assigned ? "default" : "outline"}
                                  className={cn(
                                    "cursor-pointer transition-colors",
                                    assigned ? "bg-primary" : "hover:bg-primary/20"
                                  )}
                                  onClick={() => toggleRolePermission(role.id, permission.id, assigned)}
                                >
                                  {role.name}
                                  {assigned ? (
                                    <X className="ml-1 h-3 w-3" />
                                  ) : (
                                    <Plus className="ml-1 h-3 w-3" />
                                  )}
                                </Badge>
                              );
                            })}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No permissions found matching your filters
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PermissionManager;
