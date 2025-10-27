
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Download, RefreshCw } from "lucide-react";

const AdminReports: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeReport, setActiveReport] = useState("user-growth");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Sample data for the reports
  const userGrowthData = [
    { name: 'Jan', patients: 10, therapists: 5 },
    { name: 'Feb', patients: 15, therapists: 7 },
    { name: 'Mar', patients: 20, therapists: 8 },
    { name: 'Apr', patients: 25, therapists: 10 },
    { name: 'May', patients: 30, therapists: 12 },
  ];

  const sessionData = [
    { name: 'Mon', sessions: 12 },
    { name: 'Tue', sessions: 19 },
    { name: 'Wed', sessions: 15 },
    { name: 'Thu', sessions: 20 },
    { name: 'Fri', sessions: 18 },
    { name: 'Sat', sessions: 8 },
    { name: 'Sun', sessions: 5 },
  ];
  
  const userDistribution = [
    { name: 'Patients', value: 70 },
    { name: 'Therapists', value: 25 },
    { name: 'Admins', value: 5 },
  ];
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  const handleGenerateReport = () => {
    setIsLoading(true);
    
    // Simulate API call to generate report
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Report Generated",
        description: `${format(selectedDate || new Date(), 'PPP')} report has been generated successfully`,
      });
    }, 1500);
  };

  const handleDownload = () => {
    toast({
      title: "Downloading Report",
      description: "Your report is being prepared for download",
    });
    
    // Simulate download
    setTimeout(() => {
      toast({
        title: "Download Complete",
        description: "Report has been downloaded successfully",
      });
    }, 1500);
  };
  
  return (
    <div className="space-y-6">
      <Tabs value={activeReport} onValueChange={setActiveReport}>
        <TabsList className="mb-6">
          <TabsTrigger value="user-growth">User Growth</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="distribution">User Distribution</TabsTrigger>
          <TabsTrigger value="custom">Custom Report</TabsTrigger>
        </TabsList>
        
        <TabsContent value="user-growth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly User Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={userGrowthData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="patients" fill="#8884d8" name="Patients" />
                  <Bar dataKey="therapists" fill="#82ca9d" name="Therapists" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Session Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={sessionData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sessions" fill="#8884d8" name="Sessions" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="distribution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Type Distribution</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={userDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {userDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Custom Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">Select Date Range</h3>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                  />
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-medium mb-2">Report Options</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="user-growth" checked />
                      <label htmlFor="user-growth">User Growth</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="sessions" checked />
                      <label htmlFor="sessions">Session Activity</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="revenue" />
                      <label htmlFor="revenue">Revenue Analysis</label>
                    </div>
                  </div>
                  <div className="pt-4">
                    <Button onClick={handleGenerateReport} disabled={isLoading} className="w-full">
                      {isLoading ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        'Generate Report'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end">
        <Button variant="outline" onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download Report
        </Button>
      </div>
    </div>
  );
};

export default AdminReports;
