
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { X, Filter } from "lucide-react";

interface FilterOptions {
  specializations: string[];
  locations: string[];
  therapyApproaches: string[];
  acceptingNewPatients: boolean;
  maxRate: number;
  preferredGender?: string;
  ageGroups: string[];
}

interface TherapistFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onReset: () => void;
}

const SPECIALIZATIONS = [
  "Anxiety & Depression",
  "Trauma & PTSD",
  "Relationship Counseling",
  "Family Therapy",
  "Addiction Counseling",
  "Child Psychology",
  "Grief Counseling",
  "Eating Disorders",
  "ADHD & Learning Disabilities",
  "Career Counseling"
];

const THERAPY_APPROACHES = [
  "Cognitive Behavioral Therapy (CBT)",
  "Dialectical Behavior Therapy (DBT)",
  "Psychodynamic Therapy",
  "Humanistic Therapy",
  "EMDR",
  "Mindfulness-Based Therapy",
  "Solution-Focused Therapy",
  "Acceptance and Commitment Therapy (ACT)"
];

const AGE_GROUPS = [
  "Children (5-12)",
  "Adolescents (13-17)",
  "Young Adults (18-25)",
  "Adults (26-64)",
  "Seniors (65+)"
];

const TherapistFilters: React.FC<TherapistFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset
}) => {
  const activeFiltersCount = Object.values(filters).flat().filter(Boolean).length;

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayItem = (key: keyof FilterOptions, item: string) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(item)
      ? currentArray.filter(i => i !== item)
      : [...currentArray, item];
    updateFilter(key, newArray);
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          <button
            onClick={onReset}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <X className="h-4 w-4" />
            Reset
          </button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Accepting New Patients */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="accepting-patients"
            checked={filters.acceptingNewPatients}
            onCheckedChange={(checked) => updateFilter('acceptingNewPatients', checked)}
          />
          <Label htmlFor="accepting-patients">Only show therapists accepting new patients</Label>
        </div>
        
        {/* Specializations */}
        <div>
          <Label className="text-sm font-medium">Specializations</Label>
          <div className="mt-2 grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
            {SPECIALIZATIONS.map((spec) => (
              <div key={spec} className="flex items-center space-x-2">
                <Checkbox
                  id={`spec-${spec}`}
                  checked={filters.specializations.includes(spec)}
                  onCheckedChange={() => toggleArrayItem('specializations', spec)}
                />
                <Label htmlFor={`spec-${spec}`} className="text-sm">
                  {spec}
                </Label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Preferred Gender */}
        <div>
          <Label className="text-sm font-medium">Preferred Gender</Label>
          <Select 
            value={filters.preferredGender || ""} 
            onValueChange={(value) => updateFilter('preferredGender', value || undefined)}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="No preference" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No preference</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="non-binary">Non-binary</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Age Groups */}
        <div>
          <Label className="text-sm font-medium">Age Groups Treated</Label>
          <div className="mt-2 space-y-2">
            {AGE_GROUPS.map((age) => (
              <div key={age} className="flex items-center space-x-2">
                <Checkbox
                  id={`age-${age}`}
                  checked={filters.ageGroups.includes(age)}
                  onCheckedChange={() => toggleArrayItem('ageGroups', age)}
                />
                <Label htmlFor={`age-${age}`} className="text-sm">
                  {age}
                </Label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Therapy Approaches */}
        <div>
          <Label className="text-sm font-medium">Therapy Approaches</Label>
          <div className="mt-2 grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
            {THERAPY_APPROACHES.map((approach) => (
              <div key={approach} className="flex items-center space-x-2">
                <Checkbox
                  id={`approach-${approach}`}
                  checked={filters.therapyApproaches.includes(approach)}
                  onCheckedChange={() => toggleArrayItem('therapyApproaches', approach)}
                />
                <Label htmlFor={`approach-${approach}`} className="text-sm">
                  {approach}
                </Label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Maximum Rate */}
        <div>
          <Label className="text-sm font-medium">
            Maximum Rate: ${filters.maxRate}/session
          </Label>
          <div className="mt-3">
            <Slider
              value={[filters.maxRate]}
              onValueChange={(value) => updateFilter('maxRate', value[0])}
              max={300}
              min={50}
              step={25}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>$50</span>
              <span>$300+</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TherapistFilters;
