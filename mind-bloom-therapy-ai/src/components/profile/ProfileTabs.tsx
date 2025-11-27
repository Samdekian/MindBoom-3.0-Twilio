
import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Shield, ClipboardList, Bell } from "lucide-react";
import PersonalInfoTab from "./PersonalInfoTab";
import AccountTypeTab from "./AccountTypeTab";
import ActivityTab from "./ActivityTab";
import NotificationPreferences from "./NotificationPreferences";

const ProfileTabs = () => {
  const { t } = useLanguage();

  return (
    <Tabs defaultValue="personal" className="w-full">
      <TabsList className="grid w-full grid-cols-4 mb-8">
        <TabsTrigger value="personal" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">{t("personalInfo") || "Personal Info"}</span>
        </TabsTrigger>
        <TabsTrigger value="accountType" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          <span className="hidden sm:inline">{t("accountType") || "Account Type"}</span>
        </TabsTrigger>
        <TabsTrigger value="notifications" className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          <span className="hidden sm:inline">{t("notifications") || "Notifications"}</span>
        </TabsTrigger>
        <TabsTrigger value="activity" className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4" />
          <span className="hidden sm:inline">{t("activity") || "Activity"}</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="personal">
        <PersonalInfoTab />
      </TabsContent>
      
      <TabsContent value="accountType">
        <AccountTypeTab />
      </TabsContent>
      
      <TabsContent value="notifications">
        <NotificationPreferences />
      </TabsContent>
      
      <TabsContent value="activity">
        <ActivityTab />
      </TabsContent>
    </Tabs>
  );
};

export default ProfileTabs;
