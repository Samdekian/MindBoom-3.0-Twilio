
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Smile, Meh, Frown } from "lucide-react";

const MoodTracker = () => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  
  const moods = [
    { id: 'great', label: 'Great', icon: Smile, color: 'text-green-600', bg: 'bg-green-100' },
    { id: 'okay', label: 'Okay', icon: Meh, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { id: 'down', label: 'Down', icon: Frown, color: 'text-red-600', bg: 'bg-red-100' },
  ];

  const handleMoodSelect = (moodId: string) => {
    setSelectedMood(moodId);
    // Here you would save the mood to your backend
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
          Mood Tracker
        </CardTitle>
        <CardDescription>How are you feeling today?</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {moods.map(({ id, label, icon: Icon, color, bg }) => (
              <button
                key={id}
                onClick={() => handleMoodSelect(id)}
                className={`p-3 rounded-lg border transition-all ${
                  selectedMood === id 
                    ? `${bg} border-current ${color}` 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Icon className={`h-6 w-6 mx-auto mb-1 ${selectedMood === id ? color : 'text-gray-400'}`} />
                <p className={`text-xs ${selectedMood === id ? color : 'text-gray-600'}`}>{label}</p>
              </button>
            ))}
          </div>
          
          {selectedMood && (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Mood logged for today!</p>
              <Button variant="outline" size="sm">
                View Mood History
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MoodTracker;
