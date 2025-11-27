
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const PermissionManagementPage = () => {
  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>Permission Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is the Permission Management Page.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PermissionManagementPage;
