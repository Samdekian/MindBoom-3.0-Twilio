
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

interface SearchFormProps {
  userIdOrEmail: string;
  searchBy: "userId" | "email";
  onUserIdOrEmailChange: (value: string) => void;
  onSearchByChange: (value: "userId" | "email") => void;
  onSubmit: () => Promise<void>;
  isLoading: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({
  userIdOrEmail,
  searchBy,
  onUserIdOrEmailChange,
  onSearchByChange,
  onSubmit,
  isLoading,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <RadioGroup
          value={searchBy}
          onValueChange={(value) => onSearchByChange(value as "userId" | "email")}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="userId" id="userId" />
            <Label htmlFor="userId">User ID</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="email" id="email" />
            <Label htmlFor="email">Email</Label>
          </div>
        </RadioGroup>

        <div className="flex space-x-2">
          <Input
            placeholder={searchBy === "userId" ? "Enter user ID..." : "Enter email address..."}
            value={userIdOrEmail}
            onChange={(e) => onUserIdOrEmailChange(e.target.value)}
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !userIdOrEmail}>
            {isLoading ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Search
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default SearchForm;
