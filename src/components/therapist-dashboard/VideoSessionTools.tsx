
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Video, Users } from 'lucide-react';
import InstantSessionCreator from '@/components/video-conference/InstantSessionCreator';
import ActiveInstantSessions from '@/components/video-conference/ActiveInstantSessions';

const VideoSessionTools: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Video className="h-5 w-5 text-blue-600" />
            Video Session Tools
            <Badge variant="secondary" className="ml-2">
              <Users className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </CardTitle>
          <CardDescription className="text-slate-600">
            Create instant video sessions and manage your active sessions
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-600">
              Start an instant session to quickly connect with patients without scheduling. 
              Share the generated link for immediate access.
            </p>
            <InstantSessionCreator />
          </div>
        </CardContent>
      </Card>

      <ActiveInstantSessions />
    </div>
  );
};

export default VideoSessionTools;
