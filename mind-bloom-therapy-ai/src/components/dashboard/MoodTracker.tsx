
import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { BarChart2, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import { useMoodTracking } from "@/hooks/use-mood-tracking";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";

const MoodTracker = () => {
  const { t } = useLanguage();
  const { user } = useAuthRBAC();
  const [showMoodEntry, setShowMoodEntry] = useState(false);
  
  const { 
    processedMoodData, 
    currentStreak, 
    createMoodEntry, 
    isCreating,
    isLoading 
  } = useMoodTracking(user?.id || '');

  const moodData = processedMoodData;

  const moodColors = ["#f87171", "#fb923c", "#facc15", "#a3e635", "#34d399"];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <div>
          <CardTitle>{t("moodTracker") || "Mood Tracker"}</CardTitle>
          <CardDescription>Track your emotional wellbeing</CardDescription>
        </div>
        <Badge variant="secondary">{currentStreak}-Day Streak</Badge>
      </CardHeader>
      <CardContent className="pt-4">
        {!showMoodEntry ? (
          <>
            <div className="h-[180px] w-full">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-sm text-muted-foreground">Loading mood data...</div>
                </div>
              ) : (
              <ChartContainer
                config={{
                  mood1: { color: moodColors[0] },
                  mood2: { color: moodColors[1] },
                  mood3: { color: moodColors[2] },
                  mood4: { color: moodColors[3] },
                  mood5: { color: moodColors[4] },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={moodData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                    <XAxis 
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      domain={[0, 5]} 
                      hide 
                    />
                    <ChartTooltip
                      content={<ChartTooltipContent formatter={(value) => [`Mood: ${moodData.find(d => d.value === value)?.mood || ''}`]} />}
                    />
                    <Bar 
                      dataKey="value" 
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    >
                      {moodData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.hasEntry ? moodColors[entry.value - 1] : '#e5e7eb'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
              )}
            </div>
            <div className="flex justify-center mt-4">
              <Button 
                onClick={() => setShowMoodEntry(true)}
                disabled={isCreating}
                variant="default"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                {isCreating ? 'Saving...' : "Log Today's Mood"}
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <p className="text-center font-medium">How are you feeling today?</p>
            <div className="grid grid-cols-5 gap-2">
              {[
                { emoji: "😞", mood: "Poor", value: 1 },
                { emoji: "😐", mood: "Fair", value: 2 },
                { emoji: "🙂", mood: "Good", value: 3 },
                { emoji: "😊", mood: "Great", value: 4 },
                { emoji: "😄", mood: "Excellent", value: 5 },
              ].map((item) => (
                <Button
                  key={item.value}
                  variant="outline"
                  className="flex flex-col h-auto py-2 hover:bg-accent"
                  disabled={isCreating}
                  onClick={() => {
                    createMoodEntry({
                      moodValue: item.value,
                      moodLabel: item.mood,
                    });
                    setShowMoodEntry(false);
                  }}
                >
                  <span className="text-xl mb-1">{item.emoji}</span>
                  <span className="text-xs">{item.mood}</span>
                </Button>
              ))}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => setShowMoodEntry(false)}
            >
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <Button variant="ghost" size="sm" className="w-full">
          <BarChart2 className="h-4 w-4 mr-2" />
          View Detailed Trends
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MoodTracker;
