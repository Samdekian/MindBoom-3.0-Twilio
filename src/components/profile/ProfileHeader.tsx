
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserCircle, Calendar, Mail } from "lucide-react";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { formatDate } from "@/utils/date/format";
import { capitalizeFirst } from "@/utils/string/format";

export interface ProfileHeaderProps {
  fullName: string;
  accountType: string;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
  fullName,
  accountType
}) => {
  const { user } = useAuthRBAC();
  
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  const avatarInitials = getInitials(fullName || 'Anonymous User');
  const accountTypeDisplay = capitalizeFirst(accountType || 'patient');

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="bg-primary text-lg">
              {avatarInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h2 className="text-2xl font-bold">{fullName}</h2>
              <Badge variant="outline" className="self-center">
                {accountTypeDisplay}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-3 gap-4 mt-2">
          <div className="flex items-center gap-2">
            <UserCircle className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm">Member since {formatDate(user?.created_at)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm">Last login: {formatDate(user?.last_sign_in_at)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm">Email: {user?.email ? 'Verified' : 'Not verified'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileHeader;
