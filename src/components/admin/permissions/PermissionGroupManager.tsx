
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Save, Trash2, Check, X } from "lucide-react";
import { PermissionGroup, Permission } from "@/types/permissions";

interface PermissionGroupManagerProps {
  groups: PermissionGroup[];
  permissions: Permission[];
  onSaveGroup: (group: PermissionGroup) => void;
}

const PermissionGroupManager: React.FC<PermissionGroupManagerProps> = ({
  groups,
  permissions,
  onSaveGroup
}) => {
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [editingGroup, setEditingGroup] = useState<PermissionGroup | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const handleCreateNewGroup = () => {
    setSelectedGroupId("");
    setIsCreatingNew(true);
    setEditingGroup({
      id: `new-${Date.now()}`,
      name: "",
      permissions: []
    });
  };
  
  const handleSelectGroup = (groupId: string) => {
    setSelectedGroupId(groupId);
    setIsCreatingNew(false);
    const group = groups.find(g => g.id === groupId);
    if (group) {
      setEditingGroup({ ...group });
    }
  };
  
  const handleSave = () => {
    if (!editingGroup) return;
    
    onSaveGroup(editingGroup);
    setIsCreatingNew(false);
    setSelectedGroupId(editingGroup.id);
  };
  
  const handleCancel = () => {
    setIsCreatingNew(false);
    setEditingGroup(null);
    setSelectedGroupId("");
  };
  
  const handleDeleteGroup = () => {
    // This would delete the group in a real implementation
    setIsDeleteDialogOpen(false);
    setSelectedGroupId("");
    setEditingGroup(null);
  };
  
  const handleAddPermission = (permissionId: string) => {
    if (!editingGroup) return;
    
    setEditingGroup({
      ...editingGroup,
      permissions: [...editingGroup.permissions, permissionId]
    });
  };
  
  const handleRemovePermission = (permissionId: string) => {
    if (!editingGroup) return;
    
    setEditingGroup({
      ...editingGroup,
      permissions: editingGroup.permissions.filter(id => id !== permissionId)
    });
  };
  
  const filteredPermissions = permissions.filter(permission => 
    permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Group permissions by category for display
  const permissionsByCategory = filteredPermissions.reduce<Record<string, Permission[]>>((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {});
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Permission Groups</h2>
        <Button onClick={handleCreateNewGroup}>
          <Plus className="h-4 w-4 mr-2" />
          New Group
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Group Selection Panel */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-muted p-4 rounded-md">
            <h3 className="text-sm font-medium mb-2">Select Group</h3>
            <div className="space-y-2">
              {groups.map(group => (
                <Button
                  key={group.id}
                  variant={selectedGroupId === group.id ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => handleSelectGroup(group.id)}
                >
                  <span className="truncate">{group.name}</span>
                  <Badge variant="outline" className="ml-auto">
                    {group.permissions.length}
                  </Badge>
                </Button>
              ))}
              
              {groups.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  No permission groups available
                </div>
              )}
            </div>
          </div>
          
          {selectedGroupId && !isCreatingNew && (
            <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Group
            </Button>
          )}
        </div>
        
        {/* Group Editor Panel */}
        <div className="lg:col-span-3">
          {editingGroup ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  {isCreatingNew ? "Create New Permission Group" : `Edit Group: ${editingGroup.name}`}
                </CardTitle>
                <CardDescription>
                  Group permissions together for easier role assignment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Group Info */}
                <div>
                  <Label htmlFor="group-name">Group Name</Label>
                  <Input 
                    id="group-name"
                    value={editingGroup.name}
                    onChange={(e) => setEditingGroup({...editingGroup, name: e.target.value})}
                    className="mb-4"
                  />
                  
                  <Label htmlFor="group-description">Description (Optional)</Label>
                  <Input 
                    id="group-description"
                    value={editingGroup.description || ""}
                    onChange={(e) => setEditingGroup({...editingGroup, description: e.target.value})}
                  />
                </div>
                
                {/* Selected Permissions */}
                <div>
                  <h3 className="font-medium mb-2">Selected Permissions</h3>
                  <div className="bg-muted p-4 rounded-md min-h-32">
                    {editingGroup.permissions.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {editingGroup.permissions.map(permissionId => {
                          const permission = permissions.find(p => p.id === permissionId);
                          return permission ? (
                            <div 
                              key={permissionId} 
                              className="bg-background flex items-center gap-1 px-3 py-1 rounded-full border"
                            >
                              <span className="text-sm">{permission.name}</span>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-5 w-5 rounded-full"
                                onClick={() => handleRemovePermission(permissionId)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : null;
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        No permissions added to this group yet
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Available Permissions */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Available Permissions</h3>
                    <Input 
                      placeholder="Search permissions..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>
                  
                  {Object.keys(permissionsByCategory).length > 0 ? (
                    <div className="space-y-4">
                      {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
                        <div key={category} className="bg-muted/50 rounded-md overflow-hidden">
                          <div className="bg-muted p-2 font-medium">{category}</div>
                          <div className="p-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                            {categoryPermissions.map(permission => {
                              const isSelected = editingGroup.permissions.includes(permission.id);
                              return (
                                <div 
                                  key={permission.id} 
                                  className={`p-2 rounded-md flex justify-between items-center ${
                                    isSelected ? "bg-primary/10" : "hover:bg-muted"
                                  }`}
                                >
                                  <div>
                                    <div className="font-medium text-sm">{permission.name}</div>
                                    <div className="text-xs text-muted-foreground">{permission.description}</div>
                                  </div>
                                  
                                  <Button 
                                    variant={isSelected ? "secondary" : "outline"} 
                                    size="sm"
                                    onClick={() => isSelected 
                                      ? handleRemovePermission(permission.id)
                                      : handleAddPermission(permission.id)
                                    }
                                  >
                                    {isSelected ? (
                                      <>
                                        <Check className="h-4 w-4 mr-1" /> Added
                                      </>
                                    ) : (
                                      <>
                                        <Plus className="h-4 w-4 mr-1" /> Add
                                      </>
                                    )}
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground bg-muted/50 rounded-md">
                      No permissions match your search
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                {isCreatingNew && (
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                )}
                <Button 
                  onClick={handleSave}
                  disabled={!editingGroup.name.trim()}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Group
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-full border-2 border-dashed rounded-lg p-12 text-center">
              <div>
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No Group Selected</h3>
                <p className="text-muted-foreground mb-4">
                  Select a permission group to edit or create a new one
                </p>
                <Button onClick={handleCreateNewGroup}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Group
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Delete Group Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the permission group
              and remove it from any roles that use it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteGroup} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PermissionGroupManager;
