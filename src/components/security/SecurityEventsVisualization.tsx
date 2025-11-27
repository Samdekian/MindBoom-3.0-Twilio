import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AlertCircle, CheckCircle, Info, Loader2, XCircle } from "lucide-react";
import { SecurityAlert } from '@/types/core/rbac';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { formatDistanceToNow } from 'date-fns';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator";
import { useToast } from '@/hooks/use-toast';
import { AlertService } from '@/services/rbac/alert-service';

interface SecurityEventsVisualizationProps {
  alerts?: SecurityAlert[];
  isLoading?: boolean;
  error?: string | null;
}

const SecurityEventsVisualization: React.FC<SecurityEventsVisualizationProps> = ({ alerts, isLoading, error }) => {
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(null);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [isResolving, setIsResolving] = useState(false);

  useEffect(() => {
    if (open && !selectedAlert) {
      setOpen(false);
    }
  }, [open, selectedAlert]);

  const handleSelect = (alertId: string) => {
    const alert = alerts?.find(alert => alert.id === alertId);
    setSelectedAlert(alert || null);
    if (alert) {
      setOpen(true);
    }
  };

  const handleResolve = async () => {
    if (!selectedAlert) return;

    setIsResolving(true);
    try {
      await AlertService.resolveAlert(selectedAlert.id.toString());
      toast({
        title: "Alert Resolved",
        description: "The security alert has been marked as resolved.",
      });
      setOpen(false);
    } catch (error: any) {
      toast({
        title: "Error Resolving Alert",
        description: error.message || "Failed to resolve the alert.",
        variant: "destructive",
      });
    } finally {
      setIsResolving(false);
    }
  };

  const getSeverityColor = (severity: SecurityAlert['severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getSeverityIcon = (severity: SecurityAlert['severity']) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4 mr-2" />;
      case 'high': return <AlertCircle className="h-4 w-4 mr-2" />;
      case 'medium': return <Info className="h-4 w-4 mr-2" />;
      case 'low': return <CheckCircle className="h-4 w-4 mr-2" />;
      default: return <Info className="h-4 w-4 mr-2" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Events</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : alerts && alerts.length > 0 ? (
          <ScrollArea className="rounded-md border">
            <Table>
              <TableCaption>Recent security events in your account.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Severity</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        {getSeverityIcon(alert.severity)}
                        <span className={getSeverityColor(alert.severity)}>{alert.severity}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="link" onClick={() => handleSelect(String(alert.id))}>
                        {alert.message}
                      </Button>
                    </TableCell>
                    <TableCell>{formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        ) : (
          <div className="text-center py-4">No security events found.</div>
        )}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Security Event Details</DialogTitle>
              <DialogDescription>
                Details about the selected security event.
              </DialogDescription>
            </DialogHeader>
            {selectedAlert ? (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="text-right font-medium">ID:</div>
                  <div className="col-span-3">{selectedAlert.id}</div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="text-right font-medium">Type:</div>
                  <div className="col-span-3">{selectedAlert.type}</div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="text-right font-medium">Severity:</div>
                  <div className="col-span-3">
                    <Badge className={getSeverityColor(selectedAlert.severity)}>
                      {selectedAlert.severity}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="text-right font-medium">Message:</div>
                  <div className="col-span-3">{selectedAlert.message}</div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="text-right font-medium">Timestamp:</div>
                  <div className="col-span-3">{new Date(selectedAlert.timestamp).toLocaleString()}</div>
                </div>
                {selectedAlert.description && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <div className="text-right font-medium">Description:</div>
                    <div className="col-span-3">{selectedAlert.description}</div>
                  </div>
                )}
                {selectedAlert.metadata && Object.keys(selectedAlert.metadata).length > 0 && (
                  <>
                    <Separator />
                    <div className="text-center font-medium">Metadata</div>
                    {Object.entries(selectedAlert.metadata).map(([key, value]) => (
                      <div key={key} className="grid grid-cols-4 items-center gap-4">
                        <div className="text-right font-medium">{key}:</div>
                        <div className="col-span-3">{JSON.stringify(value)}</div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            ) : (
              <div>Loading...</div>
            )}
            <div className="flex justify-end">
              <Button type="submit" onClick={handleResolve} disabled={isResolving}>
                {isResolving ? (
                  <>
                    Resolving <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  </>
                ) : (
                  "Resolve"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default SecurityEventsVisualization;
