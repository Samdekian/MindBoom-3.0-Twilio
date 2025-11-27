
import React from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Create a browser-safe version of the component without actual test imports
const VitestSetup: React.FC = () => {
  return (
    <div className="space-y-4">
      <Alert variant="default">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Vitest Configuration</AlertTitle>
        <AlertDescription>
          Vitest is configured for this project. Tests run in test environments, not in the browser.
        </AlertDescription>
      </Alert>
      
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Running Tests</h3>
        <p className="text-sm text-muted-foreground">
          Tests can be run using the command line with <code>npm test</code>. 
          Test files are excluded from the browser bundle.
        </p>
        
        <div className="bg-slate-900 text-slate-50 p-4 rounded-md mt-4">
          <div className="font-mono text-sm">
            <div>// Example of a test file structure:</div>
            <div>import {'{ describe, it, expect }'} from 'vitest';</div>
            <div>import {'{ render, screen }'} from '@testing-library/react';</div>
            <div>import MyComponent from './MyComponent';</div>
            <div></div>
            <div>describe('MyComponent', () =&gt; {'{'}</div>
            <div>&nbsp;&nbsp;it('renders correctly', () =&gt; {'{'}</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;render({'<MyComponent />'});</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;expect(screen.getByText(/hello/i)).toBeInTheDocument();</div>
            <div>&nbsp;&nbsp;{'}'});</div>
            <div>{'}'});</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VitestSetup;
