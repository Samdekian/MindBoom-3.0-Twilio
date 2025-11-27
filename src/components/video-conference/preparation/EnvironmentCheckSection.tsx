
import React from "react";
import { Button } from "@/components/ui/button";
import { Check, Wifi } from "lucide-react";

interface EnvironmentCheckSectionProps {
  environmentChecklist: {
    network: boolean;
    lighting: boolean;
    noise: boolean;
  };
  updateEnvironmentChecklist: (key: "network" | "lighting" | "noise", value: boolean) => void;
}

const EnvironmentCheckSection: React.FC<EnvironmentCheckSectionProps> = ({
  environmentChecklist,
  updateEnvironmentChecklist
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Environment Check</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button 
          variant={environmentChecklist.network ? "default" : "outline"} 
          className="h-auto py-6 flex flex-col items-center justify-center space-y-2"
          onClick={() => updateEnvironmentChecklist("network", !environmentChecklist.network)}
        >
          <Wifi className="h-8 w-8" />
          <span>Network</span>
          {environmentChecklist.network && <Check className="h-4 w-4 text-white" />}
        </Button>
        
        <Button 
          variant={environmentChecklist.lighting ? "default" : "outline"} 
          className="h-auto py-6 flex flex-col items-center justify-center space-y-2"
          onClick={() => updateEnvironmentChecklist("lighting", !environmentChecklist.lighting)}
        >
          <span className="text-2xl">💡</span>
          <span>Lighting</span>
          {environmentChecklist.lighting && <Check className="h-4 w-4 text-white" />}
        </Button>
        
        <Button 
          variant={environmentChecklist.noise ? "default" : "outline"} 
          className="h-auto py-6 flex flex-col items-center justify-center space-y-2"
          onClick={() => updateEnvironmentChecklist("noise", !environmentChecklist.noise)}
        >
          <span className="text-2xl">🔇</span>
          <span>Background Noise</span>
          {environmentChecklist.noise && <Check className="h-4 w-4 text-white" />}
        </Button>
      </div>
    </div>
  );
};

export default EnvironmentCheckSection;
