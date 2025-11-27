
import { User } from "@supabase/supabase-js";

interface UserInitialsProps {
  user: User;
}

export const UserInitials = ({ user }: UserInitialsProps) => {
  const getUserInitials = () => {
    if (!user.user_metadata?.name) return '?';
    const nameParts = user.user_metadata.name.split(' ');
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return nameParts[0][0].toUpperCase();
  };

  return getUserInitials();
};
