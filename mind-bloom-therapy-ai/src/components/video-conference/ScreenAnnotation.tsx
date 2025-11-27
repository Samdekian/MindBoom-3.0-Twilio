
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Palette, Eraser, Undo, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ScreenAnnotationProps {
  active: boolean;
  onClose: () => void;
}

const ScreenAnnotation: React.FC<ScreenAnnotationProps> = ({ 
  active, 
  onClose 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#ff0000"); // Default color: red
  const [brushSize, setBrushSize] = useState(5);
  const [isEraser, setIsEraser] = useState(false);
  const [undoStack, setUndoStack] = useState<ImageData[]>([]);
  const { toast } = useToast();
  
  const colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#ffffff"];
  
  // Initialize canvas when component mounts or active state changes
  useEffect(() => {
    if (!active || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Setup canvas size
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.lineWidth = brushSize;
      ctx.strokeStyle = color;
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    // Save initial state for undo
    const initialState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setUndoStack([initialState]);
    
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [active, color, brushSize]);
  
  // Handle mouse events for drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    
    setIsDrawing(true);
    
    // Save current state for undo
    const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setUndoStack(prev => [...prev, currentState]);
  };
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = isEraser ? 'rgba(0,0,0,0)' : color;
    ctx.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over';
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };
  
  const stopDrawing = () => {
    setIsDrawing(false);
  };
  
  // Undo the last stroke
  const handleUndo = () => {
    if (undoStack.length <= 1 || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Remove the last state
    const newStack = [...undoStack];
    newStack.pop();
    
    // Apply the previous state
    const previousState = newStack[newStack.length - 1];
    ctx.putImageData(previousState, 0, 0);
    
    setUndoStack(newStack);
  };
  
  // Toggle eraser mode
  const toggleEraser = () => {
    setIsEraser(prev => !prev);
  };
  
  // Save canvas as image
  const saveAsImage = () => {
    if (!canvasRef.current) return;
    
    try {
      const canvas = canvasRef.current;
      const image = canvas.toDataURL("image/png");
      
      // Create a download link
      const link = document.createElement('a');
      link.href = image;
      link.download = `annotation-${new Date().toISOString()}.png`;
      link.click();
      
      toast({
        title: "Image Saved",
        description: "Your screen annotation has been downloaded"
      });
    } catch (err) {
      console.error("Error saving annotation:", err);
      toast({
        title: "Save Failed",
        description: "Could not save the annotation",
        variant: "destructive"
      });
    }
  };
  
  if (!active) return null;
  
  return (
    <div className="fixed inset-0 z-50 pointer-events-auto">
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="absolute inset-0 cursor-crosshair"
      />
      
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Button
          variant="secondary"
          size="icon"
          onClick={onClose}
          className="rounded-full bg-background/80 backdrop-blur-sm shadow-lg"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-background/80 backdrop-blur-sm rounded-lg shadow-lg p-2 flex items-center gap-2">
        <div className="flex gap-1">
          {colors.map(c => (
            <button
              key={c}
              className={`w-6 h-6 rounded-full ${color === c && !isEraser ? 'ring-2 ring-offset-1' : ''}`}
              style={{ backgroundColor: c }}
              onClick={() => { setColor(c); setIsEraser(false); }}
            />
          ))}
        </div>
        
        <div className="h-6 w-px bg-gray-300"></div>
        
        <Button
          variant={isEraser ? "secondary" : "ghost"}
          size="icon"
          onClick={toggleEraser}
          className={`h-8 w-8 ${isEraser ? 'bg-primary/20' : ''}`}
        >
          <Eraser className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleUndo}
          disabled={undoStack.length <= 1}
          className="h-8 w-8"
        >
          <Undo className="h-4 w-4" />
        </Button>
        
        <div className="h-6 w-px bg-gray-300"></div>
        
        <input
          type="range"
          min="1"
          max="20"
          value={brushSize}
          onChange={e => setBrushSize(parseInt(e.target.value))}
          className="w-24 h-1.5"
        />
        
        <div className="h-6 w-px bg-gray-300"></div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={saveAsImage}
          className="h-8 w-8"
        >
          <Save className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ScreenAnnotation;
