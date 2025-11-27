import React, { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import PatientSidebar from "@/components/patient/PatientSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Video, Headphones, Dumbbell, Search, Filter } from "lucide-react";
import { usePatientResources } from "@/hooks/use-patient-resources";
import { isAfter, subDays } from "date-fns";

const PatientResourcesPage = () => {
  const { resources, isLoading } = usePatientResources();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'audio':
        return <Headphones className="h-5 w-5" />;
      case 'exercise':
        return <Dumbbell className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getResourceColor = (type: string) => {
    switch (type) {
      case 'video':
        return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300";
      case 'audio':
        return "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300";
      case 'exercise':
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
    }
  };

  const isNewResource = (createdAt: string) => {
    return isAfter(new Date(createdAt), subDays(new Date(), 7));
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !selectedType || resource.resource_type === selectedType;
    
    return matchesSearch && matchesType;
  });

  const resourceTypes = ['article', 'video', 'audio', 'exercise'];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <PatientSidebar />
        
        <main className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            <DashboardHeader />
            
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold">Resource Library</h1>
                <p className="text-muted-foreground mt-2">
                  Access helpful resources for your mental health journey
                </p>
              </div>

              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search resources..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={selectedType === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedType(null)}
                  >
                    All
                  </Button>
                  {resourceTypes.map(type => (
                    <Button
                      key={type}
                      variant={selectedType === type ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedType(type)}
                      className="capitalize"
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Resources Grid */}
              {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader>
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-muted rounded-full" />
                          <div className="space-y-2 flex-1">
                            <div className="h-4 bg-muted rounded" />
                            <div className="h-3 bg-muted rounded w-20" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="h-3 bg-muted rounded" />
                          <div className="h-3 bg-muted rounded w-3/4" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredResources.map((resource) => (
                    <Card 
                      key={resource.id} 
                      className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => {
                        if (resource.content_url) {
                          window.open(resource.content_url, '_blank');
                        }
                      }}
                    >
                      <CardHeader>
                        <div className="flex items-center space-x-3">
                          <div className={`rounded-full p-2 ${getResourceColor(resource.resource_type)}`}>
                            {getResourceIcon(resource.resource_type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-lg truncate">{resource.title}</CardTitle>
                              {isNewResource(resource.created_at) && (
                                <Badge variant="secondary" className="text-xs">New</Badge>
                              )}
                              {resource.is_featured && (
                                <Badge variant="default" className="text-xs">Featured</Badge>
                              )}
                            </div>
                            <CardDescription className="capitalize">
                              {resource.resource_type}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      {resource.description && (
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {resource.description}
                          </p>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              )}

              {!isLoading && filteredResources.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No resources found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery || selectedType 
                      ? "Try adjusting your search criteria" 
                      : "Resources will appear here as they become available"
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default PatientResourcesPage;