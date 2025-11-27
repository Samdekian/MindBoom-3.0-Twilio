
import { User } from "@supabase/supabase-js";
import { DropdownMenuLabel } from "@/components/ui/dropdown-menu";

interface UserInfoProps {
  user: User;
}

const UserInfo = ({ user }: UserInfoProps) => {
  return (
    <DropdownMenuLabel className="font-normal">
      <div className="flex flex-col space-y-1">
        <p className="text-sm font-medium leading-none">
          {user.user_metadata?.name || user.email}
        </p>
        <p className="text-xs leading-none text-muted-foreground">
          {user.email}
        </p>
      </div>
    </DropdownMenuLabel>
  );
};

export default UserInfo;
