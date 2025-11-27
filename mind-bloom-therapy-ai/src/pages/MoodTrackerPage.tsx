
import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { ArrowDown } from "lucide-react";
import { useAuthRBAC } from '@/contexts/AuthRBACContext';

const MoodTrackerPage = () => {
  const { user } = useAuthRBAC();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [moodEntries, setMoodEntries] = useState<Record<string, { mood: number; note: string }>>({});

  const moodLabels = ['Terrible', 'Poor', 'Fair', 'Good', 'Excellent'];
  const moodColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-emerald-500'];

  const todayKey = selectedDate.toDateString();
  const currentMood = moodEntries[todayKey];

  const setMoodForDate = (mood: number, note: string = '') => {
    setMoodEntries(prev => ({
      ...prev,
      [todayKey]: { mood, note }
    }));
  };

  const hasEntry = (date: Date) => {
    return moodEntries[date.toDateString()] !== undefined;
  };

  return (
    <div className="container mx-auto p-6">
      <Helmet>
        <title>Mood Tracker | Therapy Platform</title>
      </Helmet>
      
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Mood Tracker</h1>
          <p className="text-muted-foreground">
            Track your daily mood to identify patterns and trends
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar */}
          <Card>
            <CardHeader>
              <CardTitle>Select Date</CardTitle>
              <CardDescription>Choose a date to log your mood</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => setSelectedDate(date || new Date())}
                className="rounded-md border"
                modifiers={{
                  hasEntry: hasEntry
                }}
                modifiersClassNames={{
                  hasEntry: "bg-primary/20 text-primary font-bold"
                }}
              />
            </CardContent>
          </Card>

          {/* Mood Entry */}
          <Card>
            <CardHeader>
              <CardTitle>Mood for {selectedDate.toLocaleDateString()}</CardTitle>
              <CardDescription>Rate your mood on a scale of 1-5</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((mood) => (
                  <Button
                    key={mood}
                    variant={currentMood?.mood === mood ? "default" : "outline"}
                    className={`h-16 flex flex-col ${currentMood?.mood === mood ? moodColors[mood - 1] : ''}`}
                    onClick={() => setMoodForDate(mood)}
                  >
                    <span className="text-lg font-bold">{mood}</span>
                    <span className="text-xs">{moodLabels[mood - 1]}</span>
                  </Button>
                ))}
              </div>

              {currentMood && (
                <div className="mt-4">
                  <Badge className={`${moodColors[currentMood.mood - 1]} text-white`}>
                    Current: {moodLabels[currentMood.mood - 1]} ({currentMood.mood}/5)
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Mood History */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Entries</CardTitle>
            <CardDescription>Your mood history over time</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(moodEntries).length === 0 ? (
              <p className="text-muted-foreground">No mood entries yet. Start by selecting today's mood!</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(moodEntries)
                  .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                  .slice(0, 7)
                  .map(([date, entry]) => (
                    <div key={date} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">{new Date(date).toLocaleDateString()}</span>
                      <Badge className={`${moodColors[entry.mood - 1]} text-white`}>
                        {moodLabels[entry.mood - 1]} ({entry.mood}/5)
                      </Badge>
                    </div>
                  ))
                }
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MoodTrackerPage;
