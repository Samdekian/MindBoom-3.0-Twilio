
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const AdminNotice = () => {
  return (
    <Alert variant="warning" className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 mb-4">
      <AlertTriangle className="h-4 w-4 text-amber-500" />
      <AlertTitle className="text-amber-700 dark:text-amber-400 font-medium">Development Mode Warning</AlertTitle>
      <AlertDescription className="text-amber-600 dark:text-amber-300">
        This admin dashboard is using a service role key that bypasses RLS policies.
        <strong className="block mt-1">This approach should never be used in production.</strong>
      </AlertDescription>
    </Alert>
  );
};

export default AdminNotice;
