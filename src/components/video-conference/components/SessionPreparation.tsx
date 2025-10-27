
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Video, Mic, Settings, Loader2 } from 'lucide-react';
import { useVideoSession } from '@/contexts/VideoSessionContext';
import { cn } from '@/lib/utils';

interface SessionPreparationProps {
  appointmentId: string;
  onComplete: () => void;
}

const SessionPreparation: React.FC<SessionPreparationProps> = ({
  appointmentId,
  onComplete
}) => {
  const {
    videoState,
    isTherapist,
    therapistInfo,
    patientInfo,
    deviceSettingsOpen,
    setDeviceSettingsOpen,
    cameraStatus,
    cameras,
    microphones,
    speakers,
    changeDevice,
    testDevices,
    localVideoRef
  } = useVideoSession();

  const [preparationStep, setPreparationStep] = useState<'permissions' | 'devices' | 'ready'>('permissions');
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [devicesChecked, setDevicesChecked] = useState(false);
  const [isTestingDevices, setIsTestingDevices] = useState(false);
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);

  // Initialize permissions check
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        
        setPreviewStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        
        setPermissionsGranted(true);
        setPreparationStep('devices');
      } catch (error) {
        console.error('Permission check failed:', error);
        setPermissionsGranted(false);
      }
    };

    if (preparationStep === 'permissions') {
      checkPermissions();
    }
  }, [preparationStep, localVideoRef]);

  // Cleanup preview stream on unmount
  useEffect(() => {
    return () => {
      if (previewStream) {
        previewStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [previewStream]);

  const handleTestDevices = async () => {
    setIsTestingDevices(true);
    try {
      const result = await testDevices();
      if (result) {
        setDevicesChecked(true);
        setPreparationStep('ready');
      }
    } finally {
      setIsTestingDevices(false);
    }
  };

  const handleComplete = () => {
    // Stop preview stream before completing
    if (previewStream) {
      previewStream.getTracks().forEach(track => track.stop());
      setPreviewStream(null);
    }
    onComplete();
  };

  const preparationSteps = [
    {
      id: 'permissions',
      title: 'Camera & Microphone Access',
      status: permissionsGranted ? 'completed' : 'current',
      description: 'Grant access to your camera and microphone'
    },
    {
      id: 'devices',
      title: 'Device Check',
      status: devicesChecked ? 'completed' : permissionsGranted ? 'current' : 'pending',
      description: 'Test your camera and microphone'
    },
    {
      id: 'ready',
      title: 'Ready to Join',
      status: preparationStep === 'ready' ? 'current' : 'pending',
      description: 'All systems ready for your session'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Prepare for Your Session</h1>
          <p className="text-muted-foreground">
            Let's make sure everything is working before you join
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {preparationSteps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                    step.status === 'completed' && "bg-green-500 text-white",
                    step.status === 'current' && "bg-primary text-white",
                    step.status === 'pending' && "bg-gray-200 text-gray-500"
                  )}>
                    {step.status === 'completed' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="ml-2 hidden sm:block">
                    <div className="text-sm font-medium">{step.title}</div>
                    <div className="text-xs text-muted-foreground">{step.description}</div>
                  </div>
                </div>
                {index < preparationSteps.length - 1 && (
                  <div className="w-8 h-0.5 bg-gray-200" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Video Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Video Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden relative">
                {permissionsGranted ? (
                  <video 
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <div className="text-center">
                      <Video className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Camera access needed</p>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
                  {isTherapist ? therapistInfo?.name : patientInfo?.name}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Setup Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Session Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Permissions Step */}
              {preparationStep === 'permissions' && (
                <div>
                  <h3 className="font-medium mb-2">Camera & Microphone Access</h3>
                  {cameraStatus === 'permission-denied' ? (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Camera access was denied. Please enable it in your browser settings and refresh the page.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Please allow access to your camera and microphone when prompted.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {/* Device Check Step */}
              {preparationStep === 'devices' && (
                <div>
                  <h3 className="font-medium mb-4">Test Your Devices</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Camera</label>
                      <select 
                        className="w-full mt-1 p-2 border rounded-md"
                        onChange={(e) => changeDevice('camera', e.target.value)}
                        value={videoState.selectedCamera || ''}
                      >
                        <option value="">Select Camera</option>
                        {cameras.map(device => (
                          <option key={device.deviceId} value={device.deviceId}>
                            {device.label || `Camera ${device.deviceId.slice(0, 5)}`}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Microphone</label>
                      <select 
                        className="w-full mt-1 p-2 border rounded-md"
                        onChange={(e) => changeDevice('microphone', e.target.value)}
                        value={videoState.selectedMicrophone || ''}
                      >
                        <option value="">Select Microphone</option>
                        {microphones.map(device => (
                          <option key={device.deviceId} value={device.deviceId}>
                            {device.label || `Microphone ${device.deviceId.slice(0, 5)}`}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Speaker</label>
                      <select 
                        className="w-full mt-1 p-2 border rounded-md"
                        onChange={(e) => changeDevice('speaker', e.target.value)}
                        value={videoState.selectedSpeaker || ''}
                      >
                        <option value="">Select Speaker</option>
                        {speakers.map(device => (
                          <option key={device.deviceId} value={device.deviceId}>
                            {device.label || `Speaker ${device.deviceId.slice(0, 5)}`}
                          </option>
                        ))}
                      </select>
                    </div>

                    <Button 
                      onClick={handleTestDevices}
                      disabled={isTestingDevices}
                      className="w-full"
                    >
                      {isTestingDevices ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Testing Devices...
                        </>
                      ) : (
                        <>
                          <Mic className="mr-2 h-4 w-4" />
                          Test Devices
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Ready Step */}
              {preparationStep === 'ready' && (
                <div>
                  <div className="text-center py-6">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">All Set!</h3>
                    <p className="text-muted-foreground mb-6">
                      Your camera and microphone are working properly. You're ready to join the session.
                    </p>
                    <Button 
                      onClick={handleComplete}
                      size="lg"
                      className="px-8"
                    >
                      Join Session
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SessionPreparation;
