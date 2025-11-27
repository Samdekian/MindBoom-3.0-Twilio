
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FilterControlsProps {
  filter: string;
  setFilter: (value: string) => void;
  userFilter: string;
  setUserFilter: (value: string) => void;
  roleFilter: string;
  setRoleFilter: (value: string) => void;
  uniqueRoles: string[];
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  filter,
  setFilter,
  userFilter,
  setUserFilter,
  roleFilter,
  setRoleFilter,
  uniqueRoles
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-4">
      <Tabs defaultValue="all" value={filter} onValueChange={setFilter} className="w-full md:w-auto">
        <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
          <TabsTrigger value="all">All Actions</TabsTrigger>
          <TabsTrigger value="assign">Assigned</TabsTrigger>
          <TabsTrigger value="remove">Removed</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="flex flex-1 gap-4">
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Roles</SelectItem>
            {uniqueRoles.map((role) => (
              <SelectItem key={role} value={role}>
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input
          type="text"
          placeholder="Search by user"
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
    </div>
  );
};
