import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Pen, Eraser, Circle, Square, Type, Image,
  Undo, Redo, Trash2, PaintBucket, Download, Save
} from "lucide-react";

// Create our own Line and Rectangle components since they don't exist in lucide-react
const Line = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M5 19L19 5" />
  </svg>
);

const Rectangle = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
  </svg>
);

interface WhiteboardProps {
  initialData?: any[];
  onChange?: (data: any[]) => void;
  className?: string;
  sessionId?: string;
  userId?: string;
  loading?: boolean;
  onClose?: () => void;
}

const Whiteboard: React.FC<WhiteboardProps> = ({
  initialData = [],
  onChange = () => {},
  className = "",
  sessionId = "default-session",
  userId = "anonymous",
  loading = false,
  onClose
}) => {
  const [drawing, setDrawing] = useState(false);
  const [selectedTool, setSelectedTool] = useState("pen");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(2);
  const [data, setData] = useState<any[]>(initialData);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [history, setHistory] = useState<any[][]>([initialData]);
  const [historyStep, setHistoryStep] = useState(0);
  const [isEraserOn, setIsEraserOn] = useState(false);
  const [isFilling, setIsFilling] = useState(false);
  const [selectedTab, setSelectedTab] = useState("tools");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Load initial data
    if (initialData && initialData.length > 0) {
      redrawCanvas(context, initialData);
    }

    // Cleanup function
    return () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [initialData]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    redrawCanvas(context, data);
    onChange(data);
  }, [data, onChange]);

  const redrawCanvas = (context: CanvasRenderingContext2D, data: any[]) => {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    data.forEach((item) => {
      context.strokeStyle = item.strokeColor;
      context.lineWidth = item.lineWidth;
      if (item.type === "pen") {
        context.beginPath();
        context.moveTo(item.from.x, item.from.y);
        context.lineTo(item.to.x, item.to.y);
        context.stroke();
      } else if (item.type === "line") {
        context.beginPath();
        context.moveTo(item.from.x, item.from.y);
        context.lineTo(item.to.x, item.to.y);
        context.stroke();
      } else if (item.type === "circle") {
        context.beginPath();
        context.arc(
          item.from.x,
          item.from.y,
          Math.sqrt(
            Math.pow(item.to.x - item.from.x, 2) +
              Math.pow(item.to.y - item.from.y, 2)
          ),
          0,
          2 * Math.PI
        );
        context.stroke();
      } else if (item.type === "rectangle") {
        context.beginPath();
        context.rect(
          item.from.x,
          item.from.y,
          item.to.x - item.from.x,
          item.to.y - item.from.y
        );
        context.stroke();
      }
    });
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    if (selectedTool === "eraser") {
      setIsEraserOn(true);
    } else if (selectedTool === "fill") {
      setIsFilling(true);
    } else {
      context.strokeStyle = strokeColor;
      context.lineWidth = lineWidth;
      context.beginPath();
      context.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    if (selectedTool === "pen") {
      context.lineTo(x, y);
      context.stroke();
      setData((prev) => [
        ...prev,
        {
          type: "pen",
          from: { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY },
          to: { x, y },
          strokeColor,
          lineWidth,
        },
      ]);
    } else if (selectedTool === "line") {
      setData((prev) => [
        ...prev,
        {
          type: "line",
          from: { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY },
          to: { x, y },
          strokeColor,
          lineWidth,
        },
      ]);
    } else if (selectedTool === "circle") {
      setData((prev) => [
        ...prev,
        {
          type: "circle",
          from: { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY },
          to: { x, y },
          strokeColor,
          lineWidth,
        },
      ]);
    } else if (selectedTool === "rectangle") {
      setData((prev) => [
        ...prev,
        {
          type: "rectangle",
          from: { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY },
          to: { x, y },
          strokeColor,
          lineWidth,
        },
      ]);
    }
  };

  const stopDrawing = () => {
    setDrawing(false);
    setIsEraserOn(false);
    setIsFilling(false);

    setHistory((prev) => {
      const newHistory = [...prev.slice(0, historyStep + 1), data];
      return newHistory;
    });
    setHistoryStep((prev) => prev + 1);
  };

  const handleUndo = () => {
    if (historyStep > 0) {
      setHistoryStep((prev) => prev - 1);
      setData(history[historyStep - 1]);
    }
  };

  const handleRedo = () => {
    if (historyStep < history.length - 1) {
      setHistoryStep((prev) => prev + 1);
      setData(history[historyStep + 1]);
    }
  };

  const handleClear = () => {
    setData([]);
    setHistory([[]]);
    setHistoryStep(0);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = "whiteboard.png";
    link.click();
  };

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
      <div className="absolute top-2 left-2 z-10">
        <Tabs defaultValue="tools" className="space-y-4">
          <TabsList>
            <TabsTrigger value="tools">Tools</TabsTrigger>
            <TabsTrigger value="options">Options</TabsTrigger>
          </TabsList>
          <TabsContent value="tools">
            <div className="bg-secondary p-3 rounded-md space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedTool("pen")}
                  className={selectedTool === "pen" ? "bg-muted" : ""}
                >
                  <Pen className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedTool("line")}
                  className={selectedTool === "line" ? "bg-muted" : ""}
                >
                  <Line className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedTool("circle")}
                  className={selectedTool === "circle" ? "bg-muted" : ""}
                >
                  <Circle className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedTool("rectangle")}
                  className={selectedTool === "rectangle" ? "bg-muted" : ""}
                >
                  <Rectangle className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedTool("eraser")}
                  className={selectedTool === "eraser" ? "bg-muted" : ""}
                >
                  <Eraser className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedTool("fill")}
                  className={selectedTool === "fill" ? "bg-muted" : ""}
                >
                  <PaintBucket className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleUndo}
                  disabled={historyStep === 0}
                >
                  <Undo className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRedo}
                  disabled={historyStep === history.length - 1}
                >
                  <Redo className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClear}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="options">
            <div className="bg-secondary p-3 rounded-md space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Stroke Color
                </label>
                <input
                  type="color"
                  value={strokeColor}
                  onChange={(e) => setStrokeColor(e.target.value)}
                  className="w-full h-10 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Line Width
                </label>
                <Slider
                  defaultValue={[lineWidth]}
                  max={20}
                  min={1}
                  step={1}
                  onValueChange={(value) => setLineWidth(value[0])}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <canvas
        className="whiteboard-canvas bg-white rounded-md"
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onMouseMove={drawing ? draw : () => {}}
      />
    </div>
  );
};

export default Whiteboard;
