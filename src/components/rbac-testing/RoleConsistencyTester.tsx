
import React from 'react';
import { type RoleDiagnosticResult } from '@/types/core/rbac';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface RoleConsistencyTesterProps {
  onTest: () => Promise<RoleDiagnosticResult>;
  onRepair?: () => Promise<RoleDiagnosticResult>;
  isLoading?: boolean;
  result?: RoleDiagnosticResult | null;
}

export const RoleConsistencyTester: React.FC<RoleConsistencyTesterProps> = ({
  onTest,
  onRepair,
  isLoading = false,
  result = null
}) => {
  const [diagnosticResult, setDiagnosticResult] = React.useState<RoleDiagnosticResult | null>(result);
  const [testing, setTesting] = React.useState(false);
  const [repairing, setRepairing] = React.useState(false);

  const handleTest = async () => {
    try {
      setTesting(true);
      const result = await onTest();
      setDiagnosticResult(result);
    } finally {
      setTesting(false);
    }
  };

  const handleRepair = async () => {
    if (!onRepair) return;
    try {
      setRepairing(true);
      const result = await onRepair();
      setDiagnosticResult(result);
    } finally {
      setRepairing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-50 border-red-200 text-red-700';
      case 'high': return 'bg-orange-50 border-orange-200 text-orange-700';
      case 'medium': return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'low': return 'bg-blue-50 border-blue-200 text-blue-700';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button 
          onClick={handleTest}
          disabled={testing || isLoading}
        >
          {testing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            'Test Role Consistency'
          )}
        </Button>
        
        {onRepair && diagnosticResult && !diagnosticResult.isConsistent && (
          <Button
            onClick={handleRepair}
            disabled={repairing || isLoading}
            variant="secondary"
          >
            {repairing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Repairing...
              </>
            ) : (
              'Repair Roles'
            )}
          </Button>
        )}
      </div>

      {diagnosticResult && (
        <Alert className={getSeverityColor(diagnosticResult.severity)}>
          <AlertDescription className="space-y-2">
            <p><strong>Status:</strong> {diagnosticResult.isConsistent ? 'Consistent' : 'Inconsistent'}</p>
            <p><strong>Issue:</strong> {diagnosticResult.issue}</p>
            {diagnosticResult.errors.length > 0 && (
              <ul className="list-disc pl-5">
                {diagnosticResult.errors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            )}
            {diagnosticResult.suggestedFixes && diagnosticResult.suggestedFixes.length > 0 && (
              <div>
                <p><strong>Suggested Fixes:</strong></p>
                <ul className="list-disc pl-5">
                  {diagnosticResult.suggestedFixes.map((fix, i) => (
                    <li key={i}>{fix}</li>
                  ))}
                </ul>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default RoleConsistencyTester;
