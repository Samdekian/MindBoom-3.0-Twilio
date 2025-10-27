
import React from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { useAuthRBAC } from '@/contexts/AuthRBACContext';

const SecurityAudit = () => {
  const { user } = useAuthRBAC();

  // Mock security audit data
  const auditResults = [
    {
      category: "Authentication",
      status: "passed",
      score: 95,
      checks: [
        { name: "Two-Factor Authentication", status: "passed", details: "Enabled for all admin accounts" },
        { name: "Password Policy", status: "passed", details: "Strong password requirements enforced" },
        { name: "Session Management", status: "passed", details: "Secure session handling implemented" }
      ]
    },
    {
      category: "Data Protection",
      status: "warning",
      score: 85,
      checks: [
        { name: "Data Encryption", status: "passed", details: "All sensitive data encrypted at rest and in transit" },
        { name: "Backup Security", status: "warning", details: "Backup encryption needs verification" },
        { name: "Access Controls", status: "passed", details: "RBAC system properly configured" }
      ]
    },
    {
      category: "Network Security",
      status: "passed",
      score: 90,
      checks: [
        { name: "HTTPS Enforcement", status: "passed", details: "All traffic encrypted via HTTPS" },
        { name: "API Security", status: "passed", details: "Rate limiting and authentication in place" },
        { name: "Firewall Configuration", status: "passed", details: "Proper network segmentation" }
      ]
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'failed':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const overallScore = Math.round(
    auditResults.reduce((sum, result) => sum + result.score, 0) / auditResults.length
  );

  return (
    <div className="container mx-auto p-6">
      <Helmet>
        <title>Security Audit | Therapy Platform</title>
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Security Audit</h1>
            <p className="text-muted-foreground">
              Comprehensive security assessment and compliance status
            </p>
          </div>
        </div>

        {/* Overall Score */}
        <Card>
          <CardHeader>
            <CardTitle>Overall Security Score</CardTitle>
            <CardDescription>Based on latest security assessment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold text-green-600">{overallScore}%</div>
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-1">Security Posture</div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-green-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${overallScore}%` }}
                  />
                </div>
              </div>
              <Badge className="bg-green-500 text-white">
                {overallScore >= 90 ? 'Excellent' : overallScore >= 80 ? 'Good' : 'Needs Attention'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Audit Categories */}
        <div className="grid gap-6">
          {auditResults.map((category) => (
            <Card key={category.category}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(category.status)}
                    <CardTitle>{category.category}</CardTitle>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold">{category.score}%</span>
                    <Badge className={`${getStatusColor(category.status)} text-white`}>
                      {category.status.charAt(0).toUpperCase() + category.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {category.checks.map((check, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      {getStatusIcon(check.status)}
                      <div className="flex-1">
                        <div className="font-medium">{check.name}</div>
                        <div className="text-sm text-muted-foreground mt-1">{check.details}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Security Recommendations</CardTitle>
            <CardDescription>Actions to improve security posture</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <div className="font-medium">Verify Backup Encryption</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Ensure all backup files are properly encrypted and access is restricted
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SecurityAudit;
