
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRoleManagement } from "@/hooks/useRoleManagement";
import { useTherapistApproval } from "@/hooks/useTherapistApproval";
import { Shield, Users, UserCheck, Clock, AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const StatsOverview = () => {
  const { listUsers } = useRoleManagement();
  const { therapists } = useTherapistApproval();
  const [userCounts, setUserCounts] = useState({
    total: 0,
    admins: 0,
    therapists: 0,
    patients: 0
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const users = await listUsers();
        
        setUserCounts({
          total: users.length,
          admins: users.filter(user => 
            user.user_roles.some(role => role.roles.name === 'admin')
          ).length,
          therapists: users.filter(user => 
            user.user_roles.some(role => role.roles.name === 'therapist')
          ).length,
          patients: users.filter(user => 
            user.user_roles.some(role => role.roles.name === 'patient')
          ).length,
        });
      } catch (error: any) {
        console.error("Error fetching user stats:", error);
        setError(error.message || "Failed to fetch user statistics");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserStats();
  }, [listUsers]);

  const pendingTherapists = therapists.filter(t => t.approval_status === 'pending').length;

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="opacity-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="animate-pulse h-6 w-12 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Stats</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{userCounts.total}</div>
          <p className="text-xs text-muted-foreground">
            Active accounts in the system
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{userCounts.admins}</div>
          <p className="text-xs text-muted-foreground">
            Users with admin privileges
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Therapists</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{userCounts.therapists}</div>
          <p className="text-xs text-muted-foreground">
            Verified therapist accounts
          </p>
        </CardContent>
      </Card>
      
      <Card className={pendingTherapists > 0 ? "border-amber-400" : ""}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
          <Clock className={`h-4 w-4 ${pendingTherapists > 0 ? "text-amber-500" : "text-muted-foreground"}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${pendingTherapists > 0 ? "text-amber-500" : ""}`}>
            {pendingTherapists}
          </div>
          <p className="text-xs text-muted-foreground">
            Therapists awaiting approval
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsOverview;
