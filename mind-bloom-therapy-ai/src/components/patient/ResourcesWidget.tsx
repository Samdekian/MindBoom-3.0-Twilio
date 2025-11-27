
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Headphones, Video } from "lucide-react";

const ResourcesWidget = () => {
  const resources = [
    {
      id: 1,
      title: "Mindfulness Guide",
      type: "Article",
      icon: BookOpen,
      color: "text-blue-600"
    },
    {
      id: 2,
      title: "Relaxation Audio",
      type: "Audio",
      icon: Headphones,
      color: "text-green-600"
    },
    {
      id: 3,
      title: "Breathing Exercise",
      type: "Video",
      icon: Video,
      color: "text-purple-600"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BookOpen className="h-5 w-5 mr-2 text-orange-600" />
          Resources
        </CardTitle>
        <CardDescription>Educational content and tools</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {resources.map(({ id, title, type, icon: Icon, color }) => (
            <div key={id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <div className="flex items-center space-x-3">
                <Icon className={`h-4 w-4 ${color}`} />
                <div>
                  <p className="font-medium text-sm">{title}</p>
                  <p className="text-xs text-gray-500">{type}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" className="w-full mt-4" size="sm">
          View All Resources
        </Button>
      </CardContent>
    </Card>
  );
};

export default ResourcesWidget;
