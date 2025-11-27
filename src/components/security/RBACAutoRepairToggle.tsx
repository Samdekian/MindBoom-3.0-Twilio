
import React, { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Settings, Wrench } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RBACAutoRepairToggleProps {
  onChange?: (enabled: boolean) => void;
}

const RBACAutoRepairToggle: React.FC<RBACAutoRepairToggleProps> = ({ onChange }) => {
  const [enabled, setEnabled] = useState(false);
  const { toast } = useToast();

  const handleToggle = () => {
    try {
      const newValue = !enabled;
      setEnabled(newValue);
      
      // This would save the setting in a real app
      localStorage.setItem("rbac-auto-repair", newValue.toString());
      
      if (onChange) {
        onChange(newValue);
      }
      
      toast({
        title: newValue ? "Auto-repair enabled" : "Auto-repair disabled",
        description: newValue 
          ? "The system will automatically fix RBAC inconsistencies" 
          : "Inconsistencies will be reported but not automatically fixed",
      });
    } catch (error) {
      console.error("Error toggling auto-repair:", error);
    }
  };

  // Load saved preference on mount
  useEffect(() => {
    try {
      const savedValue = localStorage.getItem("rbac-auto-repair");
      if (savedValue !== null) {
        setEnabled(savedValue === "true");
      }
    } catch (error) {
      console.error("Error loading auto-repair setting:", error);
    }
  }, []);
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="auto-repair" className="text-base">
              <div className="flex items-center">
                <Wrench className="h-4 w-4 mr-2" />
                Auto-repair RBAC inconsistencies
              </div>
            </Label>
            <div className="text-sm text-muted-foreground">
              Automatically fix role inconsistencies when detected across the system
            </div>
          </div>
          <Switch
            id="auto-repair"
            checked={enabled}
            onCheckedChange={handleToggle}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default RBACAutoRepairToggle;
