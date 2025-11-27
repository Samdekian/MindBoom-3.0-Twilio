
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const RoleManagementPage = () => {
  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>Role Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is the Role Management Page.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleManagementPage;
