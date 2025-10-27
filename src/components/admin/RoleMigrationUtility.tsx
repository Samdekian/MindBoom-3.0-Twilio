
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, CheckCircle, RefreshCw } from 'lucide-react';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { useRBACIntegrity } from '@/hooks/use-rbac-integrity';
import { RoleDiagnosticResult } from '@/types/core/rbac';

const RoleMigrationUtility = () => {
  const [progress, setProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<RoleDiagnosticResult[]>([]);
  const [step, setStep] = useState<'scan' | 'review' | 'migrate'>('scan');
  const { toast } = useToast();
  const { user } = useAuthRBAC();
  const { checkAllUsers, fixAllInconsistencies, loading } = useRBACIntegrity();
  
  const handleScanUsers = async () => {
    // Remove admin check since we're allowing unrestricted access
    setIsRunning(true);
    try {
      setProgress(20);
      const scanResults = await checkAllUsers();
      setProgress(100);
      setResults(scanResults);
      setStep('review');
      
      toast({
        title: "Scan Complete",
        description: `Found ${scanResults.filter(r => !r.isConsistent).length} users with inconsistent roles.`,
      });
    } catch (error: any) {
      toast({
        title: "Error Scanning Users",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };
  
  const handleMigrateUsers = async () => {
    // Remove admin check since we're allowing unrestricted access
    setIsRunning(true);
    try {
      setProgress(30);
      await fixAllInconsistencies();
      setProgress(100);
      setStep('migrate');
      
      toast({
        title: "Migration Complete",
        description: "All users have been migrated to the new role system.",
      });
    } catch (error: any) {
      toast({
        title: "Error Migrating Users",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Role Migration Utility</CardTitle>
        <CardDescription>
          Migrate user roles to the new streamlined role system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`rounded-full p-2 ${step === 'scan' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                1
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className={`rounded-full p-2 ${step === 'review' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                2
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className={`rounded-full p-2 ${step === 'migrate' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                3
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              {step === 'scan' && "Scan Users"}
              {step === 'review' && "Review Results"}
              {step === 'migrate' && "Migration Complete"}
            </div>
          </div>
          
          {isRunning && (
            <Progress value={progress} className="h-2 w-full" />
          )}
          
          <div className="space-y-4">
            {step === 'scan' && (
              <Button 
                onClick={handleScanUsers} 
                disabled={isRunning || loading}
                className="w-full"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  "Scan for Inconsistent Roles"
                )}
              </Button>
            )}
            
            {step === 'review' && (
              <>
                <div className="rounded-md bg-muted p-4">
                  <p className="font-medium">Scan Results</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>Total users scanned: {results.length}</li>
                    <li>Inconsistent roles: {results.filter(r => !r.isConsistent).length}</li>
                    <li>Ready for migration: {results.filter(r => !r.isConsistent && !r.repaired).length}</li>
                  </ul>
                </div>
                
                <Button 
                  onClick={handleMigrateUsers} 
                  disabled={isRunning || loading || !results.some(r => !r.isConsistent)}
                  className="w-full"
                >
                  {isRunning ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Migrating...
                    </>
                  ) : (
                    "Migrate Users to New Role System"
                  )}
                </Button>
              </>
            )}
            
            {step === 'migrate' && (
              <div className="rounded-md bg-green-50 p-4 border border-green-200 flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <p className="text-green-700">Migration completed successfully.</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoleMigrationUtility;
