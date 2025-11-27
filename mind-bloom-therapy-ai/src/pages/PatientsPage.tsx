
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useRequireAuth from '@/hooks/useRequireAuth';
import PageLoader from '@/components/PageLoader';

const PatientsPage: React.FC = () => {
  const { loading } = useRequireAuth();

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Patients</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Patients page placeholder</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientsPage;
