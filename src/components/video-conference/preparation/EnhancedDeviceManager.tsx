import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Camera, 
  Mic, 
  Volume2, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Settings,
  RefreshCw,
  Play,
  Square
} from 'lucide-react';
import { useMediaDevices } from '@/hooks/webrtc/useMediaDevices';
import { MediaDeviceInfo } from '@/types/video-session';

interface EnhancedDeviceManagerProps {
  permissionsGranted: boolean;
  onDeviceTest: (deviceType: 'camera' | 'microphone' | 'speaker') => Promise<boolean>;
  onRequestPermissions: () => Promise<void>;
  selectedDevices: {
    camera: string | null;
    microphone: string | null;
    speaker: string | null;
  };
  onDeviceChange: (deviceType: 'camera' | 'microphone' | 'speaker', deviceId: string) => void;
}

export const EnhancedDeviceManager: React.FC<EnhancedDeviceManagerProps> = ({
  permissionsGranted,
  onDeviceTest,
  onRequestPermissions,
  selectedDevices,
  onDeviceChange
}) => {
  const { cameras, microphones, speakers, isLoading, error, enumerateDevices } = useMediaDevices(permissionsGranted);
  const [testingDevice, setTestingDevice] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);

  // Auto-refresh devices when permissions are granted
  useEffect(() => {
    if (permissionsGranted) {
      enumerateDevices();
    }
  }, [permissionsGranted, enumerateDevices]);

  const handleDeviceTest = async (deviceType: 'camera' | 'microphone' | 'speaker', deviceId: string) => {
    if (!permissionsGranted) {
      await onRequestPermissions();
      return;
    }

    setTestingDevice(deviceId);
    try {
      const success = await onDeviceTest(deviceType);
      setTestResults(prev => ({ ...prev, [deviceId]: success }));
      
      // Start camera preview for camera tests
      if (deviceType === 'camera' && success) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: deviceId } },
            audio: false
          });
          setPreviewStream(stream);
          
          // Auto-stop preview after 5 seconds
          setTimeout(() => {
            stream.getTracks().forEach(track => track.stop());
            setPreviewStream(null);
          }, 5000);
        } catch (err) {
          console.warn('Could not start camera preview:', err);
        }
      }
    } catch (err) {
      console.error('Device test failed:', err);
      setTestResults(prev => ({ ...prev, [deviceId]: false }));
    } finally {
      setTestingDevice(null);
    }
  };

  const getDeviceIcon = (type: 'camera' | 'microphone' | 'speaker') => {
    switch (type) {
      case 'camera': return Camera;
      case 'microphone': return Mic;
      case 'speaker': return Volume2;
    }
  };

  const getTestResultIcon = (deviceId: string) => {
    if (testingDevice === deviceId) {
      return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
    }
    if (testResults[deviceId] === true) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (testResults[deviceId] === false) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    return <Play className="h-4 w-4 text-muted-foreground" />;
  };

  const DeviceSection = ({ 
    title, 
    devices, 
    deviceType, 
    selectedDevice,
    icon: Icon 
  }: {
    title: string;
    devices: MediaDeviceInfo[];
    deviceType: 'camera' | 'microphone' | 'speaker';
    selectedDevice: string | null;
    icon: React.ElementType;
  }) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        <h3 className="font-medium text-sm">{title}</h3>
        <Badge variant="outline" className="text-xs">
          {devices.length} found
        </Badge>
      </div>
      
      {!permissionsGranted ? (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Permissions required to detect and test devices.
            <Button 
              size="sm" 
              variant="link" 
              className="h-auto p-0 ml-2"
              onClick={onRequestPermissions}
            >
              Grant permissions
            </Button>
          </AlertDescription>
        </Alert>
      ) : devices.length === 0 ? (
        <Alert>
          <XCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            No {deviceType} devices found. Please connect a device and refresh.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-2">
          <Select
            value={selectedDevice || ''}
            onValueChange={(value) => onDeviceChange(deviceType, value)}
            disabled={!permissionsGranted}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={`Select ${deviceType}`} />
            </SelectTrigger>
            <SelectContent>
              {devices.map((device) => (
                <SelectItem key={device.deviceId} value={device.deviceId}>
                  <div className="flex items-center gap-2">
                    <span>{device.label}</span>
                    {testResults[device.deviceId] !== undefined && (
                      getTestResultIcon(device.deviceId)
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedDevice && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDeviceTest(deviceType, selectedDevice)}
              disabled={testingDevice === selectedDevice}
              className="w-full"
            >
              {getTestResultIcon(selectedDevice)}
              <span className="ml-2">
                {testingDevice === selectedDevice 
                  ? 'Testing...' 
                  : testResults[selectedDevice] === true
                    ? 'Test Passed'
                    : testResults[selectedDevice] === false
                      ? 'Test Failed - Retry'
                      : `Test ${title}`
                }
              </span>
            </Button>
          )}
        </div>
      )}
    </div>
  );

  const stopPreview = () => {
    if (previewStream) {
      previewStream.getTracks().forEach(track => track.stop());
      setPreviewStream(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Device Manager
          {isLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <DeviceSection
          title="Camera"
          devices={cameras}
          deviceType="camera"
          selectedDevice={selectedDevices.camera}
          icon={Camera}
        />

        <DeviceSection
          title="Microphone"
          devices={microphones}
          deviceType="microphone"
          selectedDevice={selectedDevices.microphone}
          icon={Mic}
        />

        <DeviceSection
          title="Speakers"
          devices={speakers}
          deviceType="speaker"
          selectedDevice={selectedDevices.speaker}
          icon={Volume2}
        />

        {/* Camera Preview */}
        {previewStream && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Camera Preview</span>
              <Button size="sm" variant="outline" onClick={stopPreview}>
                <Square className="h-3 w-3 mr-2" />
                Stop
              </Button>
            </div>
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              <video
                autoPlay
                muted
                playsInline
                ref={(video) => {
                  if (video && previewStream) {
                    video.srcObject = previewStream;
                  }
                }}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {permissionsGranted && (
          <div className="pt-4 border-t">
            <Button
              size="sm"
              variant="outline"
              onClick={enumerateDevices}
              disabled={isLoading}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Devices
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};