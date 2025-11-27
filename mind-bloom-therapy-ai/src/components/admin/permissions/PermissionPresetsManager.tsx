
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
import { Textarea } from "@/components/ui/textarea";
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
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Plus, Save, Trash2, Check, Copy, Settings } from "lucide-react";
import { Permission, PermissionPreset, PermissionLevel } from "@/types/permissions";

interface PermissionPresetsManagerProps {
  presets: PermissionPreset[];
  permissions: Permission[];
  onSavePreset: (preset: PermissionPreset) => void;
}

const PermissionPresetsManager: React.FC<PermissionPresetsManagerProps> = ({
  presets,
  permissions,
  onSavePreset
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>("");
  const [editingPreset, setEditingPreset] = useState<PermissionPreset | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  const handleCreateNewPreset = () => {
    setSelectedPresetId("");
    setIsCreatingNew(true);
    setEditingPreset({
      id: `new-${Date.now()}`,
      name: "",
      description: "",
      permissions: {}
    });
  };
  
  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    setIsCreatingNew(false);
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      setEditingPreset({ ...preset });
    }
  };
  
  const handleSave = () => {
    if (!editingPreset) return;
    
    onSavePreset(editingPreset);
    setIsCreatingNew(false);
    setSelectedPresetId(editingPreset.id);
  };
  
  const handleCancel = () => {
    setIsCreatingNew(false);
    setEditingPreset(null);
    setSelectedPresetId("");
  };
  
  const handleDeletePreset = () => {
    // This would delete the preset in a real implementation
    setIsDeleteDialogOpen(false);
    setSelectedPresetId("");
    setEditingPreset(null);
  };
  
  const handleCopyPreset = () => {
    if (!editingPreset) return;
    
    setEditingPreset({
      ...editingPreset,
      id: `new-${Date.now()}`,
      name: `${editingPreset.name} (Copy)`
    });
    setIsCreatingNew(true);
  };
  
  const handlePermissionLevelChange = (permissionId: string, level: PermissionLevel) => {
    if (!editingPreset) return;
    
    if (level === "none") {
      const { [permissionId]: _, ...restPermissions } = editingPreset.permissions;
      setEditingPreset({
        ...editingPreset,
        permissions: restPermissions
      });
    } else {
      setEditingPreset({
        ...editingPreset,
        permissions: {
          ...editingPreset.permissions,
          [permissionId]: level
        }
      });
    }
  };
  
  // Group permissions by category for display
  const permissionsByCategory = permissions.reduce<Record<string, Permission[]>>((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {});
  
  // Filter permissions based on search term
  const filteredCategories = Object.entries(permissionsByCategory)
    .filter(([_, categoryPermissions]) => 
      searchTerm === "" || categoryPermissions.some(permission => 
        permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permission.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    .reduce<Record<string, Permission[]>>((acc, [category, permissions]) => {
      acc[category] = searchTerm === "" 
        ? permissions 
        : permissions.filter(permission => 
            permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            permission.description.toLowerCase().includes(searchTerm.toLowerCase())
          );
      return acc;
    }, {});
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Permission Presets
        </h2>
        <Button onClick={handleCreateNewPreset}>
          <Plus className="h-4 w-4 mr-2" />
          New Preset
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Preset Selection Panel */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-muted p-4 rounded-md">
            <h3 className="text-sm font-medium mb-2">Select Preset</h3>
            <div className="space-y-2">
              {presets.map(preset => (
                <Button
                  key={preset.id}
                  variant={selectedPresetId === preset.id ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => handleSelectPreset(preset.id)}
                >
                  <span className="truncate">{preset.name}</span>
                  <Badge variant="outline" className="ml-auto">
                    {Object.keys(preset.permissions).length}
                  </Badge>
                </Button>
              ))}
              
              {presets.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  No permission presets available
                </div>
              )}
            </div>
          </div>
          
          {selectedPresetId && !isCreatingNew && (
            <div className="space-y-2">
              <Button variant="outline" className="w-full" onClick={handleCopyPreset}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Preset
              </Button>
              <Button variant="destructive" className="w-full" onClick={() => setIsDeleteDialogOpen(true)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Preset
              </Button>
            </div>
          )}
        </div>
        
        {/* Preset Editor Panel */}
        <div className="lg:col-span-3">
          {editingPreset ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  {isCreatingNew ? "Create New Preset" : `Edit Preset: ${editingPreset.name}`}
                </CardTitle>
                <CardDescription>
                  Create reusable permission presets to quickly assign to roles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Preset Info */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="preset-name">Preset Name</Label>
                    <Input 
                      id="preset-name"
                      value={editingPreset.name}
                      onChange={(e) => setEditingPreset({...editingPreset, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="preset-description">Description</Label>
                    <Textarea 
                      id="preset-description"
                      value={editingPreset.description}
                      onChange={(e) => setEditingPreset({...editingPreset, description: e.target.value})}
                    />
                  </div>
                </div>
                
                <Separator />
                
                {/* Permission Assignment */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Permissions</h3>
                    <Input
                      placeholder="Search permissions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="bg-muted p-2 flex justify-between rounded-md mb-2">
                      <span className="font-medium">Permission</span>
                      <span className="font-medium">Access Level</span>
                    </div>
                    
                    <Accordion 
                      type="multiple" 
                      defaultValue={Object.keys(filteredCategories)}
                      className="space-y-2"
                    >
                      {Object.entries(filteredCategories).map(([category, categoryPermissions]) => (
                        <AccordionItem 
                          key={category} 
                          value={category}
                          className="border rounded-lg overflow-hidden"
                        >
                          <AccordionTrigger className="px-4 py-2 hover:no-underline hover:bg-muted/50">
                            <div className="flex items-center">
                              <span>{category}</span>
                              <Badge variant="secondary" className="ml-2">
                                {categoryPermissions.length}
                              </Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pt-1 pb-0">
                            <div className="divide-y">
                              {categoryPermissions.map((permission) => (
                                <div 
                                  key={permission.id}
                                  className="flex justify-between items-center p-4 hover:bg-muted/30"
                                >
                                  <div className="flex-1">
                                    <div className="font-medium text-sm">{permission.name}</div>
                                    <div className="text-xs text-muted-foreground">{permission.description}</div>
                                  </div>
                                  <Select
                                    value={editingPreset.permissions[permission.id] || "none"}
                                    onValueChange={(value) => handlePermissionLevelChange(
                                      permission.id, 
                                      value as PermissionLevel
                                    )}
                                  >
                                    <SelectTrigger className="w-28">
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
                    
                    {Object.keys(filteredCategories).length === 0 && (
                      <div className="text-center py-8 bg-muted/30 rounded-lg">
                        <h3 className="text-lg font-medium mb-1">No matching permissions</h3>
                        <p className="text-sm text-muted-foreground">
                          Try adjusting your search criteria
                        </p>
                      </div>
                    )}
                  </div>
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
                  disabled={!editingPreset.name.trim()}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Preset
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-full border-2 border-dashed rounded-lg p-12 text-center">
              <div>
                <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Preset Selected</h3>
                <p className="text-muted-foreground mb-4">
                  Select a permission preset to edit or create a new one
                </p>
                <Button onClick={handleCreateNewPreset}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Preset
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Delete Preset Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the permission preset.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePreset} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PermissionPresetsManager;
