
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle, Minus, HelpCircle, Filter, Grid3X3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface PermissionLevel {
  id: string; 
  name: string;
  value: "none" | "read" | "write" | "admin";
  color: string;
  icon: React.ReactNode;
}

interface PermissionMatrixProps {
  className?: string;
}

const PermissionMatrix: React.FC<PermissionMatrixProps> = ({ className }) => {
  const [category, setCategory] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  
  // Define permission levels
  const permissionLevels: PermissionLevel[] = [
    { 
      id: "none", 
      name: "No Access",
      value: "none", 
      color: "bg-gray-100 text-gray-500 dark:bg-gray-800",
      icon: <XCircle className="h-4 w-4" />
    },
    { 
      id: "read", 
      name: "Read Only",
      value: "read", 
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      icon: <Minus className="h-4 w-4" />
    },
    { 
      id: "write", 
      name: "Read & Write",
      value: "write", 
      color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      icon: <CheckCircle2 className="h-4 w-4" />
    },
    { 
      id: "admin", 
      name: "Full Access",
      value: "admin", 
      color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      icon: <CheckCircle2 className="h-4 w-4" />
    },
  ];

  // Sample roles and permissions - in a production app, this would come from your RBAC system
  const roles = ["admin", "therapist", "patient", "support"];
  
  const permissions: Permission[] = [
    // User Management
    { id: "users-view", name: "View Users", description: "View user profiles and basic information", category: "User Management" },
    { id: "users-create", name: "Create Users", description: "Create new user accounts", category: "User Management" },
    { id: "users-edit", name: "Edit Users", description: "Modify existing user profiles", category: "User Management" },
    { id: "users-delete", name: "Delete Users", description: "Remove user accounts from the system", category: "User Management" },
    
    // Role Management
    { id: "roles-view", name: "View Roles", description: "View role definitions and assignments", category: "Role Management" },
    { id: "roles-assign", name: "Assign Roles", description: "Assign roles to users", category: "Role Management" },
    { id: "roles-create", name: "Create Roles", description: "Create new system roles", category: "Role Management" },
    { id: "roles-edit", name: "Edit Roles", description: "Modify existing role definitions", category: "Role Management" },
    
    // Calendar Management
    { id: "calendar-view", name: "View Calendar", description: "View system calendar", category: "Calendar" },
    { id: "calendar-create", name: "Create Events", description: "Add new events to calendar", category: "Calendar" },
    { id: "calendar-edit", name: "Edit Events", description: "Modify existing calendar events", category: "Calendar" },
    { id: "calendar-delete", name: "Delete Events", description: "Remove events from calendar", category: "Calendar" },
    
    // Session Management
    { id: "sessions-view", name: "View Sessions", description: "View therapy session details", category: "Sessions" },
    { id: "sessions-create", name: "Create Sessions", description: "Schedule new therapy sessions", category: "Sessions" },
    { id: "sessions-edit", name: "Edit Sessions", description: "Modify existing session details", category: "Sessions" },
    { id: "sessions-cancel", name: "Cancel Sessions", description: "Cancel scheduled therapy sessions", category: "Sessions" },
    
    // Reports
    { id: "reports-view", name: "View Reports", description: "Access system reports and analytics", category: "Reports" },
    { id: "reports-create", name: "Create Reports", description: "Generate new system reports", category: "Reports" },
    { id: "reports-export", name: "Export Reports", description: "Export reports to external formats", category: "Reports" },
    
    // System Settings
    { id: "settings-view", name: "View Settings", description: "View system configuration", category: "System" },
    { id: "settings-edit", name: "Edit Settings", description: "Modify system configuration", category: "System" },
  ];

  // Get all unique categories
  const categories = ["all", ...Array.from(new Set(permissions.map(p => p.category)))];
  
  // Role-permission matrix (sample data - would come from your RBAC system)
  const permissionMatrix: Record<string, Record<string, PermissionLevel["value"]>> = {
    admin: {
      "users-view": "admin",
      "users-create": "admin",
      "users-edit": "admin",
      "users-delete": "admin",
      "roles-view": "admin",
      "roles-assign": "admin",
      "roles-create": "admin",
      "roles-edit": "admin",
      "calendar-view": "admin",
      "calendar-create": "admin",
      "calendar-edit": "admin",
      "calendar-delete": "admin",
      "sessions-view": "admin",
      "sessions-create": "admin",
      "sessions-edit": "admin",
      "sessions-cancel": "admin",
      "reports-view": "admin",
      "reports-create": "admin",
      "reports-export": "admin",
      "settings-view": "admin",
      "settings-edit": "admin",
    },
    therapist: {
      "users-view": "read",
      "users-create": "none",
      "users-edit": "none",
      "users-delete": "none",
      "roles-view": "none",
      "roles-assign": "none",
      "roles-create": "none",
      "roles-edit": "none",
      "calendar-view": "admin",
      "calendar-create": "write",
      "calendar-edit": "write",
      "calendar-delete": "write",
      "sessions-view": "write",
      "sessions-create": "write",
      "sessions-edit": "write",
      "sessions-cancel": "write",
      "reports-view": "read",
      "reports-create": "none",
      "reports-export": "none",
      "settings-view": "read",
      "settings-edit": "none",
    },
    patient: {
      "users-view": "none",
      "users-create": "none",
      "users-edit": "none",
      "users-delete": "none",
      "roles-view": "none",
      "roles-assign": "none",
      "roles-create": "none",
      "roles-edit": "none",
      "calendar-view": "read",
      "calendar-create": "none",
      "calendar-edit": "none",
      "calendar-delete": "none",
      "sessions-view": "read",
      "sessions-create": "write",
      "sessions-edit": "none",
      "sessions-cancel": "write",
      "reports-view": "none",
      "reports-create": "none",
      "reports-export": "none",
      "settings-view": "none",
      "settings-edit": "none",
    },
    support: {
      "users-view": "read",
      "users-create": "none",
      "users-edit": "read",
      "users-delete": "none",
      "roles-view": "read",
      "roles-assign": "none",
      "roles-create": "none",
      "roles-edit": "none",
      "calendar-view": "read",
      "calendar-create": "none",
      "calendar-edit": "none",
      "calendar-delete": "none",
      "sessions-view": "read",
      "sessions-create": "none",
      "sessions-edit": "none",
      "sessions-cancel": "none",
      "reports-view": "read",
      "reports-create": "none",
      "reports-export": "none",
      "settings-view": "read",
      "settings-edit": "none",
    },
  };

  const getPermissionLevel = (role: string, permissionId: string): PermissionLevel => {
    const value = permissionMatrix[role]?.[permissionId] || "none";
    return permissionLevels.find(level => level.value === value) || permissionLevels[0];
  };

  // Filter permissions by category and search query
  const filteredPermissions = permissions.filter(permission => {
    const matchesCategory = category === "all" || permission.category === category;
    const matchesSearch = searchQuery === "" || 
      permission.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      permission.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Grid3X3 className="h-5 w-5 mr-2" />
          Permission Matrix
        </CardTitle>
        <CardDescription>
          Visual overview of which roles have access to which features
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative w-full md:w-64">
              <Input
                placeholder="Search permissions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
            
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat === "all" ? "All Categories" : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-auto">
            <Table>
              <TableCaption>
                Permission levels for each role in the system
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-64">Permission</TableHead>
                  {roles.map((role) => (
                    <TableHead key={role} className="text-center capitalize">
                      {role}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPermissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={roles.length + 1} className="h-24 text-center text-muted-foreground">
                      No permissions found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {filteredPermissions.map((permission) => (
                      <TableRow key={permission.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center justify-between">
                            <span>{permission.name}</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent side="right" className="max-w-[300px]">
                                  <p className="font-normal">{permission.description}</p>
                                  <p className="text-xs text-muted-foreground mt-1">Category: {permission.category}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                        {roles.map((role) => {
                          const permLevel = getPermissionLevel(role, permission.id);
                          return (
                            <TableCell key={`${role}-${permission.id}`} className="text-center">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className={cn("inline-flex items-center justify-center px-2 py-1 rounded-full", permLevel.color)}>
                                      {permLevel.icon}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent className="text-xs">
                                    {role} has {permLevel.name} for {permission.name}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </>
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex flex-wrap gap-2 justify-center pt-4">
            {permissionLevels.map(level => (
              <div key={level.id} className="flex items-center gap-1.5">
                <div className={cn("w-4 h-4 rounded-full flex items-center justify-center", level.color)}>
                  {level.icon}
                </div>
                <span className="text-xs">{level.name}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PermissionMatrix;
