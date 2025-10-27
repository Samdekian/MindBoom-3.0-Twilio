
import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Clock, FileText, Trash, Webhook } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from 'date-fns';

interface WebhookEvent {
  id: string;
  event_type: string;
  created_at: string;
  payload: any;
}

export const WebhookEventLog = () => {
  const { toast } = useToast();
  const [selectedEvent, setSelectedEvent] = useState<WebhookEvent | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  
  const { data: webhookEvents, isLoading, error, refetch } = useQuery({
    queryKey: ['webhook-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calendly_webhooks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as WebhookEvent[];
    },
  });

  const handleDeleteEvent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('calendly_webhooks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Webhook event deleted successfully",
      });
      
      refetch();
    } catch (err) {
      console.error('Error deleting webhook event:', err);
      toast({
        title: "Error",
        description: "Failed to delete webhook event",
        variant: "destructive",
      });
    }
  };

  const handleClearAllEvents = async () => {
    try {
      const { error } = await supabase
        .from('calendly_webhooks')
        .delete()
        .neq('id', '0'); // Delete all records
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "All webhook events cleared successfully",
      });
      
      refetch();
    } catch (err) {
      console.error('Error clearing webhook events:', err);
      toast({
        title: "Error",
        description: "Failed to clear webhook events",
        variant: "destructive",
      });
    }
  };

  const getEventBadgeColor = (eventType: string) => {
    if (eventType.includes('created')) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    if (eventType.includes('canceled')) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    if (eventType.includes('no_show')) return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300";
    return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
  };

  const formatEventType = (eventType: string) => {
    return eventType.split('.').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const viewEventDetails = (event: WebhookEvent) => {
    setSelectedEvent(event);
    setViewOpen(true);
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Webhook className="h-5 w-5" />
              Webhook Event Log
            </CardTitle>
            <CardDescription>
              View and manage your Calendly webhook events
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="text-red-500 border-red-200 hover:text-red-700 hover:border-red-300"
            onClick={handleClearAllEvents}
          >
            <Trash className="h-4 w-4 mr-2" />
            Clear All Events
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            Error loading webhook events. Please try again.
          </div>
        ) : webhookEvents && webhookEvents.length > 0 ? (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Type</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {webhookEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <Badge className={getEventBadgeColor(event.event_type)}>
                        {formatEventType(event.event_type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        {format(new Date(event.created_at), 'MMM d, yyyy')}
                        <Clock className="h-3.5 w-3.5 ml-2 mr-1" />
                        {format(new Date(event.created_at), 'h:mm a')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => viewEventDetails(event)}>
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No webhook events found. Events will appear here when received from Calendly.
          </div>
        )}

        <Dialog open={viewOpen} onOpenChange={setViewOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Webhook Event Details</DialogTitle>
              <DialogDescription>
                {selectedEvent && (
                  <div className="flex items-center mt-1">
                    <Badge className={selectedEvent ? getEventBadgeColor(selectedEvent.event_type) : ""}>
                      {selectedEvent ? formatEventType(selectedEvent.event_type) : ""}
                    </Badge>
                    <span className="ml-2 text-sm text-gray-500">
                      {selectedEvent ? format(new Date(selectedEvent.created_at), 'MMM d, yyyy h:mm a') : ""}
                    </span>
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
            {selectedEvent && (
              <ScrollArea className="mt-4 h-[300px] overflow-auto rounded-md border p-4">
                <pre className="text-xs font-mono">
                  {JSON.stringify(selectedEvent.payload, null, 2)}
                </pre>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
