/**
 * MetricsDemo Page
 * Demo page for connection metrics - now using Twilio Video
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';

const MetricsDemo: React.FC = () => {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Connection Metrics Demo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Twilio Video Metrics
            </CardTitle>
            <CardDescription>
              Connection metrics are now handled by Twilio Video SDK
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The video session system has been migrated to Twilio Video. 
              Connection metrics are available through the Twilio SDK's built-in 
              network quality monitoring.
            </p>
            <div className="space-y-2">
              <Badge variant="outline">Network Quality: Available in session</Badge>
              <Badge variant="outline">Bandwidth: Managed by Twilio</Badge>
              <Badge variant="outline">Packet Loss: Reported per participant</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              To view live metrics, join a video session and check the connection 
              quality indicators in the session interface.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Twilio Network Quality Levels</CardTitle>
            <CardDescription>
              Network quality is reported on a scale of 0-5
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span><strong>5:</strong> Excellent - HD video, no issues</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span><strong>4:</strong> Good - High quality video</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <span><strong>3:</strong> Fair - Standard quality</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-400" />
                <span><strong>2:</strong> Poor - May experience issues</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <span><strong>1:</strong> Bad - Audio only recommended</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400" />
                <span><strong>0:</strong> Unknown - Connection unstable</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MetricsDemo;
