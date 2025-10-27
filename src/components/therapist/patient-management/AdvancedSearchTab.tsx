import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Filter, User, Calendar, MapPin } from 'lucide-react';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';

const AdvancedSearchTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCriteria, setFilterCriteria] = useState('');
  const [searchResults, setSearchResults] = useState([
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      location: 'New York',
      lastSession: '2023-01-01',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      location: 'Los Angeles',
      lastSession: '2023-02-15',
    },
  ]);

  const handleSearch = () => {
    console.log('Searching for:', searchTerm, 'with criteria:', filterCriteria);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Advanced Search</CardTitle>
        <CardDescription>
          Search and filter patients based on various criteria.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="search">Search</Label>
            <Input
              type="text"
              id="search"
              placeholder="Enter search term"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="filter">Filter By</Label>
            <Select onValueChange={setFilterCriteria}>
              <SelectTrigger>
                <SelectValue placeholder="Select a filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="location">Location</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={handleSearch}>
          <Search className="mr-2 h-4 w-4" />
          Search
        </Button>

        {searchResults.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Search Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((result) => (
                <Card key={result.id}>
                  <CardContent className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${result.name}`} />
                        <AvatarFallback>{result.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{result.name}</h4>
                        <Badge variant="secondary">{result.location}</Badge>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      <p>
                        <User className="mr-2 inline-block h-4 w-4" />
                        {result.email}
                      </p>
                      <p>
                        <Calendar className="mr-2 inline-block h-4 w-4" />
                        Last Session: {result.lastSession}
                      </p>
                    </div>
                    <Button variant="outline">View Details</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {searchResults.length === 0 && (
          <div className="text-center text-gray-500">
            No results found. Please adjust your search criteria.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedSearchTab;
