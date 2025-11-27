
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Calendar, 
  Video, 
  Users, 
  Settings, 
  Activity, 
  Clock,
  LineChart,
  Trophy,
  Zap,
  BookOpen,
  PlusCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";

/**
 * QuickActions Component
 * 
 * Displays a grid of action buttons that provide quick access to key features.
 * The buttons shown adapt based on the user's role:
 * 
 * - Patients: Appointments, Video Sessions, Progress, Settings
 * - Therapists: Patients, Schedule, Treatment Goals, Settings
 * - Admins: Additional admin-specific actions
 * 
 * This component helps users quickly navigate to their most important tasks.
 */
export function QuickActions() {
  const { user, hasRole } = useAuthRBAC();
  const isAdmin = hasRole('admin');
  const isTherapist = hasRole('therapist');
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Common actions for all users */}
          <Link to="/calendar">
            <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
              <Calendar className="h-6 w-6" />
              <span>{isTherapist ? 'Schedule' : 'Appointments'}</span>
            </Button>
          </Link>
          
          <Link to="/video-session">
            <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
              <Video className="h-6 w-6" />
              <span>Video Session</span>
            </Button>
          </Link>
          
          {/* Therapist-specific actions */}
          {isTherapist && (
            <>
              <Link to="/therapist?tab=patients">
                <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                  <Users className="h-6 w-6" />
                  <span>Patients</span>
                </Button>
              </Link>
              
              <Link to="/therapist?tab=availability">
                <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                  <Clock className="h-6 w-6" />
                  <span>Availability</span>
                </Button>
              </Link>
              
              <Link to="/therapist?tab=analytics">
                <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                  <LineChart className="h-6 w-6" />
                  <span>Analytics</span>
                </Button>
              </Link>
              
              <Link to="/goals">
                <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                  <Trophy className="h-6 w-6" />
                  <span>Treatment Goals</span>
                </Button>
              </Link>
            </>
          )}
          
          {/* Patient-specific actions */}
          {!isTherapist && !isAdmin && (
            <>
              <Link to="/book-therapist">
                <Button variant="outline" className="w-full h-24 flex flex-col gap-2 bg-blue-50 hover:bg-blue-100">
                  <PlusCircle className="h-6 w-6 text-blue-600" />
                  <span className="text-blue-700">Book Session</span>
                </Button>
              </Link>
            
              <Link to="/progress">
                <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                  <Activity className="h-6 w-6" />
                  <span>My Progress</span>
                </Button>
              </Link>
              
              <Link to="/resources">
                <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                  <BookOpen className="h-6 w-6" />
                  <span>Resources</span>
                </Button>
              </Link>
            </>
          )}
          
          {/* Admin-specific actions */}
          {isAdmin && (
            <Link to="/admin/performance">
              <Button variant="outline" className="w-full h-24 flex flex-col gap-2 bg-amber-50 hover:bg-amber-100 border-amber-200">
                <Zap className="h-6 w-6 text-amber-600" />
                <span className="text-amber-800">Admin Panel</span>
              </Button>
            </Link>
          )}
          
          {/* Settings button for everyone */}
          <Link to="/settings">
            <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
              <Settings className="h-6 w-6" />
              <span>Settings</span>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default QuickActions;
