
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Zap, Eye, Filter, Download } from "lucide-react";

interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
}

interface Role {
  id: string;
  name: string;
  permissions: string[];
}

interface PermissionNode {
  id: string;
  label: string;
  type: 'permission' | 'resource' | 'action' | 'role';
  group?: string;
  parentId?: string;
  children?: PermissionNode[];
}

interface PermissionsVisualizationProps {
  onPermissionSelect?: (permissionId: string) => void;
}

export const PermissionsVisualization: React.FC<PermissionsVisualizationProps> = ({
  onPermissionSelect
}) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'hierarchy' | 'matrix'>('hierarchy');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedResource, setSelectedResource] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { toast } = useToast();
  
  // Fetch permissions and roles data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch permissions
        const { data: permissionsData, error: permissionsError } = await supabase
          .from('permissions')
          .select('*');
          
        if (permissionsError) throw permissionsError;
        setPermissions(permissionsData || []);
        
        // Fetch roles with their permissions
        const { data: rolesData, error: rolesError } = await supabase
          .from('roles')
          .select('id, name');
          
        if (rolesError) throw rolesError;
        
        // Fetch role-permission mappings
        const { data: mappingsData, error: mappingsError } = await supabase
          .from('role_permissions')
          .select('role_id, permission_id');
          
        if (mappingsError) throw mappingsError;
        
        // Merge roles with their permissions
        const rolesWithPermissions = rolesData.map((role) => ({
          id: role.id,
          name: role.name,
          permissions: mappingsData
            .filter((mapping) => mapping.role_id === role.id)
            .map((mapping) => mapping.permission_id)
        }));
        
        setRoles(rolesWithPermissions);
      } catch (error) {
        console.error('Error fetching permissions data:', error);
        toast({
          title: 'Error loading permissions',
          description: 'There was a problem fetching the permissions data.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);
  
  // Filter permissions based on search and selected role/resource
  const filteredPermissions = permissions.filter((permission) => {
    const matchesSearch = searchTerm === '' || 
      permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.action.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesResource = !selectedResource || permission.resource === selectedResource;
    
    const matchesRole = !selectedRole || 
      roles.find(role => role.id === selectedRole)?.permissions.includes(permission.id);
      
    return matchesSearch && matchesResource && matchesRole;
  });
  
  // Extract unique resources for filtering
  const resources = Array.from(new Set(permissions.map(p => p.resource)))
    .filter(Boolean)
    .sort();
  
  // Build permission hierarchy for visualization
  const buildPermissionHierarchy = (): PermissionNode[] => {
    // Group permissions by resource
    const resourceNodes: Record<string, PermissionNode> = {};
    
    // First create resource nodes
    filteredPermissions.forEach(permission => {
      if (!resourceNodes[permission.resource]) {
        resourceNodes[permission.resource] = {
          id: `resource-${permission.resource}`,
          label: permission.resource,
          type: 'resource',
          children: []
        };
      }
      
      // Add permission to its resource
      resourceNodes[permission.resource].children!.push({
        id: permission.id,
        label: permission.name,
        type: 'permission',
        parentId: `resource-${permission.resource}`,
        group: permission.action
      });
    });
    
    // Return as array sorted by resource name
    return Object.values(resourceNodes).sort((a, b) => a.label.localeCompare(b.label));
  };
  
  // Build permission matrix data for role-based view
  const buildPermissionMatrix = () => {
    const matrix: {
      resource: string;
      permissions: {
        id: string;
        name: string;
        action: string;
        roles: string[];
      }[];
    }[] = [];
    
    // Group by resource first
    const resourceGroups: Record<string, Permission[]> = {};
    filteredPermissions.forEach(permission => {
      if (!resourceGroups[permission.resource]) {
        resourceGroups[permission.resource] = [];
      }
      resourceGroups[permission.resource].push(permission);
    });
    
    // For each resource, create matrix entries
    Object.entries(resourceGroups).forEach(([resource, perms]) => {
      matrix.push({
        resource,
        permissions: perms.map(p => ({
          id: p.id,
          name: p.name,
          action: p.action,
          roles: roles
            .filter(role => role.permissions.includes(p.id))
            .map(role => role.name)
        }))
      });
    });
    
    return matrix;
  };
  
  // Handle permission click
  const handlePermissionClick = (permissionId: string) => {
    if (onPermissionSelect) {
      onPermissionSelect(permissionId);
    }
  };
  
  // Download permissions data as CSV
  const downloadPermissionsData = () => {
    try {
      // Create headers for CSV
      const headers = ['Resource', 'Permission', 'Action', 'Roles'];
      
      // Create rows for CSV
      const rows = filteredPermissions.map(permission => {
        const permRoles = roles
          .filter(role => role.permissions.includes(permission.id))
          .map(role => role.name)
          .join(', ');
          
        return [
          permission.resource,
          permission.name,
          permission.action,
          permRoles
        ];
      });
      
      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'permissions-export.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'Export complete',
        description: 'Permissions data has been exported to CSV.'
      });
    } catch (error) {
      console.error('Error exporting permissions data:', error);
      toast({
        title: 'Export failed',
        description: 'There was a problem exporting the permissions data.',
        variant: 'destructive'
      });
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Permissions Visualization</CardTitle>
            <CardDescription>
              Visualize and explore permission assignments across roles
            </CardDescription>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant={viewMode === 'hierarchy' ? 'default' : 'outline'}
              size="sm"
              className="flex items-center gap-1"
              onClick={() => setViewMode('hierarchy')}
            >
              <Zap className="h-4 w-4 mr-1" />
              Hierarchy View
            </Button>
            
            <Button 
              variant={viewMode === 'matrix' ? 'default' : 'outline'}
              size="sm"
              className="flex items-center gap-1"
              onClick={() => setViewMode('matrix')}
            >
              <Eye className="h-4 w-4 mr-1" />
              Matrix View
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={downloadPermissionsData}
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 p-6">
        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search permissions..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select
            value={selectedRole || ''}
            onValueChange={(value) => setSelectedRole(value || null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Roles</SelectItem>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={selectedResource || ''}
            onValueChange={(value) => setSelectedResource(value || null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by resource" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Resources</SelectItem>
              {resources.map((resource) => (
                <SelectItem key={resource} value={resource}>
                  {resource}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredPermissions.length === 0 ? (
          <div className="text-center py-8 border rounded-md">
            <p className="text-muted-foreground">
              No permissions found matching your criteria
            </p>
            <Button 
              variant="link" 
              className="mt-2"
              onClick={() => {
                setSearchTerm('');
                setSelectedRole(null);
                setSelectedResource(null);
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : viewMode === 'hierarchy' ? (
          <div className="space-y-6 border p-4 rounded-md">
            {buildPermissionHierarchy().map((resourceNode) => (
              <div key={resourceNode.id} className="space-y-2">
                <div className="font-medium text-lg pb-1 border-b">
                  {resourceNode.label}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-2">
                  {resourceNode.children!.map((permissionNode) => (
                    <Card 
                      key={permissionNode.id}
                      className="overflow-hidden hover:border-primary transition-colors cursor-pointer"
                      onClick={() => handlePermissionClick(permissionNode.id)}
                    >
                      <CardHeader className="p-3 pb-1">
                        <div className="flex justify-between items-start gap-2">
                          <CardTitle className="text-sm">{permissionNode.label}</CardTitle>
                          <Badge variant="outline" className="text-xs">
                            {permissionNode.group}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 pt-1">
                        <div className="flex flex-wrap gap-1 mt-2">
                          {roles
                            .filter(role => role.permissions.includes(permissionNode.id))
                            .map(role => (
                              <Badge key={role.id} variant="secondary" className="text-xs">
                                {role.name}
                              </Badge>
                            ))
                          }
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {buildPermissionMatrix().map((resource) => (
              <Card key={resource.resource} className="overflow-hidden">
                <CardHeader className="bg-muted/50 p-3">
                  <CardTitle className="text-lg">{resource.resource}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-medium">Permission</th>
                          <th className="text-left p-3 font-medium">Action</th>
                          <th className="text-left p-3 font-medium">Roles</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resource.permissions.map((permission) => (
                          <tr 
                            key={permission.id}
                            className="border-b hover:bg-muted/50 cursor-pointer"
                            onClick={() => handlePermissionClick(permission.id)}
                          >
                            <td className="p-3">{permission.name}</td>
                            <td className="p-3">
                              <Badge variant="outline">{permission.action}</Badge>
                            </td>
                            <td className="p-3">
                              <div className="flex flex-wrap gap-1">
                                {permission.roles.length > 0 ? (
                                  permission.roles.map((role, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {role}
                                    </Badge>
                                  ))
                                ) : (
                                  <span className="text-muted-foreground text-xs">No roles assigned</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        <div className="flex justify-between items-center pt-2">
          <p className="text-sm text-muted-foreground">
            Showing {filteredPermissions.length} of {permissions.length} permissions
          </p>
          
          <Button 
            variant="ghost" 
            size="sm"
            className="flex items-center gap-1"
            onClick={() => {
              setSearchTerm('');
              setSelectedRole(null);
              setSelectedResource(null);
            }}
          >
            <Filter className="h-4 w-4 mr-1" />
            Reset Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PermissionsVisualization;
