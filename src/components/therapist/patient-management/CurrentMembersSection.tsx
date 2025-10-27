
import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface CurrentMembersSectionProps {
  members: any[] | undefined;
  onRemoveMember: (membershipId: string) => void;
  isRemoving: boolean;
}

const CurrentMembersSection = ({ members, onRemoveMember, isRemoving }: CurrentMembersSectionProps) => {
  return (
    <div>
      <h4 className="font-medium mb-3">Current Members ({members?.length || 0})</h4>
      {members && members.length > 0 ? (
        <div className="space-y-2">
          {members.map((membership) => (
            <div key={membership.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span>{membership.profiles?.full_name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveMember(membership.id)}
                disabled={isRemoving}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">No members in this group yet</p>
      )}
    </div>
  );
};

export default CurrentMembersSection;
