
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { MessageSquare } from "lucide-react";

const NavbarLinks = () => {
  const location = useLocation();
  
  return (
    <div className="flex items-center space-x-6">
      <Link
        to="/chat"
        className={cn(
          "flex items-center gap-2 text-sm font-medium transition-colors hover:text-therapy-purple",
          location.pathname === "/chat" 
            ? "text-therapy-purple" 
            : "text-gray-700 dark:text-gray-300"
        )}
      >
        <MessageSquare className="w-4 h-4" />
        AI Chat
      </Link>
    </div>
  );
};

export default NavbarLinks;
