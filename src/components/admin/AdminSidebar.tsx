
import React from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Users, Settings, Shield, FileText, BarChart, 
  ShieldAlert, ScrollText, Lock, Database, Home,
  UserCheck, Server, TrendingUp, Clock
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ADMIN_PATHS } from "@/routes/routePaths";

interface AdminSidebarProps {
  collapsed?: boolean;
  toggleSidebar?: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ collapsed = false, toggleSidebar }) => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  const navItems = [
    { name: "Dashboard", path: ADMIN_PATHS.DASHBOARD, icon: BarChart },
    { name: "Users", path: "/admin/users", icon: Users },
    { name: "RBAC", path: ADMIN_PATHS.RBAC, icon: Shield },
    { name: "Role Management", path: ADMIN_PATHS.ROLE_MANAGEMENT, icon: Shield },
    { name: "Security", path: ADMIN_PATHS.SECURITY_DASHBOARD, icon: Lock },
    { name: "Therapist Approval", path: ADMIN_PATHS.THERAPIST_APPROVAL, icon: UserCheck },
    { name: "Reports", path: ADMIN_PATHS.REPORTS, icon: TrendingUp },
    { name: "System", path: ADMIN_PATHS.SYSTEM, icon: Server },
    { divider: true },
    { name: "Main App", path: "/dashboard", icon: Home }
  ];

  return (
    <aside className={cn(
      "h-full bg-slate-900 text-white overflow-hidden transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className={cn(
        "p-4 flex items-center gap-2 border-b border-slate-700",
        collapsed ? "justify-center" : "justify-between"
      )}>
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span className="font-bold whitespace-nowrap">Admin Portal</span>}
        </div>
      </div>
      
      <nav className="p-2">
        <ul className="space-y-1">
          {navItems.map((item, index) => 
            item.divider ? (
              <li key={`divider-${index}`} className="my-2 border-t border-slate-700" />
            ) : (
              <li key={item.path}>
                {collapsed ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          to={item.path}
                          className={cn(
                            "flex items-center justify-center p-2 rounded-md",
                            isActive(item.path) 
                              ? "bg-primary text-primary-foreground" 
                              : "hover:bg-slate-800"
                          )}
                        >
                          <item.icon className="h-5 w-5" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">{item.name}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm",
                      isActive(item.path) 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-slate-800"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                )}
              </li>
            )
          )}
        </ul>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
