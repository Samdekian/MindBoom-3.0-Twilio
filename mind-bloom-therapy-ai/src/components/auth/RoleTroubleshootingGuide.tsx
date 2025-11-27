
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BookOpen, RefreshCw, ShieldAlert, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

const RoleTroubleshootingGuide: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BookOpen className="h-5 w-5 mr-2 text-primary" />
          Role Troubleshooting Guide
        </CardTitle>
        <CardDescription>
          Common issues and solutions for role synchronization
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-base font-medium">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                Understanding Role Inconsistency
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm space-y-2">
              <p>
                Role inconsistency occurs when a user's roles are different across three systems:
              </p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Database roles (in the user_roles table)</li>
                <li>Profile account type (in the profiles table)</li>
                <li>User metadata (in auth.users)</li>
              </ol>
              <p className="pt-1">
                All three should reflect the same primary role for proper functionality.
              </p>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-2">
            <AccordionTrigger className="text-base font-medium">
              <div className="flex items-center">
                <ShieldAlert className="h-4 w-4 mr-2 text-red-500" />
                Common Causes of Role Issues
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm space-y-2">
              <ul className="space-y-2">
                <li className="flex items-start">
                  <XCircle className="h-4 w-4 mr-2 text-red-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Direct database edits</strong>: Manually editing roles without using the proper API</span>
                </li>
                <li className="flex items-start">
                  <XCircle className="h-4 w-4 mr-2 text-red-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Race conditions</strong>: Multiple simultaneous updates to a user's roles</span>
                </li>
                <li className="flex items-start">
                  <XCircle className="h-4 w-4 mr-2 text-red-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Failed migrations</strong>: Incomplete data migration or database updates</span>
                </li>
                <li className="flex items-start">
                  <XCircle className="h-4 w-4 mr-2 text-red-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Error handling</strong>: Unhandled errors during role assignment</span>
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-3">
            <AccordionTrigger className="text-base font-medium">
              <div className="flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                Automatic Repair Process
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm space-y-2">
              <p>
                The automatic repair process follows these steps:
              </p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Fetch all roles from the user_roles table</li>
                <li>Determine the primary role using the role precedence hierarchy</li>
                <li>Update the profile.account_type to match the primary role</li>
                <li>Update the auth.users metadata to match the primary role</li>
                <li>Verify all systems are synchronized</li>
              </ol>
              <p className="pt-1">
                This process ensures all systems refer to the same primary role.
              </p>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-4">
            <AccordionTrigger className="text-base font-medium">
              <div className="flex items-center">
                <RefreshCw className="h-4 w-4 mr-2 text-blue-500" />
                How Role Synchronization Works
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm space-y-2">
              <p>
                Role synchronization happens automatically in several ways:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Database triggers</strong>: Update metadata and profile when roles change</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Auth hooks</strong>: Check and repair roles during login/signup</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Background service</strong>: Periodically verify role consistency</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Manual trigger</strong>: Using the "Sync Profile" button</span>
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-5">
            <AccordionTrigger className="text-base font-medium">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                When to Contact Support
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm space-y-2">
              <p>
                Contact the support team if:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <AlertTriangle className="h-4 w-4 mr-2 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span>Automatic repair fails multiple times</span>
                </li>
                <li className="flex items-start">
                  <AlertTriangle className="h-4 w-4 mr-2 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span>You see persistent role inconsistency errors</span>
                </li>
                <li className="flex items-start">
                  <AlertTriangle className="h-4 w-4 mr-2 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span>You've lost access to features you should have</span>
                </li>
                <li className="flex items-start">
                  <AlertTriangle className="h-4 w-4 mr-2 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span>You need to modify roles but don't have admin access</span>
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default RoleTroubleshootingGuide;
