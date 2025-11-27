
import React from "react";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

interface WhiteboardButtonProps {
  onClick: () => void;
}

const WhiteboardButton: React.FC<WhiteboardButtonProps> = ({ onClick }) => {
  return (
    <Button 
      variant="outline" 
      size="sm"
      className="flex items-center gap-1"
      onClick={onClick}
    >
      <Pencil className="h-4 w-4" />
      <span className="hidden md:inline">Whiteboard</span>
    </Button>
  );
};

export default WhiteboardButton;
