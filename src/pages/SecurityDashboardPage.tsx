
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const SecurityDashboardPage = () => {
  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>Security Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is the Security Dashboard Page.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityDashboardPage;
