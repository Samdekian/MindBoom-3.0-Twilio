
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Smartphone, Tablet, Monitor, RotateCcw, Wifi, Battery, Signal } from "lucide-react";

const MobileTesting: React.FC = () => {
  const [selectedDevice, setSelectedDevice] = useState('mobile');
  const [orientation, setOrientation] = useState('portrait');

  const devices = [
    { id: 'mobile', name: 'Mobile Phone', icon: Smartphone, width: '375px', height: '667px' },
    { id: 'tablet', name: 'Tablet', icon: Tablet, width: '768px', height: '1024px' },
    { id: 'desktop', name: 'Desktop', icon: Monitor, width: '1200px', height: '800px' }
  ];

  const testScenarios = [
    {
      name: 'Navigation',
      description: 'Test mobile navigation and menu interactions',
      status: 'pass'
    },
    {
      name: 'Forms',
      description: 'Test form inputs and validation on mobile',
      status: 'pass'
    },
    {
      name: 'Touch Interactions',
      description: 'Test touch gestures and button interactions',
      status: 'warning'
    },
    {
      name: 'Responsive Layout',
      description: 'Test layout adaptation across screen sizes',
      status: 'pass'
    },
    {
      name: 'Performance',
      description: 'Test page load times and performance',
      status: 'fail'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'fail': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const currentDevice = devices.find(d => d.id === selectedDevice);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Smartphone className="h-8 w-8" />
          Mobile Testing Dashboard
        </h1>
        <p className="text-gray-600">Test responsive design and mobile functionality</p>
      </div>

      <Tabs defaultValue="preview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="preview">Device Preview</TabsTrigger>
          <TabsTrigger value="tests">Automated Tests</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="preview">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Device Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Device Controls</CardTitle>
                <CardDescription>Select device and orientation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Device Type:</label>
                  <div className="grid grid-cols-1 gap-2">
                    {devices.map(device => {
                      const Icon = device.icon;
                      return (
                        <Button
                          key={device.id}
                          variant={selectedDevice === device.id ? "default" : "outline"}
                          onClick={() => setSelectedDevice(device.id)}
                          className="flex items-center gap-2 justify-start"
                        >
                          <Icon className="h-4 w-4" />
                          {device.name}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Orientation:</label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={orientation === 'portrait' ? "default" : "outline"}
                      onClick={() => setOrientation('portrait')}
                    >
                      Portrait
                    </Button>
                    <Button
                      size="sm"
                      variant={orientation === 'landscape' ? "default" : "outline"}
                      onClick={() => setOrientation('landscape')}
                    >
                      Landscape
                    </Button>
                  </div>
                </div>

                <Button 
                  className="w-full"
                  onClick={() => setOrientation(orientation === 'portrait' ? 'landscape' : 'portrait')}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Rotate Device
                </Button>
              </CardContent>
            </Card>

            {/* Device Preview */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>{currentDevice?.name} Preview</CardTitle>
                      <CardDescription>
                        {orientation === 'portrait' 
                          ? `${currentDevice?.width} × ${currentDevice?.height}`
                          : `${currentDevice?.height} × ${currentDevice?.width}`
                        }
                      </CardDescription>
                    </div>
                    
                    {/* Mock Device Status */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Signal className="h-4 w-4" />
                        <span>5G</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Wifi className="h-4 w-4" />
                        <span>WiFi</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Battery className="h-4 w-4" />
                        <span>85%</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center">
                    <div 
                      className="border-8 border-gray-800 rounded-3xl bg-black p-2"
                      style={{
                        width: orientation === 'portrait' ? currentDevice?.width : currentDevice?.height,
                        height: orientation === 'portrait' ? currentDevice?.height : currentDevice?.width,
                        maxWidth: '100%',
                        maxHeight: '70vh'
                      }}
                    >
                      <iframe
                        src="/patient"
                        className="w-full h-full rounded-2xl bg-white"
                        title="Mobile Preview"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tests">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Test Results</CardTitle>
                <CardDescription>Automated mobile testing results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {testScenarios.map((test, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{test.name}</h4>
                        <p className="text-sm text-gray-600">{test.description}</p>
                      </div>
                      <Badge className={getStatusColor(test.status)}>
                        {test.status.toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Mobile testing utilities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full">
                  Run All Tests
                </Button>
                <Button variant="outline" className="w-full">
                  Test Touch Events
                </Button>
                <Button variant="outline" className="w-full">
                  Test Form Inputs
                </Button>
                <Button variant="outline" className="w-full">
                  Test Navigation
                </Button>
                <Button variant="outline" className="w-full">
                  Performance Audit
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Page Load Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">2.4s</div>
                <p className="text-sm text-yellow-600">Needs improvement</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>First Contentful Paint</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">1.2s</div>
                <p className="text-sm text-green-600">Good</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lighthouse Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">78</div>
                <p className="text-sm text-yellow-600">Needs improvement</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Performance Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-medium text-yellow-800">Optimize Images</h4>
                  <p className="text-sm text-yellow-700">Compress images to reduce load times by ~30%</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800">Enable Caching</h4>
                  <p className="text-sm text-blue-700">Implement browser caching for static assets</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-800">Good: Code Splitting</h4>
                  <p className="text-sm text-green-700">Code is properly split for optimal loading</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MobileTesting;
