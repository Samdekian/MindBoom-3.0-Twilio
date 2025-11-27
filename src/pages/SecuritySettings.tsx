
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Lock, Smartphone, Eye, Bell, Key } from "lucide-react";
import useRequireAuth from '@/hooks/useRequireAuth';
import { SimpleLoading } from '@/components/ui/simple-loading';
import { useToast } from '@/hooks/use-toast';

const SecuritySettings: React.FC = () => {
  const { loading } = useRequireAuth();
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);

  if (loading) {
    return <SimpleLoading text="Loading security settings..." className="min-h-screen" />;
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }

    // Here you would implement actual password change logic
    toast({
      title: "Password Updated",
      description: "Your password has been successfully updated"
    });
    
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleTwoFactorToggle = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    toast({
      title: twoFactorEnabled ? "2FA Disabled" : "2FA Enabled",
      description: twoFactorEnabled 
        ? "Two-factor authentication has been disabled" 
        : "Two-factor authentication has been enabled"
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8" />
          Security Settings
        </h1>
        <p className="text-gray-600 mt-1">
          Manage your account security and privacy preferences
        </p>
      </div>

      <Tabs defaultValue="password" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="two-factor">2FA</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                
                <Button type="submit" className="w-full">
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="two-factor">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Two-Factor Authentication
              </CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-medium">Enable 2FA</h3>
                  <p className="text-sm text-gray-600">
                    Secure your account with two-factor authentication
                  </p>
                </div>
                <Switch
                  checked={twoFactorEnabled}
                  onCheckedChange={handleTwoFactorToggle}
                />
              </div>
              
              {twoFactorEnabled && (
                <Alert>
                  <Key className="h-4 w-4" />
                  <AlertDescription>
                    Two-factor authentication is enabled. You'll need your authenticator app to sign in.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-4">
                <Button variant="outline" className="w-full">
                  {twoFactorEnabled ? 'Reconfigure 2FA' : 'Set up 2FA'}
                </Button>
                
                {twoFactorEnabled && (
                  <Button variant="outline" className="w-full">
                    View Recovery Codes
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Active Sessions
              </CardTitle>
              <CardDescription>
                Manage devices that are currently signed into your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Current Session</h3>
                    <p className="text-sm text-gray-600">Chrome on Windows • Active now</p>
                  </div>
                  <Button variant="outline" size="sm">
                    This device
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Mobile App</h3>
                    <p className="text-sm text-gray-600">iPhone • Last active 2 hours ago</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Sign out
                  </Button>
                </div>
              </div>
              
              <div className="mt-6">
                <Button variant="destructive" className="w-full">
                  Sign out of all other sessions
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Security Notifications
              </CardTitle>
              <CardDescription>
                Choose how you want to be notified about security events
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-medium">Email Notifications</h3>
                  <p className="text-sm text-gray-600">
                    Get notified about login attempts and security changes
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-medium">SMS Notifications</h3>
                  <p className="text-sm text-gray-600">
                    Receive security alerts via text message
                  </p>
                </div>
                <Switch
                  checked={smsNotifications}
                  onCheckedChange={setSmsNotifications}
                />
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium">Notification Types</h3>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">New device sign-ins</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Password changes</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Failed login attempts</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Account settings changes</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecuritySettings;
