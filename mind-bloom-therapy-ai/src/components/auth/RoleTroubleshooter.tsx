
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRoleTroubleshooter } from "@/hooks/use-role-troubleshooter";
import DiagnosticResults from "@/components/auth/DiagnosticResults";
import SearchForm from "@/components/auth/SearchForm";

export interface SearchFormProps {
  userIdOrEmail: string;
  searchBy: "userId" | "email";
  onUserIdOrEmailChange: (value: string) => void;
  onSearchByChange: (value: "userId" | "email") => void;
  onSubmit: () => Promise<void>;
  isLoading: boolean;
}

export interface DiagnosticResultsProps {
  result: any;
  onRepair: () => Promise<void>;
  repairInProgress: boolean;
  isLoading: boolean;
  onRecheck: () => Promise<void>;
}

export const RoleTroubleshooter: React.FC = () => {
  const {
    userIdOrEmail,
    searchBy,
    isLoading,
    result,
    repairInProgress,
    setUserIdOrEmail,
    setSearchBy,
    checkUser,
    repairUser,
  } = useRoleTroubleshooter();

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Role Troubleshooter</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <SearchForm
          userIdOrEmail={userIdOrEmail}
          searchBy={searchBy}
          onUserIdOrEmailChange={setUserIdOrEmail}
          onSearchByChange={setSearchBy}
          onSubmit={checkUser}
          isLoading={isLoading}
        />

        {result && (
          <DiagnosticResults
            result={result}
            onRepair={repairUser}
            repairInProgress={repairInProgress}
            isLoading={isLoading}
            onRecheck={checkUser}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default RoleTroubleshooter;
