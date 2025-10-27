
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, CheckCircle2, Info } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { repairInconsistentUsers, repairSpecificUser } from "@/utils/rbac/user-repair-utility";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface RepairResult {
  processed: number;
  repaired: number;
  failed: number;
  details: Array<{
    userId: string;
    name: string;
    status: string;
    message: string;
  }>;
}

const UserRoleRepair: React.FC = () => {
  const [isRepairing, setIsRepairing] = useState(false);
  const [results, setResults] = useState<RepairResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleRepair = async () => {
    setIsRepairing(true);
    setError(null);
    try {
      const response = await repairInconsistentUsers();
      
      if (!response.success) {
        setError(response.error || 'An unknown error occurred');
        toast({
          variant: "destructive",
          title: "Repair Failed",
          description: response.error || 'An unknown error occurred during repair'
        });
      } else {
        setResults(response.results);
        toast({
          title: "Repair Complete",
          description: `Fixed ${response.results.repaired} user roles out of ${response.results.processed} processed.`
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast({
        variant: "destructive",
        title: "Repair Failed",
        description: err instanceof Error ? err.message : 'An unexpected error occurred'
      });
    } finally {
      setIsRepairing(false);
    }
  };

  const handleSpecificRepair = async (userId: string) => {
    if (!results) return;
    
    setIsRepairing(true);
    try {
      const response = await repairSpecificUser(userId);
      
      if (response.success) {
        // Update the details to reflect the repair
        setResults(prev => {
          if (!prev) return null;
          
          const newDetails = prev.details.map(detail => {
            if (detail.userId === userId) {
              return { 
                ...detail,
                status: 'repaired',
                message: response.message
              };
            }
            return detail;
          });
          
          return {
            ...prev,
            repaired: prev.repaired + 1,
            details: newDetails
          };
        });
        
        toast({
          title: "User Repaired",
          description: response.message
        });
      } else {
        toast({
          variant: "destructive",
          title: "User Repair Failed",
          description: response.message
        });
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "User Repair Failed",
        description: err instanceof Error ? err.message : 'An unexpected error occurred'
      });
    } finally {
      setIsRepairing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'repaired':
      case 'manually_repaired':
        return <Badge className="bg-green-500">Repaired</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'already_consistent':
        return <Badge className="bg-blue-500">Consistent</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>User Role Repair Utility</CardTitle>
        <CardDescription>
          Fix inconsistencies between user profiles and role assignments
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {results && (
          <Alert className="mb-4" variant={results.failed > 0 ? "destructive" : "default"}>
            <Info className="h-4 w-4" />
            <AlertTitle>Repair Results</AlertTitle>
            <AlertDescription>
              Processed {results.processed} users, repaired {results.repaired} users
              {results.failed > 0 && `, failed to repair ${results.failed} users`}.
            </AlertDescription>
          </Alert>
        )}

        {results && results.details.length > 0 && (
          <div className="overflow-x-auto mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.details.map((detail, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {detail.name || detail.userId}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(detail.status)}
                    </TableCell>
                    <TableCell>{detail.message}</TableCell>
                    <TableCell className="text-right">
                      {detail.status === 'failed' && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleSpecificRepair(detail.userId)}
                          disabled={isRepairing}
                        >
                          Retry
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleRepair} 
          disabled={isRepairing}
          className="w-full"
        >
          {isRepairing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Repairing...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Find and Fix Role Inconsistencies
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UserRoleRepair;
