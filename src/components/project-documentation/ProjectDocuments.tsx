
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FileCheck, FileText, Shield } from "lucide-react";

const ProjectDocuments: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Documentation</CardTitle>
        <CardDescription>
          Key documents and resources for the project
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-muted/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-purple-500" />
                <CardTitle className="text-base">HIPAA Roadmap</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-3">
                Detailed roadmap for HIPAA compliance implementation
              </p>
              <a href="/hipaa-roadmap" className="text-sm text-blue-500 hover:underline">
                View Roadmap
              </a>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-base">Privacy Policy</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-3">
                Official privacy policy and data handling practices
              </p>
              <a href="/privacy" className="text-sm text-blue-500 hover:underline">
                View Policy
              </a>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                <CardTitle className="text-base">HIPAA Privacy Practices</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-3">
                Detailed HIPAA privacy and compliance practices
              </p>
              <a href="/hipaa-privacy" className="text-sm text-blue-500 hover:underline">
                View HIPAA Practices
              </a>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectDocuments;
