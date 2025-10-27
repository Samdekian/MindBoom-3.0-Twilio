
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Code, Eye, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ComponentLibrary: React.FC = () => {
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, componentName: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(componentName);
    toast({
      title: "Code Copied",
      description: `${componentName} code copied to clipboard`
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const ComponentDemo = ({ title, description, code, children }: {
    title: string;
    description: string;
    code: string;
    children: React.ReactNode;
  }) => (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => copyToClipboard(code, title)}
            className="flex items-center gap-2"
          >
            {copiedCode === title ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            Copy Code
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="preview">
          <TabsList className="mb-4">
            <TabsTrigger value="preview">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="code">
              <Code className="h-4 w-4 mr-2" />
              Code
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="preview">
            <div className="p-4 border rounded-lg bg-gray-50">
              {children}
            </div>
          </TabsContent>
          
          <TabsContent value="code">
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{code}</code>
            </pre>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Code className="h-8 w-8" />
          Component Library
        </h1>
        <p className="text-gray-600">Interactive showcase of all available UI components</p>
      </div>

      <Tabs defaultValue="buttons" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="buttons">Buttons</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="data">Data Display</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="navigation">Navigation</TabsTrigger>
        </TabsList>

        <TabsContent value="buttons">
          <ComponentDemo
            title="Button Variants"
            description="Different button styles and states"
            code={`<Button>Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>`}
          >
            <div className="flex flex-wrap gap-2">
              <Button>Default</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
          </ComponentDemo>

          <ComponentDemo
            title="Button Sizes"
            description="Different button sizes"
            code={`<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>`}
          >
            <div className="flex items-center gap-2">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
            </div>
          </ComponentDemo>
        </TabsContent>

        <TabsContent value="forms">
          <ComponentDemo
            title="Input Components"
            description="Form input elements"
            code={`<Input placeholder="Enter text..." />
<Textarea placeholder="Enter description..." />
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>`}
          >
            <div className="space-y-4 max-w-md">
              <Input placeholder="Enter text..." />
              <Textarea placeholder="Enter description..." />
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="option1">Option 1</SelectItem>
                  <SelectItem value="option2">Option 2</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center space-x-2">
                <Switch id="example-switch" />
                <label htmlFor="example-switch">Enable notifications</label>
              </div>
            </div>
          </ComponentDemo>
        </TabsContent>

        <TabsContent value="data">
          <ComponentDemo
            title="Badges"
            description="Status and category indicators"
            code={`<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>`}
          >
            <div className="flex gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </ComponentDemo>

          <ComponentDemo
            title="Cards"
            description="Content containers"
            code={`<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    Card content goes here.
  </CardContent>
</Card>`}
          >
            <Card className="max-w-md">
              <CardHeader>
                <CardTitle>Example Card</CardTitle>
                <CardDescription>This is an example card description</CardDescription>
              </CardHeader>
              <CardContent>
                <p>This is the card content area where you can place any information.</p>
              </CardContent>
            </Card>
          </ComponentDemo>
        </TabsContent>

        <TabsContent value="feedback">
          <ComponentDemo
            title="Alerts"
            description="User feedback and notifications"
            code={`<Alert>
  <AlertDescription>
    This is a default alert message.
  </AlertDescription>
</Alert>
<Alert variant="destructive">
  <AlertDescription>
    This is a destructive alert message.
  </AlertDescription>
</Alert>`}
          >
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  This is a default alert message.
                </AlertDescription>
              </Alert>
              <Alert variant="destructive">
                <AlertDescription>
                  This is a destructive alert message.
                </AlertDescription>
              </Alert>
            </div>
          </ComponentDemo>
        </TabsContent>

        <TabsContent value="navigation">
          <ComponentDemo
            title="Tabs"
            description="Navigation between content sections"
            code={`<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>`}
          >
            <Tabs defaultValue="tab1" className="max-w-md">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                <TabsTrigger value="tab2">Tab 2</TabsTrigger>
              </TabsList>
              <TabsContent value="tab1" className="mt-4">
                <p>This is the content for Tab 1</p>
              </TabsContent>
              <TabsContent value="tab2" className="mt-4">
                <p>This is the content for Tab 2</p>
              </TabsContent>
            </Tabs>
          </ComponentDemo>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComponentLibrary;
