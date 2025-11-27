
import React from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Search, Edit, Trash2, UserPlus } from "lucide-react";
import { useAuthRBAC } from '@/contexts/AuthRBACContext';

const UserManagementPage = () => {
  const { user } = useAuthRBAC();

  // Mock user data
  const users = [
    {
      id: "1",
      name: "Dr. Jane Smith",
      email: "jane.smith@example.com",
      role: "Therapist",
      status: "Active",
      lastLogin: "2024-01-15",
      joinDate: "2023-06-01"
    },
    {
      id: "2",
      name: "John Doe",
      email: "john.doe@example.com",
      role: "Patient",
      status: "Active",
      lastLogin: "2024-01-14",
      joinDate: "2023-08-15"
    },
    {
      id: "3",
      name: "Admin User",
      email: "admin@example.com",
      role: "Admin",
      status: "Active",
      lastLogin: "2024-01-15",
      joinDate: "2023-01-01"
    },
    {
      id: "4",
      name: "Support Agent",
      email: "support@example.com",
      role: "Support",
      status: "Active",
      lastLogin: "2024-01-13",
      joinDate: "2023-09-01"
    }
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-red-500';
      case 'Therapist':
        return 'bg-blue-500';
      case 'Patient':
        return 'bg-green-500';
      case 'Support':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-500';
      case 'Inactive':
        return 'bg-yellow-500';
      case 'Suspended':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Helmet>
        <title>User Management | Admin Dashboard</title>
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold">User Management</h1>
              <p className="text-muted-foreground">
                Manage users, roles, and permissions
              </p>
            </div>
          </div>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name, email, or role..."
                  className="pl-10"
                />
              </div>
              <Button variant="outline">Filter</Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              {users.length} total users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((userData) => (
                <div key={userData.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {userData.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">{userData.name}</div>
                      <div className="text-sm text-muted-foreground">{userData.email}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Last Login</div>
                      <div className="text-sm">{userData.lastLogin}</div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={`${getRoleColor(userData.role)} text-white`}>
                        {userData.role}
                      </Badge>
                      <Badge className={`${getStatusColor(userData.status)} text-white`}>
                        {userData.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserManagementPage;
