
import React, { useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useTherapistApproval } from "@/hooks/useTherapistApproval";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminDashboardHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const AdminDashboardHeader = ({ activeTab, onTabChange }: AdminDashboardHeaderProps) => {
  const { therapists, fetchTherapists } = useTherapistApproval();
  const pendingCount = therapists.filter(t => t.approval_status === 'pending').length;
  
  // Ensure we fetch therapists when this component mounts
  useEffect(() => {
    fetchTherapists();
  }, []);
  
  // Function to switch to therapists tab when notification is clicked
  const handleNotificationClick = () => {
    onTabChange('therapists');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage users, roles, therapist approvals, and view reports
          </p>
        </div>
        
        {/* Notification button for pending therapists */}
        {pendingCount > 0 && activeTab !== 'therapists' && (
          <Button 
            variant="outline"
            size="sm"
            className="flex items-center gap-2 bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400"
            onClick={handleNotificationClick}
          >
            <Bell className="h-4 w-4" />
            <span>{pendingCount} pending {pendingCount === 1 ? 'therapist' : 'therapists'}</span>
          </Button>
        )}
      </div>
      
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="therapists" className="relative">
            Therapist Approvals
            {pendingCount > 0 && (
              <Badge variant="destructive" className="ml-2 absolute -top-2 -right-2 h-5 min-w-5 flex items-center justify-center">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="reports">
            Reports
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default AdminDashboardHeader;
