
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const AuditLogsPage = () => {
  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>Audit Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is the Audit Logs Page.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogsPage;
