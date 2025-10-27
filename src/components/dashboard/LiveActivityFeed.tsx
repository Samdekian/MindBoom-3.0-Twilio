import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, MessageCircle, Target, Heart, Calendar, Bell } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { useActivityFeed } from "@/hooks/use-enhanced-realtime";

interface ActivityItem {
  id: string;
  type: 'mood' | 'goal' | 'appointment' | 'message' | 'resource' | 'general';
  title: string;
  description: string;
  timestamp: Date;
  isNew?: boolean;
}

const LiveActivityFeed = () => {
  const activities = useActivityFeed(10);

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'mood':
        return <Heart className="h-4 w-4" />;
      case 'goal':
        return <Target className="h-4 w-4" />;
      case 'appointment':
        return <Calendar className="h-4 w-4" />;
      case 'message':
        return <MessageCircle className="h-4 w-4" />;
      case 'resource':
        return <Bell className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'mood':
        return "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300";
      case 'goal':
        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
      case 'appointment':
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      case 'message':
        return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300";
      case 'resource':
        return "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const formatTime = (timestamp: Date) => {
    if (isToday(timestamp)) {
      return format(timestamp, 'h:mm a');
    } else if (isYesterday(timestamp)) {
      return 'Yesterday';
    } else {
      return format(timestamp, 'MMM d');
    }
  };

  // Remove unused function since activities are managed by useActivityFeed hook

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Live Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-3">
            {activities.length === 0 ? (
              <div className="text-center py-6">
                <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No recent activity</p>
              </div>
            ) : (
              activities.map((activity) => (
                <div 
                  key={activity.id}
                  className={`flex items-start gap-3 p-3 rounded-lg transition-all duration-300 ${
                    activity.isNew 
                      ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' 
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <div className={`rounded-full p-2 ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm truncate">{activity.title}</p>
                      <div className="flex items-center gap-2">
                        {activity.isNew && (
                          <Badge variant="secondary" className="text-xs">New</Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatTime(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {activity.description}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default LiveActivityFeed;