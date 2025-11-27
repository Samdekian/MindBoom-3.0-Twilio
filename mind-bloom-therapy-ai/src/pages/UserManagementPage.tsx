
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const UserManagementPage = () => {
  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is the User Management Page.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagementPage;
