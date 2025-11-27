
import React, { useState, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchIcon, Loader2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface SearchFormProps {
  onSearch: (searchValue: string) => void;
  isSearching: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isSearching }) => {
  const [searchType, setSearchType] = useState<"userId" | "email">("userId");
  const [searchValue, setSearchValue] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) return;
    onSearch(searchValue.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Search by</Label>
        <RadioGroup 
          defaultValue="userId" 
          value={searchType}
          onValueChange={(value) => setSearchType(value as "userId" | "email")}
          className="flex items-center space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="userId" id="user-id" />
            <Label htmlFor="user-id">User ID</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="email" id="email" />
            <Label htmlFor="email">Email</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type={searchType === "email" ? "email" : "text"}
            placeholder={searchType === "userId" ? "Enter user ID" : "Enter email address"}
            className="pl-9"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={isSearching || !searchValue.trim()}>
          {isSearching ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Search
        </Button>
      </div>
    </form>
  );
};

export default SearchForm;
