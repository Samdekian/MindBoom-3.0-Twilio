
import React, { useState } from "react";
import { createAdminUser } from "@/utils/admin/createAdminUser";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { ADMIN_PATHS } from "@/routes/routePaths";
import { useToast } from "@/hooks/use-toast";

const AdminSetup: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    message?: string;
  }>({});
  const { toast } = useToast();

  const handleCreateAdmin = async () => {
    setIsLoading(true);
    try {
      const result = await createAdminUser();
      setResult(result);
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "An unexpected error occurred",
          variant: "destructive",
        });
      }
      
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || "An unexpected error occurred"
      });
      
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Setup</CardTitle>
          <CardDescription>
            Create or update the admin user account
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {result.message && (
            <Alert variant={result.success ? "default" : "destructive"}>
              {result.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>
                {result.message}
                {!result.success && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">If this is a user role or approval status issue, you can try:</p>
                    <Link 
                      to="/admin/user-metadata-fixer" 
                      className="text-sm underline hover:text-primary mt-1 inline-block"
                    >
                      Click here to use the User Metadata Fixer tool
                    </Link>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
          
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              This will create an admin user with the following credentials:
            </p>
            <div className="rounded-md bg-slate-100 dark:bg-slate-800 p-4">
              <p><strong>Email:</strong> samdekian@gmail.com</p>
              <p><strong>Password:</strong> 7a9SWrAjv9kGfAq</p>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              After creation, use these credentials to log in. If you encounter any login issues:
            </p>
            <ol className="text-sm list-decimal pl-5 mt-2 space-y-1">
              <li>Make sure the user has been created successfully</li>  
              <li>Check that the admin role has been assigned correctly</li>
              <li>Verify that the approval status is set to 'approved'</li>
              <li>If needed, use the User Metadata Fixer (linked below) to fix any issues</li>
            </ol>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-wrap gap-2">
          <Button
            onClick={handleCreateAdmin}
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Admin User"}
          </Button>
          
          {result.success && (
            <Button variant="outline" asChild>
              <Link to={ADMIN_PATHS.DASHBOARD}>Go to Admin Dashboard</Link>
            </Button>
          )}
          
          <Button variant="outline" asChild>
            <Link to="/admin/user-metadata-fixer">User Metadata Fixer</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminSetup;
