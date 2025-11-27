
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const TwoFactorAuthPage = () => {
  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is the Two-Factor Authentication Page.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TwoFactorAuthPage;
