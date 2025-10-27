
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Loader2, Shield, ChevronRight, Search, Filter } from "lucide-react";
import { Permission, PermissionGroup, PermissionHierarchy } from "@/types/permissions";

interface PermissionHierarchyViewProps {
  permissions: Permission[];
  permissionGroups: PermissionGroup[];
}

const PermissionHierarchyView: React.FC<PermissionHierarchyViewProps> = ({
  permissions,
  permissionGroups
}) => {
  const [hierarchy, setHierarchy] = useState<PermissionHierarchy[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  
  // Build the permission hierarchy
  useEffect(() => {
    setIsLoading(true);
    
    // Convert permission groups to hierarchy nodes
    const groupNodes: PermissionHierarchy[] = permissionGroups.map(group => ({
      id: `group:${group.id}`,
      name: group.name,
      level: 0,
      children: []
    }));
    
    // For each group, add its permissions as children
    groupNodes.forEach(groupNode => {
      const group = permissionGroups.find(g => `group:${g.id}` === groupNode.id);
      if (group) {
        group.permissions.forEach(permissionId => {
          const permission = permissions.find(p => p.id === permissionId);
          if (permission) {
            groupNode.children.push({
              id: permission.id,
              name: permission.name,
              parent: groupNode.id,
              level: 1,
              children: []
            });
          }
        });
      }
    });
    
    // Add standalone permissions (not in any group)
    const groupedPermissionIds = new Set(
      permissionGroups.flatMap(group => group.permissions)
    );
    
    const standalonePermissions = permissions
      .filter(permission => !groupedPermissionIds.has(permission.id))
      .map(permission => ({
        id: permission.id,
        name: permission.name,
        level: 0,
        children: []
      }));
    
    setHierarchy([...groupNodes, ...standalonePermissions]);
    setIsLoading(false);
  }, [permissions, permissionGroups]);
  
  // Filter the hierarchy based on search term and category
  const filteredHierarchy = hierarchy.filter(node => {
    // Check if this node or any of its children match the search term
    const nodeMatches = 
      node.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const childrenMatch = node.children.some(child => 
      child.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Check category filter if it's a permission
    const matchesCategory = categoryFilter === "" || 
      (!node.id.startsWith('group:') && 
        permissions.find(p => p.id === node.id)?.category === categoryFilter);
    
    // Groups always pass the category filter if any of their permissions match
    const isGroupWithMatchingPermissions = 
      node.id.startsWith('group:') && 
      (categoryFilter === "" || 
        node.children.some(child => {
          const permission = permissions.find(p => p.id === child.id);
          return permission && permission.category === categoryFilter;
        }));
    
    return (nodeMatches || childrenMatch) && 
           (matchesCategory || isGroupWithMatchingPermissions);
  });
  
  // Get all unique categories for filtering
  const categories = Array.from(
    new Set(permissions.map(permission => permission.category))
  ).sort();
  
  // Render a node and its children
  const renderNode = (node: PermissionHierarchy, depth: number = 0) => {
    const isGroup = node.id.startsWith('group:');
    const permission = isGroup ? null : permissions.find(p => p.id === node.id);
    
    return (
      <div key={node.id} className="mb-1">
        <div 
          className={`
            flex items-center p-3 rounded-md 
            ${isGroup ? 'bg-muted' : 'bg-muted/30'}
            ${depth > 0 ? 'ml-6' : ''}
          `}
        >
          {isGroup ? (
            <Shield className="h-5 w-5 mr-2 text-primary" />
          ) : (
            <ChevronRight className="h-5 w-5 mr-2 text-muted-foreground" />
          )}
          
          <div className="flex-1">
            <div className="font-medium">{node.name}</div>
            {permission && (
              <div className="text-sm text-muted-foreground">{permission.description}</div>
            )}
          </div>
          
          {permission && (
            <Badge variant="outline">{permission.category}</Badge>
          )}
          
          {isGroup && node.children.length > 0 && (
            <Badge variant="outline" className="ml-2">{node.children.length}</Badge>
          )}
        </div>
        
        {node.children.length > 0 && (
          <div className="border-l-2 border-muted ml-4 pl-2 mt-1">
            {node.children
              .filter(child => {
                // Apply search term filter to children
                if (!searchTerm) return true;
                return child.name.toLowerCase().includes(searchTerm.toLowerCase());
              })
              .filter(child => {
                // Apply category filter to children
                if (!categoryFilter) return true;
                const childPermission = permissions.find(p => p.id === child.id);
                return childPermission && childPermission.category === categoryFilter;
              })
              .map(child => renderNode(child, depth + 1))
            }
          </div>
        )}
      </div>
    );
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Permission Hierarchy
        </CardTitle>
        <CardDescription>
          Visualize the structure of permissions and permission groups
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search permissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="w-full sm:w-64">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full">
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Categories" />
                </div>
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
          </div>
        </div>
        
        {/* Hierarchy View */}
        <div className="space-y-2">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="mt-2 text-sm text-muted-foreground">
                  Loading permission hierarchy...
                </span>
              </div>
            </div>
          ) : filteredHierarchy.length > 0 ? (
            filteredHierarchy.map(node => renderNode(node))
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-1">No matching permissions</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PermissionHierarchyView;
