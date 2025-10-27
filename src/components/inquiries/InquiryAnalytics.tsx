import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  MessageSquare, 
  Clock, 
  TrendingUp, 
  CheckCircle, 
  UserPlus,
  Calendar,
  Target,
  AlertCircle
} from 'lucide-react';

interface InquiryAnalyticsProps {
  inquiries: any[];
  relationships: any[];
}

const InquiryAnalytics: React.FC<InquiryAnalyticsProps> = ({ 
  inquiries = [], 
  relationships = [] 
}) => {
  // Calculate metrics
  const totalInquiries = inquiries.length;
  const pendingInquiries = inquiries.filter(i => i.status === 'pending').length;
  const respondedInquiries = inquiries.filter(i => i.status === 'responded').length;
  const responseRate = totalInquiries > 0 ? (respondedInquiries / totalInquiries) * 100 : 0;

  // Conversion metrics
  const consultationScheduled = relationships.filter(r => r.relationship_status === 'consultation_scheduled').length;
  const activePatients = relationships.filter(r => r.relationship_status === 'active').length;
  const conversionRate = totalInquiries > 0 ? (activePatients / totalInquiries) * 100 : 0;

  // Priority distribution
  const priorityData = [
    { name: 'Urgent', value: inquiries.filter(i => i.priority === 'urgent').length, color: '#ef4444' },
    { name: 'High', value: inquiries.filter(i => i.priority === 'high').length, color: '#f97316' },
    { name: 'Normal', value: inquiries.filter(i => i.priority === 'normal').length, color: '#10b981' },
    { name: 'Low', value: inquiries.filter(i => i.priority === 'low').length, color: '#6b7280' }
  ];

  // Weekly trend (mock data - would be calculated from actual dates)
  const weeklyTrend = [
    { week: 'Week 1', inquiries: 8, responses: 7, conversions: 3 },
    { week: 'Week 2', inquiries: 12, responses: 11, conversions: 4 },
    { week: 'Week 3', inquiries: 15, responses: 13, conversions: 6 },
    { week: 'Week 4', inquiries: 10, responses: 9, conversions: 4 }
  ];

  // Response time calculation (mock - would calculate from actual data)
  const avgResponseTime = '2.4 hours';

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Inquiries</p>
                <p className="text-2xl font-bold">{totalInquiries}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                This month
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Response Rate</p>
                <p className="text-2xl font-bold">{responseRate.toFixed(1)}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2">
              <Progress value={responseRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                <p className="text-2xl font-bold">{avgResponseTime}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                Target: &lt;4 hours
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{conversionRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-2">
              <Progress value={conversionRate} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Inquiry Priority Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Weekly Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="inquiries" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Inquiries"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="responses" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Responses"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="conversions" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    name="Conversions"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funnel Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Patient Acquisition Funnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium">Inquiries Received</p>
                  <p className="text-sm text-muted-foreground">Initial patient interest</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">{totalInquiries}</p>
                <p className="text-sm text-muted-foreground">100%</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium">Responses Sent</p>
                  <p className="text-sm text-muted-foreground">Therapist engagement</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">{respondedInquiries}</p>
                <p className="text-sm text-muted-foreground">{responseRate.toFixed(1)}%</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium">Consultations Scheduled</p>
                  <p className="text-sm text-muted-foreground">Initial meetings booked</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-yellow-600">{consultationScheduled}</p>
                <p className="text-sm text-muted-foreground">
                  {totalInquiries > 0 ? ((consultationScheduled / totalInquiries) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  4
                </div>
                <div>
                  <p className="font-medium">Active Patients</p>
                  <p className="text-sm text-muted-foreground">Ongoing treatment</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-purple-600">{activePatients}</p>
                <p className="text-sm text-muted-foreground">{conversionRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InquiryAnalytics;