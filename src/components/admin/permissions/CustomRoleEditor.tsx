
import React, { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { Separator } from "@/components/ui/separator";
import { Plus, Users, Save, Trash2, Check, X, Copy } from "lucide-react";
import { CustomRole, Permission, PermissionGroup, PermissionLevel } from "@/types/permissions";

interface CustomRoleEditorProps {
  roles: CustomRole[];
  permissionGroups: PermissionGroup[];
  permissions: Permission[];
  onSaveRole: (role: CustomRole) => void;
}

const CustomRoleEditor: React.FC<CustomRoleEditorProps> = ({
  roles,
  permissionGroups,
  permissions,
  onSaveRole
}) => {
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState<boolean>(false);
  const [editingRole, setEditingRole] = useState<CustomRole | null>(null);
  
  // Reset or set the editing role when selection changes
  useEffect(() => {
    if (isCreatingNew) {
      setEditingRole({
        id: `new-${Date.now()}`,
        name: "",
        description: "",
        permissionGroups: [],
        permissions: {}
      });
    } else if (selectedRoleId) {
      const role = roles.find(r => r.id === selectedRoleId);
      if (role) {
        setEditingRole({ ...role });
      }
    } else {
      setEditingRole(null);
    }
  }, [selectedRoleId, isCreatingNew, roles]);
  
  const handleCreateNewRole = () => {
    setSelectedRoleId("");
    setIsCreatingNew(true);
  };
  
  const handleSave = () => {
    if (!editingRole) return;
    
    onSaveRole(editingRole);
    setIsCreatingNew(false);
    setSelectedRoleId(editingRole.id);
  };
  
  const handleCancel = () => {
    setIsCreatingNew(false);
    setEditingRole(null);
  };
  
  const handlePermissionLevelChange = (permissionId: string, level: PermissionLevel) => {
    if (!editingRole) return;
    
    setEditingRole({
      ...editingRole,
      permissions: {
        ...editingRole.permissions,
        [permissionId]: level
      }
    });
  };
  
  const handleGroupLevelChange = (groupId: string, level: PermissionLevel) => {
    if (!editingRole) return;
    
    setEditingRole({
      ...editingRole,
      permissions: {
        ...editingRole.permissions,
        [`group:${groupId}`]: level
      }
    });
  };
  
  const handleAddPermissionGroup = (groupId: string) => {
    if (!editingRole) return;
    
    setEditingRole({
      ...editingRole,
      permissionGroups: [...editingRole.permissionGroups, groupId]
    });
  };
  
  const handleRemovePermissionGroup = (groupId: string) => {
    if (!editingRole) return;
    
    setEditingRole({
      ...editingRole,
      permissionGroups: editingRole.permissionGroups.filter(id => id !== groupId)
    });
  };
  
  const handleDeleteRole = () => {
    // This would delete the role in a real implementation
    setIsDeleteDialogOpen(false);
    setSelectedRoleId("");
    setEditingRole(null);
  };
  
  const handleCopyRole = () => {
    if (!editingRole) return;
    
    const newRole: CustomRole = {
      ...editingRole,
      id: `new-${Date.now()}`,
      name: `${editingRole.name} (Copy)`,
      isSystemRole: false
    };
    
    setEditingRole(newRole);
    setIsCreatingNew(true);
    setIsCopyDialogOpen(false);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Custom Roles
        </h2>
        <Button onClick={handleCreateNewRole}>
          <Plus className="h-4 w-4 mr-2" />
          New Role
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Role Selection Panel */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-muted p-4 rounded-md">
            <h3 className="text-sm font-medium mb-2">Select Role</h3>
            <div className="space-y-2">
              {roles.map(role => (
                <Button
                  key={role.id}
                  variant={selectedRoleId === role.id ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => {
                    setSelectedRoleId(role.id);
                    setIsCreatingNew(false);
                  }}
                >
                  <span className="truncate">{role.name}</span>
                  {role.isSystemRole && (
                    <Badge variant="outline" className="ml-auto">System</Badge>
                  )}
                </Button>
              ))}
              
              {roles.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  No roles available. Create a new role to get started.
                </div>
              )}
            </div>
          </div>
          
          {selectedRoleId && !isCreatingNew && (
            <div className="flex flex-col gap-2">
              <Button variant="outline" onClick={() => setIsCopyDialogOpen(true)}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Role
              </Button>
              
              {!editingRole?.isSystemRole && (
                <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Role
                </Button>
              )}
            </div>
          )}
        </div>
        
        {/* Role Editor Panel */}
        <div className="lg:col-span-3">
          {editingRole ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  {isCreatingNew ? "Create New Role" : `Edit Role: ${editingRole.name}`}
                </CardTitle>
                <CardDescription>
                  {isCreatingNew 
                    ? "Create a custom role with specific permissions" 
                    : "Modify permissions for this role"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Role Info */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="role-name">Role Name</Label>
                    <Input 
                      id="role-name"
                      value={editingRole.name}
                      onChange={(e) => setEditingRole({...editingRole, name: e.target.value})}
                      disabled={editingRole.isSystemRole}
                    />
                  </div>
                  <div>
                    <Label htmlFor="role-description">Description</Label>
                    <Textarea 
                      id="role-description"
                      value={editingRole.description}
                      onChange={(e) => setEditingRole({...editingRole, description: e.target.value})}
                      disabled={editingRole.isSystemRole}
                    />
                  </div>
                </div>
                
                <Separator />
                
                {/* Permission Groups */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Permission Groups</h3>
                    <Select 
                      onValueChange={(value) => handleAddPermissionGroup(value)}
                      disabled={editingRole.isSystemRole}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Add group" />
                      </SelectTrigger>
                      <SelectContent>
                        {permissionGroups
                          .filter(group => !editingRole.permissionGroups.includes(group.id))
                          .map(group => (
                            <SelectItem key={group.id} value={group.id}>
                              {group.name}
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {editingRole.permissionGroups.length > 0 ? (
                    <div className="space-y-4">
                      {editingRole.permissionGroups.map(groupId => {
                        const group = permissionGroups.find(g => g.id === groupId);
                        if (!group) return null;
                        
                        return (
                          <div key={groupId} className="bg-muted/50 rounded-md p-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-medium">{group.name}</h4>
                                <p className="text-sm text-muted-foreground">{group.permissions.length} permissions</p>
                              </div>
                              <div className="flex gap-2 items-center">
                                <Select
                                  value={editingRole.permissions[`group:${groupId}`] || "none"}
                                  onValueChange={(value) => handleGroupLevelChange(groupId, value as PermissionLevel)}
                                  disabled={editingRole.isSystemRole}
                                >
                                  <SelectTrigger className="w-[100px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    <SelectItem value="read">Read</SelectItem>
                                    <SelectItem value="write">Write</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                  </SelectContent>
                                </Select>
                                
                                {!editingRole.isSystemRole && (
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => handleRemovePermissionGroup(groupId)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No permission groups assigned to this role.
                    </div>
                  )}
                </div>
                
                <Separator />
                
                {/* Individual Permissions */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Individual Permissions</h3>
                  
                  <Accordion type="multiple" className="w-full">
                    {Object.entries(
                      permissions.reduce<Record<string, Permission[]>>((acc, permission) => {
                        if (!acc[permission.category]) {
                          acc[permission.category] = [];
                        }
                        acc[permission.category].push(permission);
                        return acc;
                      }, {})
                    ).map(([category, categoryPermissions]) => (
                      <AccordionItem value={category} key={category}>
                        <AccordionTrigger className="hover:bg-muted/50 px-4 py-2">
                          {category}
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 p-2">
                            {categoryPermissions.map((permission) => (
                              <div 
                                key={permission.id}
                                className="flex justify-between items-center p-2 hover:bg-muted/30 rounded-md"
                              >
                                <div>
                                  <div className="font-medium">{permission.name}</div>
                                  <div className="text-sm text-muted-foreground">{permission.description}</div>
                                </div>
                                <Select
                                  value={editingRole.permissions[permission.id] || "none"}
                                  onValueChange={(value) => handlePermissionLevelChange(permission.id, value as PermissionLevel)}
                                  disabled={editingRole.isSystemRole}
                                >
                                  <SelectTrigger className="w-[100px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    <SelectItem value="read">Read</SelectItem>
                                    <SelectItem value="write">Write</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
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
                  disabled={editingRole.isSystemRole || !editingRole.name.trim()}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Role
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-full border-2 border-dashed rounded-lg p-12 text-center">
              <div>
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Role Selected</h3>
                <p className="text-muted-foreground mb-4">
                  Select a role to edit or create a new one
                </p>
                <Button onClick={handleCreateNewRole}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Role
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Delete Role Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the role and
              remove it from any users who have it assigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRole} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Copy Role Dialog */}
      <AlertDialog open={isCopyDialogOpen} onOpenChange={setIsCopyDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Copy Role</AlertDialogTitle>
            <AlertDialogDescription>
              This will create a copy of the selected role with all its permissions.
              You can then modify it as needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCopyRole}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CustomRoleEditor;
