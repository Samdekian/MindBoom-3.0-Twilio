
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar, 
  TrendingUp, 
  Heart, 
  BookOpen, 
  MessageSquare, 
  Plus,
  Clock,
  Target,
  Zap,
  Star,
  Video,
  FileText,
  Award,
  Bell,
  ChevronRight
} from "lucide-react";

interface PatientMainContentProps {
  activeSection: string;
}

const PatientMainContent: React.FC<PatientMainContentProps> = ({ activeSection }) => {
  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <div className="space-y-8">
            {/* Modern Welcome Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 rounded-3xl p-8 text-white">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold mb-3">Welcome back, Sarah! 👋</h1>
                    <p className="text-blue-100 text-lg">Ready to continue your wellness journey?</p>
                    <div className="flex items-center mt-4 space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-sm text-blue-100">Next session: Today at 2:00 PM</span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <Heart className="w-16 h-16 text-pink-300" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="border-0 bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-900/20 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Sessions Completed</p>
                      <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 group-hover:scale-105 transition-transform">12</p>
                      <p className="text-xs text-emerald-600/70 mt-1">+2 this week</p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
                      <Target className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Current Streak</p>
                      <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 group-hover:scale-105 transition-transform">7</p>
                      <p className="text-xs text-blue-600/70 mt-1">days in a row</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                      <Zap className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Overall Progress</p>
                      <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 group-hover:scale-105 transition-transform">75%</p>
                      <p className="text-xs text-purple-600/70 mt-1">almost there!</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                      <TrendingUp className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-orange-50 to-yellow-100 dark:from-orange-900/20 dark:to-yellow-900/20 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Achievements</p>
                      <p className="text-3xl font-bold text-orange-900 dark:text-orange-100 group-hover:scale-105 transition-transform">8</p>
                      <p className="text-xs text-orange-600/70 mt-1">badges earned</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center group-hover:bg-orange-500/30 transition-colors">
                      <Award className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Upcoming & Actions */}
              <div className="lg:col-span-2 space-y-6">
                {/* Upcoming Appointments */}
                <Card className="border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                        Upcoming Sessions
                      </CardTitle>
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                        View All <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200/50">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                          <AvatarImage src="/api/placeholder/48/48" />
                          <AvatarFallback className="bg-blue-500 text-white font-medium">DJ</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">Dr. Sarah Johnson</p>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                            <Clock className="h-4 w-4" />
                            <span>Today, 2:00 PM - 3:00 PM</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                          <Video className="w-3 h-3 mr-1" />
                          Video Call
                        </Badge>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          Join Session
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                          <AvatarImage src="/api/placeholder/48/48" />
                          <AvatarFallback className="bg-purple-500 text-white font-medium">MR</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">Dr. Michael Rodriguez</p>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                            <Clock className="h-4 w-4" />
                            <span>Tomorrow, 10:00 AM - 11:00 AM</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-gray-600">
                        In-Person
                      </Badge>
                    </div>

                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule New Session
                    </Button>
                  </CardContent>
                </Card>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-0 bg-gradient-to-br from-pink-50 to-red-50 dark:from-pink-900/20 dark:to-red-900/20 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Heart className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">Daily Mood Check</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Track your emotional wellness</p>
                      <Button variant="outline" size="sm" className="group-hover:bg-pink-50 group-hover:border-pink-200">
                        Check In Now
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-0 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <MessageSquare className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">AI Support Chat</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Get instant guidance 24/7</p>
                      <Button variant="outline" size="sm" className="group-hover:bg-blue-50 group-hover:border-blue-200">
                        Start Chat
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Right Column - Progress & Resources */}
              <div className="space-y-6">
                {/* Progress Overview */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                      </div>
                      Your Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium">Overall Wellness</span>
                        <span className="text-sm text-purple-600 font-semibold">75%</span>
                      </div>
                      <Progress value={75} className="h-3 bg-purple-100" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium">Session Attendance</span>
                        <span className="text-sm text-green-600 font-semibold">90%</span>
                      </div>
                      <Progress value={90} className="h-3 bg-green-100" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium">Goal Achievement</span>
                        <span className="text-sm text-blue-600 font-semibold">60%</span>
                      </div>
                      <Progress value={60} className="h-3 bg-blue-100" />
                    </div>

                    <Button variant="outline" className="w-full">
                      View Detailed Report
                    </Button>
                  </CardContent>
                </Card>

                {/* Recent Achievements */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                        <Award className="h-5 w-5 text-yellow-600" />
                      </div>
                      Recent Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                      <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                        <Star className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">7-Day Streak</p>
                        <p className="text-xs text-gray-600">Consistent daily check-ins</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <Target className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Goal Crusher</p>
                        <p className="text-xs text-gray-600">Completed weekly goals</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      case "appointments":
        return (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                Your Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">Manage your therapy sessions and upcoming appointments.</p>
            </CardContent>
          </Card>
        );

      case "progress":
        return (
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  Detailed Progress Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm text-gray-600">75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Session Attendance</span>
                    <span className="text-sm text-gray-600">90%</span>
                  </div>
                  <Progress value={90} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Goal Achievement</span>
                    <span className="text-sm text-gray-600">60%</span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "mood":
        return (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <Heart className="h-5 w-5 text-red-500" />
                </div>
                Mood Tracker
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">Track your daily mood and emotional patterns.</p>
            </CardContent>
          </Card>
        );

      case "resources":
        return (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                </div>
                Resources & Materials
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">Access helpful resources, articles, and therapeutic materials.</p>
            </CardContent>
          </Card>
        );

      case "ai-chat":
        return (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                </div>
                AI Therapy Assistant
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">Chat with our AI therapy assistant for immediate support and guidance.</p>
            </CardContent>
          </Card>
        );

      default:
        return <div>Section not found</div>;
    }
  };

  return (
    <main className="flex-1 overflow-auto bg-gray-50/50 dark:bg-gray-900/50">
      <div className="container mx-auto p-8 max-w-7xl">
        {renderContent()}
      </div>
    </main>
  );
};

export default PatientMainContent;
