
import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useGroupMembers } from "@/hooks/use-group-members";
import CurrentMembersSection from "./CurrentMembersSection";
import AddMembersSection from "./AddMembersSection";

interface ManageGroupMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: any;
}

const ManageGroupMembersDialog = ({ open, onOpenChange, group }: ManageGroupMembersDialogProps) => {
  const {
    members,
    filteredAvailablePatients,
    searchTerm,
    setSearchTerm,
    addMemberMutation,
    removeMemberMutation,
  } = useGroupMembers(group, open);

  if (!group) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Group Members</DialogTitle>
          <DialogDescription>
            Add or remove patients from "{group.name}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <CurrentMembersSection
            members={members}
            onRemoveMember={removeMemberMutation.mutate}
            isRemoving={removeMemberMutation.isPending}
          />

          <AddMembersSection
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filteredPatients={filteredAvailablePatients}
            onAddMember={addMemberMutation.mutate}
            isAdding={addMemberMutation.isPending}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManageGroupMembersDialog;
