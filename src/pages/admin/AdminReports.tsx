
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { CalendarIcon, Download, TrendingUp, Users, Calendar as CalendarLucide, DollarSign } from "lucide-react";
import { format } from "date-fns";

const AdminReports: React.FC = () => {
  const [dateRange, setDateRange] = useState<Date | undefined>(new Date());
  const [reportType, setReportType] = useState("overview");

  // Mock data
  const userGrowthData = [
    { month: 'Jan', patients: 120, therapists: 15 },
    { month: 'Feb', patients: 145, therapists: 18 },
    { month: 'Mar', patients: 178, therapists: 22 },
    { month: 'Apr', patients: 210, therapists: 25 },
    { month: 'May', patients: 245, therapists: 28 },
    { month: 'Jun', patients: 280, therapists: 32 }
  ];

  const appointmentData = [
    { day: 'Mon', scheduled: 45, completed: 38, cancelled: 7 },
    { day: 'Tue', scheduled: 52, completed: 44, cancelled: 8 },
    { day: 'Wed', scheduled: 48, completed: 42, cancelled: 6 },
    { day: 'Thu', scheduled: 55, completed: 48, cancelled: 7 },
    { day: 'Fri', scheduled: 60, completed: 52, cancelled: 8 }
  ];

  const roleDistribution = [
    { name: 'Patients', value: 850, color: '#8884d8' },
    { name: 'Therapists', value: 32, color: '#82ca9d' },
    { name: 'Admins', value: 5, color: '#ffc658' }
  ];

  const metrics = {
    totalUsers: 887,
    activeTherapists: 28,
    totalAppointments: 1245,
    revenue: 45680
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="h-8 w-8" />
            Admin Reports
          </h1>
          <p className="text-gray-600">Analytics and insights for your platform</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Report Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="users">User Analytics</SelectItem>
              <SelectItem value="appointments">Appointments</SelectItem>
              <SelectItem value="revenue">Revenue</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                {dateRange ? format(dateRange, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dateRange}
                onSelect={setDateRange}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalUsers}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Therapists</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeTherapists}</div>
            <p className="text-xs text-muted-foreground">+3 this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <CalendarLucide className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalAppointments}</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.revenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+15% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>Monthly user registration trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="patients" stroke="#8884d8" name="Patients" />
                <Line type="monotone" dataKey="therapists" stroke="#82ca9d" name="Therapists" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Role Distribution</CardTitle>
            <CardDescription>Current user role breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={roleDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {roleDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Appointment Overview</CardTitle>
          <CardDescription>Appointment status by day of the week</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={appointmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="completed" stackId="a" fill="#82ca9d" name="Completed" />
              <Bar dataKey="cancelled" stackId="a" fill="#ffc658" name="Cancelled" />
              <Bar dataKey="scheduled" fill="#8884d8" name="Scheduled" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReports;
