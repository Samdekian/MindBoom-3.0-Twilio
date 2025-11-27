import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, Mic, Volume2, TestTube, CheckCircle, XCircle } from 'lucide-react';
import { useVideoSession } from '@/contexts/TwilioVideoSessionContext';
import { useState } from 'react';

interface DeviceSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DeviceSettings: React.FC<DeviceSettingsProps> = ({
  open,
  onOpenChange
}) => {
  const {
    cameras,
    microphones,
    speakers,
    changeDevice,
    testDevices,
    cameraStatus
  } = useVideoSession();

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<boolean | null>(null);

  const handleDeviceChange = async (type: 'camera' | 'microphone' | 'speaker', deviceId: string) => {
    try {
      await changeDevice(type, deviceId);
    } catch (error) {
      console.error(`Failed to change ${type}:`, error);
    }
  };

  const handleTestDevices = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const result = await testDevices();
      setTestResult(result);
    } finally {
      setIsTesting(false);
    }
  };

  const getDeviceStatusBadge = () => {
    switch (cameraStatus) {
      case 'available':
        return <Badge className="gap-1"><CheckCircle className="h-3 w-3" /> Available</Badge>;
      case 'permission-denied':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Permission Denied</Badge>;
      case 'unavailable':
        return <Badge variant="secondary" className="gap-1"><XCircle className="h-3 w-3" /> Unavailable</Badge>;
      case 'requesting':
        return <Badge variant="outline" className="gap-1">Requesting Access...</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Device Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Device Status */}
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Device Status</Label>
            {getDeviceStatusBadge()}
          </div>

          {/* Camera Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Camera className="h-4 w-4" />
              Camera
            </Label>
            <Select onValueChange={(value) => handleDeviceChange('camera', value)}>
              <SelectTrigger>
                <SelectValue placeholder={
                  cameras.length > 0 
                    ? cameras[0]?.label || "Default Camera"
                    : "No cameras available"
                } />
              </SelectTrigger>
              <SelectContent>
                {cameras.map((camera) => (
                  <SelectItem key={camera.deviceId} value={camera.deviceId}>
                    {camera.label || `Camera ${camera.deviceId.slice(0, 8)}...`}
                  </SelectItem>
                ))}
                {cameras.length === 0 && (
                  <SelectItem value="none" disabled>
                    No cameras available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Microphone Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Mic className="h-4 w-4" />
              Microphone
            </Label>
            <Select onValueChange={(value) => handleDeviceChange('microphone', value)}>
              <SelectTrigger>
                <SelectValue placeholder={
                  microphones.length > 0 
                    ? microphones[0]?.label || "Default Microphone"
                    : "No microphones available"
                } />
              </SelectTrigger>
              <SelectContent>
                {microphones.map((microphone) => (
                  <SelectItem key={microphone.deviceId} value={microphone.deviceId}>
                    {microphone.label || `Microphone ${microphone.deviceId.slice(0, 8)}...`}
                  </SelectItem>
                ))}
                {microphones.length === 0 && (
                  <SelectItem value="none" disabled>
                    No microphones available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Speaker Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Volume2 className="h-4 w-4" />
              Speaker
            </Label>
            <Select onValueChange={(value) => handleDeviceChange('speaker', value)}>
              <SelectTrigger>
                <SelectValue placeholder={
                  speakers.length > 0 
                    ? speakers[0]?.label || "Default Speaker"
                    : "No speakers available"
                } />
              </SelectTrigger>
              <SelectContent>
                {speakers.map((speaker) => (
                  <SelectItem key={speaker.deviceId} value={speaker.deviceId}>
                    {speaker.label || `Speaker ${speaker.deviceId.slice(0, 8)}...`}
                  </SelectItem>
                ))}
                {speakers.length === 0 && (
                  <SelectItem value="none" disabled>
                    No speakers available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Device Test */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Test Devices</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Verify that your camera and microphone are working
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestDevices}
                disabled={isTesting}
                className="gap-2"
              >
                <TestTube className="h-4 w-4" />
                {isTesting ? 'Testing...' : 'Test'}
              </Button>
            </div>

            {testResult !== null && (
              <div className={`mt-2 p-2 rounded text-xs ${
                testResult 
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {testResult 
                  ? '✅ Device test successful - camera and microphone are working'
                  : '❌ Device test failed - check your device connections and permissions'
                }
              </div>
            )}
          </div>

          {/* Device Info */}
          <div className="text-xs text-muted-foreground space-y-1">
            <div>Cameras detected: {cameras.length}</div>
            <div>Microphones detected: {microphones.length}</div>
            <div>Speakers detected: {speakers.length}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeviceSettings;