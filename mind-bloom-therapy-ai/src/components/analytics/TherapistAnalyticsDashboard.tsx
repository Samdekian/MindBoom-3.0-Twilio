
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTherapistAnalytics } from "@/hooks/useTherapistAnalytics";
import { Eye, MessageSquare, Calendar, TrendingUp, Clock, Target } from "lucide-react";
import PatientRelationshipOverview from "./PatientRelationshipOverview";

const TherapistAnalyticsDashboard = () => {
  const { data: analytics, isLoading } = useTherapistAnalytics();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <TrendingUp className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Analytics Data</h3>
          <p className="text-muted-foreground text-center">
            Analytics data will appear here once you start receiving profile views and inquiries.
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatResponseTime = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)}m`;
    if (minutes < 1440) return `${Math.round(minutes / 60)}h`;
    return `${Math.round(minutes / 1440)}d`;
  };

  const getConversionRateColor = (rate: number) => {
    if (rate >= 20) return 'default';
    if (rate >= 10) return 'secondary';
    return 'outline';
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <p className="text-muted-foreground">Track your patient acquisition metrics and relationships (Last 30 days)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalProfileViews}</div>
            <p className="text-xs text-muted-foreground">
              Total profile views this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patient Inquiries</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalInquiries}</div>
            <p className="text-xs text-muted-foreground">
              New inquiries received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultations Booked</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalConsultations}</div>
            <p className="text-xs text-muted-foreground">
              Initial consultations scheduled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">
                {analytics.averageConversionRate.toFixed(1)}%
              </div>
              <Badge variant={getConversionRateColor(analytics.averageConversionRate)}>
                {analytics.averageConversionRate >= 15 ? 'Excellent' : 
                 analytics.averageConversionRate >= 10 ? 'Good' : 'Needs improvement'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Inquiries to consultations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatResponseTime(analytics.averageResponseTime)}
            </div>
            <p className="text-xs text-muted-foreground">
              Average time to respond
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Trend</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.recentMetrics.length > 1 ? 
                (analytics.recentMetrics[0]?.inquiry_count > analytics.recentMetrics[1]?.inquiry_count ? '+' : '') : ''}
              {analytics.recentMetrics[0]?.inquiry_count || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Inquiries this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Patient Relationship Overview */}
      <PatientRelationshipOverview />

      {analytics.recentMetrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Daily metrics for the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.recentMetrics.map((metric) => (
                <div key={metric.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">
                      {new Date(metric.metric_date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {metric.conversion_rate}% conversion rate
                    </p>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div className="text-center">
                      <p className="font-medium">{metric.profile_views}</p>
                      <p className="text-muted-foreground">Views</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium">{metric.inquiry_count}</p>
                      <p className="text-muted-foreground">Inquiries</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium">{metric.consultation_bookings}</p>
                      <p className="text-muted-foreground">Bookings</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TherapistAnalyticsDashboard;
