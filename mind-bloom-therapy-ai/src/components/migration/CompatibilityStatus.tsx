
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useCompatibilityValidator } from '@/utils/migration/compatibility-validator';

const CompatibilityStatus = () => {
  const { validate, isReady } = useCompatibilityValidator();
  
  const result = validate();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Compatibility</CardTitle>
        <CardDescription>Check system compatibility status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          {result.isCompatible ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-500" />
              <Badge variant="default">Compatible</Badge>
            </>
          ) : (
            <>
              <XCircle className="h-5 w-5 text-red-500" />
              <Badge variant="destructive">Issues Found</Badge>
            </>
          )}
        </div>
        
        {result.issues.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Issues:</h4>
            <ul className="space-y-1">
              {result.issues.map((issue, index) => (
                <li key={index} className="text-sm text-red-600">{issue}</li>
              ))}
            </ul>
          </div>
        )}
        
        {result.recommendations.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Recommendations:</h4>
            <ul className="space-y-1">
              {result.recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-amber-600">{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CompatibilityStatus;
