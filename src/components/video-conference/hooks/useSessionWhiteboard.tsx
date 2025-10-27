
import { useState } from "react";

export function useSessionWhiteboard() {
  const [whiteboardOpen, setWhiteboardOpen] = useState(false);

  const openWhiteboard = () => setWhiteboardOpen(true);
  const closeWhiteboard = () => setWhiteboardOpen(false);
  const toggleWhiteboard = () => setWhiteboardOpen(prev => !prev);

  return {
    whiteboardOpen,
    setWhiteboardOpen,
    openWhiteboard,
    closeWhiteboard,
    toggleWhiteboard
  };
}
