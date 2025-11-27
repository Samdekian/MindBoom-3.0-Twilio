
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, ShieldAlert, Users, Wrench } from "lucide-react";

// Import markdown content as strings
import readmeContent from './README.md?raw';
import adminGuideContent from './admin-guide.md?raw';
import developerGuideContent from './developer-guide.md?raw';
import userGuideContent from './user-guide.md?raw';
import troubleshootingContent from './troubleshooting.md?raw';

// Import markdown renderer
import ReactMarkdown from 'react-markdown';

const RBACDocumentation: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState("overview");

  // Map of tab IDs to markdown content
  const tabContent = {
    "overview": readmeContent,
    "admin": adminGuideContent,
    "developer": developerGuideContent,
    "user": userGuideContent,
    "troubleshooting": troubleshootingContent
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">RBAC System Documentation</h1>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center">
            <BookOpen className="mr-2 h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="admin" className="flex items-center">
            <ShieldAlert className="mr-2 h-4 w-4" />
            <span>Admin Guide</span>
          </TabsTrigger>
          <TabsTrigger value="developer" className="flex items-center">
            <Wrench className="mr-2 h-4 w-4" />
            <span>Developer Guide</span>
          </TabsTrigger>
          <TabsTrigger value="user" className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            <span>User Guide</span>
          </TabsTrigger>
          <TabsTrigger value="troubleshooting" className="flex items-center">
            <FileText className="mr-2 h-4 w-4" />
            <span>Troubleshooting</span>
          </TabsTrigger>
        </TabsList>
        
        {Object.keys(tabContent).map(tabId => (
          <TabsContent key={tabId} value={tabId} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {tabId === "overview" && "RBAC System Overview"}
                  {tabId === "admin" && "Administrator Guide"}
                  {tabId === "developer" && "Developer Guide"}
                  {tabId === "user" && "User Guide"}
                  {tabId === "troubleshooting" && "Troubleshooting Guide"}
                </CardTitle>
                <CardDescription>
                  {tabId === "overview" && "Comprehensive overview of the RBAC system"}
                  {tabId === "admin" && "Guide for system administrators"}
                  {tabId === "developer" && "Technical documentation for developers"}
                  {tabId === "user" && "Guide for end users"}
                  {tabId === "troubleshooting" && "Solutions for common issues"}
                </CardDescription>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <ReactMarkdown>
                  {tabContent[tabId as keyof typeof tabContent]}
                </ReactMarkdown>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => window.print()}>
                  Print Documentation
                </Button>
                <Button variant="outline" onClick={() => {
                  const blob = new Blob([tabContent[tabId as keyof typeof tabContent]], { type: 'text/markdown' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `rbac-${tabId}-guide.md`;
                  a.click();
                }}>
                  Download Markdown
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default RBACDocumentation;
