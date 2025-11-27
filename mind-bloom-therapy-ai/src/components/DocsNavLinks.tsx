
import React from "react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, FileText, FileJson, CalendarClock, Webhook, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const DocsNavLinks = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-1">
          Documentation
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>User Guides</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link to="/user-guide" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            User Guide
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/hipaa-privacy" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            HIPAA Privacy
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link to="/security-documentation" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security Documentation
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Developer Resources</DropdownMenuLabel>
        
        <DropdownMenuItem asChild>
          <Link to="/webhook-testing" className="flex items-center gap-2">
            <Webhook className="h-4 w-4" />
            Webhook Testing Guide
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link to="/webhook-documentation" className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4" />
            Calendar Webhook Documentation
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link to="/project-documentation" className="flex items-center gap-2">
            <FileJson className="h-4 w-4" />
            Project Documentation
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DocsNavLinks;
