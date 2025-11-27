
import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight, FileText, Video, Headphones, Dumbbell } from "lucide-react";
import { usePatientResources } from "@/hooks/use-patient-resources";
import { isAfter, subDays } from "date-fns";
import { useNavigate } from "react-router-dom";

const ResourcesWidget = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { resources, isLoading } = usePatientResources();
  
  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'audio':
        return <Headphones className="h-4 w-4" />;
      case 'exercise':
        return <Dumbbell className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <div>
          <CardTitle>{t("resources") || "Resources"}</CardTitle>
          <CardDescription>Helpful content for your journey</CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={() => navigate('/patient/resources')}
        >
          <BookOpen className="h-4 w-4" />
          <span className="hidden sm:inline">Browse Library</span>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center p-3 rounded-lg">
                <div className="h-8 w-8 bg-muted rounded-full mr-3 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-3 bg-muted rounded w-16 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {resources.slice(0, 3).map((resource) => (
              <div 
                key={resource.id}
                className="flex items-center p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => {
                  if (resource.content_url) {
                    window.open(resource.content_url, '_blank');
                  }
                }}
              >
                <div className={`rounded-full p-2 mr-3 ${getResourceColor(resource.resource_type)}`}>
                  {getResourceIcon(resource.resource_type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center">
                    <h4 className="font-medium">{resource.title}</h4>
                    {isNewResource(resource.created_at) && (
                      <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground capitalize">{resource.resource_type}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full"
          onClick={() => navigate('/patient/resources')}
        >
          View All Resources
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ResourcesWidget;
