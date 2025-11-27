
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Search } from "lucide-react";

interface AddMembersSectionProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filteredPatients: any[];
  onAddMember: (patientId: string) => void;
  isAdding: boolean;
}

const AddMembersSection = ({ 
  searchTerm, 
  onSearchChange, 
  filteredPatients, 
  onAddMember, 
  isAdding 
}: AddMembersSectionProps) => {
  return (
    <div>
      <h4 className="font-medium mb-3">Add Members</h4>
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {filteredPatients.length > 0 ? (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {filteredPatients.map((patient) => (
              <div key={patient?.id} className="flex items-center justify-between p-2 border rounded">
                <span>{patient?.full_name}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAddMember(patient?.id)}
                  disabled={isAdding}
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            {searchTerm ? "No patients found matching your search" : "No available patients to add"}
          </p>
        )}
      </div>
    </div>
  );
};

export default AddMembersSection;
