
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PUBLIC_PATHS } from "@/routes/routePaths";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { useMigrationTracking } from "@/utils/migration/migration-helpers";

interface NavItem {
  path: string;
  label: string;
  roles?: string[];
}

const NavigationItems = () => {
  const location = useLocation();
  const { isAuthenticated, primaryRole } = useAuthRBAC();

  // Track migration
  useMigrationTracking('NavigationItems', 'useAuthRBAC');

  const publicNavItems: NavItem[] = [
    {
      path: PUBLIC_PATHS.HOME,
      label: "Home",
    },
    {
      path: PUBLIC_PATHS.ABOUT,
      label: "About",
    },
    {
      path: PUBLIC_PATHS.PRICING,
      label: "Pricing",
    },
    {
      path: PUBLIC_PATHS.CONTACT,
      label: "Contact",
    },
  ];

  const authenticatedNavItems: NavItem[] = [
    {
      path: "/patient",
      label: "Dashboard",
      roles: ["patient"]
    },
    {
      path: "/therapist",
      label: "Dashboard",
      roles: ["therapist"]
    },
    {
      path: "/admin",
      label: "Dashboard",
      roles: ["admin"]
    }
  ];

  const shouldShowNavItem = (item: NavItem) => {
    if (!item.roles) return true;
    if (!isAuthenticated || !primaryRole) return false;
    return item.roles.includes(primaryRole);
  };

  const isActivePath = (itemPath: string) => {
    return location.pathname.startsWith(itemPath) || location.pathname === itemPath;
  };

  const allNavItems = [
    ...(!isAuthenticated ? publicNavItems : []),
    ...(isAuthenticated ? authenticatedNavItems.filter(shouldShowNavItem) : []),
  ];

  return (
    <div className="flex flex-col space-y-2 p-4">
      {allNavItems.map((item) => (
        <Button
          key={item.path}
          variant={isActivePath(item.path) ? "default" : "ghost"}
          size="sm"
          asChild
          className={cn(
            "justify-start text-sm font-medium transition-colors w-full",
            isActivePath(item.path)
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Link to={item.path}>
            {item.label}
          </Link>
        </Button>
      ))}
    </div>
  );
};

export default NavigationItems;
