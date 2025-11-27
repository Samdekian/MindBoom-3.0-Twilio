
import React from 'react';
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';
import CalendarFilters from './CalendarFilters';

interface CalendarToolbarProps {
  searchQuery: string;
  statusFilter: string;
  onSearchChange: (query: string) => void;
  onStatusChange: (status: string) => void;
}

const CalendarToolbar: React.FC<CalendarToolbarProps> = ({
  searchQuery,
  statusFilter,
  onSearchChange,
  onStatusChange
}) => {
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
      <div className="relative w-full md:w-[250px]">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search appointments"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>
      <CalendarFilters
        selectedStatus={statusFilter}
        onStatusChange={onStatusChange}
      />
    </div>
  );
};

export default CalendarToolbar;
