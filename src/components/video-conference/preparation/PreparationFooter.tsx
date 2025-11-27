
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

/**
 * Props for the PreparationFooter component
 * @interface PreparationFooterProps
 * @property {Function} runNetworkTest - Function to test network connection
 * @property {Function} savePreparation - Function to save preparation settings and proceed
 * @property {boolean} isLoading - Whether any network operations are in progress
 * @property {boolean} isFullyPrepared - Whether all preparation steps have been completed
 */
interface PreparationFooterProps {
  runNetworkTest: () => Promise<void>;
  savePreparation: () => Promise<void>;
  isLoading: boolean;
  isFullyPrepared: boolean;
}

/**
 * Footer component for the session preparation screen
 * Contains controls for testing network connection and proceeding to the session
 * 
 * @param {PreparationFooterProps} props - Component properties
 * @returns {JSX.Element} - Rendered component
 */
const PreparationFooter: React.FC<PreparationFooterProps> = ({
  runNetworkTest,
  savePreparation,
  isLoading,
  isFullyPrepared
}) => {
  return (
    <div className="flex justify-between">
      <Button 
        variant="outline"
        onClick={runNetworkTest}
        disabled={isLoading}
      >
        Test Connection
      </Button>
      
      <Button 
        onClick={savePreparation}
        disabled={isLoading || !isFullyPrepared}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Continue to Session'
        )}
      </Button>
    </div>
  );
};

export default PreparationFooter;
