
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useSessionMaterials } from "@/hooks/use-session-materials";
import { FileText, Plus, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";

interface SessionMaterialsProps {
  appointmentId: string;
}

const SessionMaterials = ({ appointmentId }: SessionMaterialsProps) => {
  const { user } = useAuthRBAC();
  const { materials, isLoading, addMaterial, updateMaterial } = useSessionMaterials(appointmentId);
  const [isCreating, setIsCreating] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    title: '',
    description: '',
    content: '',
    material_type: 'homework' as const,
    due_date: '',
  });

  const handleCreateMaterial = async () => {
    if (!newMaterial.title.trim() || !user?.id) return;
    
    await addMaterial.mutateAsync({
      ...newMaterial,
      appointment_id: appointmentId,
      therapist_id: user.id, // Add the required therapist_id
    });
    setNewMaterial({
      title: '',
      description: '',
      content: '',
      material_type: 'homework',
      due_date: '',
    });
    setIsCreating(false);
  };

  const handleToggleComplete = async (material: any) => {
    await updateMaterial.mutateAsync({
      id: material.id,
      is_completed: !material.is_completed,
      completed_at: !material.is_completed ? new Date().toISOString() : null,
    });
  };

  const getMaterialTypeColor = (type: string) => {
    switch (type) {
      case 'homework': return 'default';
      case 'reading': return 'secondary';
      case 'exercise': return 'outline';
      case 'assessment': return 'destructive';
      case 'resource': return 'outline';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          <h3 className="text-xl font-bold">Session Materials</h3>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Material
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Add Session Material</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Material title"
              value={newMaterial.title}
              onChange={(e) => setNewMaterial(prev => ({ ...prev, title: e.target.value }))}
            />
            <Select value={newMaterial.material_type} onValueChange={(value: any) => setNewMaterial(prev => ({ ...prev, material_type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Material Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="homework">Homework</SelectItem>
                <SelectItem value="reading">Reading</SelectItem>
                <SelectItem value="exercise">Exercise</SelectItem>
                <SelectItem value="assessment">Assessment</SelectItem>
                <SelectItem value="resource">Resource</SelectItem>
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Description"
              value={newMaterial.description}
              onChange={(e) => setNewMaterial(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
            <Textarea
              placeholder="Content"
              value={newMaterial.content}
              onChange={(e) => setNewMaterial(prev => ({ ...prev, content: e.target.value }))}
              rows={4}
            />
            <Input
              type="date"
              placeholder="Due date (optional)"
              value={newMaterial.due_date}
              onChange={(e) => setNewMaterial(prev => ({ ...prev, due_date: e.target.value }))}
            />
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateMaterial} disabled={addMaterial.isPending}>
                Add Material
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {materials?.map((material) => (
          <Card key={material.id} className={material.is_completed ? "opacity-75" : ""}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={material.is_completed || false}
                    onCheckedChange={() => handleToggleComplete(material)}
                    className="mt-1"
                  />
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {material.title}
                      {material.is_completed && <CheckCircle className="h-5 w-5 text-green-500" />}
                    </CardTitle>
                    <CardDescription>
                      {material.description}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant={getMaterialTypeColor(material.material_type)}>
                    {material.material_type}
                  </Badge>
                  {material.due_date && (
                    <Badge variant="outline">
                      Due: {format(new Date(material.due_date), "MMM dd")}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            {material.content && (
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">{material.content}</p>
                {material.completed_at && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Completed on {format(new Date(material.completed_at), "MMM dd, yyyy 'at' h:mm a")}
                  </p>
                )}
              </CardContent>
            )}
          </Card>
        ))}
        
        {materials?.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Materials</h3>
              <p className="text-muted-foreground text-center">
                No session materials have been added yet.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SessionMaterials;
