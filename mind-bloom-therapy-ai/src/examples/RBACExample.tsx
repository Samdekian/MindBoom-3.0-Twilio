
import React, { useState } from 'react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Check, Users, ShieldAlert, ShieldCheck } from "lucide-react";

// Simplified example component for RBAC functionality
export const RBACExample = () => {
  const [permissions, setPermissions] = useState([
    { id: "1", name: "read:posts", granted: true },
    { id: "2", name: "write:posts", granted: false },
    { id: "3", name: "delete:posts", granted: false },
    { id: "4", name: "admin:posts", granted: false },
  ]);

  const [role, setRole] = useState<'user' | 'editor' | 'admin'>('user');
  
  // Simulated permission grant/revoke handler
  const togglePermission = (id: string) => {
    setPermissions(permissions.map(perm => 
      perm.id === id ? { ...perm, granted: !perm.granted } : perm
    ));
  };
  
  // Simulated role change handler
  const changeRole = (newRole: 'user' | 'editor' | 'admin') => {
    setRole(newRole);
    
    // Update permissions based on role
    let newPermissions = [...permissions];
    
    if (newRole === 'user') {
      newPermissions = newPermissions.map(p => ({
        ...p, 
        granted: p.name === 'read:posts'
      }));
    } else if (newRole === 'editor') {
      newPermissions = newPermissions.map(p => ({
        ...p, 
        granted: p.name === 'read:posts' || p.name === 'write:posts'
      }));
    } else if (newRole === 'admin') {
      newPermissions = newPermissions.map(p => ({
        ...p, granted: true
      }));
    }
    
    setPermissions(newPermissions);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Role-Based Access</CardTitle>
              <CardDescription>Current role: {role.toUpperCase()}</CardDescription>
            </div>
            <Badge variant={role === 'admin' ? 'default' : 'outline'}>
              {role === 'user' && <Users className="h-3 w-3 mr-1" />}
              {role === 'editor' && <ShieldCheck className="h-3 w-3 mr-1" />}
              {role === 'admin' && <ShieldAlert className="h-3 w-3 mr-1" />}
              {role.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {role === 'user' && (
              <Alert variant="default" className="bg-blue-50 dark:bg-blue-900/20">
                <AlertTitle>Basic User Access</AlertTitle>
                <AlertDescription>
                  You have read-only permissions across the platform.
                </AlertDescription>
              </Alert>
            )}
            
            {role === 'editor' && (
              <Alert variant="default" className="bg-green-50 dark:bg-green-900/20">
                <AlertTitle>Editor Access Granted</AlertTitle>
                <AlertDescription>
                  You can create and edit content in addition to viewing it.
                </AlertDescription>
              </Alert>
            )}
            
            {role === 'admin' && (
              <Alert variant="warning">
                <AlertTitle>Administrator Access</AlertTitle>
                <AlertDescription>
                  You have full access to all platform features and settings.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="grid gap-2">
              <h3 className="text-sm font-medium">Your Permissions</h3>
              <div className="grid gap-1">
                {permissions.map(permission => (
                  <div key={permission.id} className="flex items-center justify-between p-2 border rounded-md">
                    <span className="text-sm">{permission.name}</span>
                    {permission.granted ? (
                      <Badge variant="outline" className="bg-green-50 text-green-600 hover:bg-green-50 border-green-200">
                        <Check className="h-3 w-3 mr-1" />
                        Granted
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-400 border-gray-200">
                        Not Granted
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start space-y-2 md:flex-row md:justify-between md:space-x-0 md:space-y-0 border-t pt-4">
          <span className="text-xs text-muted-foreground">
            Change your role to see how permissions work
          </span>
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant={role === 'user' ? "default" : "outline"}
              onClick={() => changeRole('user')}
            >
              User
            </Button>
            <Button 
              size="sm" 
              variant={role === 'editor' ? "default" : "outline"}
              onClick={() => changeRole('editor')}
            >
              Editor
            </Button>
            <Button 
              size="sm" 
              variant={role === 'admin' ? "default" : "outline"}
              onClick={() => changeRole('admin')}
            >
              Admin
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RBACExample;
