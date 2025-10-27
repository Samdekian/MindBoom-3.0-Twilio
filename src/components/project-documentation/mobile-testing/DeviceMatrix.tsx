
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, Circle } from "lucide-react";

const DeviceMatrix = () => {
  const testDevices = [
    { 
      device: "iPhone 14", 
      browser: "Safari", 
      os: "iOS 16", 
      resolution: "1170 × 2532",
      tested: true,
      passing: true
    },
    { 
      device: "Samsung Galaxy S22", 
      browser: "Chrome", 
      os: "Android 12", 
      resolution: "1080 × 2340",
      tested: true,
      passing: true
    },
    { 
      device: "iPad Pro", 
      browser: "Safari", 
      os: "iOS 16", 
      resolution: "1668 × 2388",
      tested: true,
      passing: true
    },
    { 
      device: "Google Pixel 6", 
      browser: "Chrome", 
      os: "Android 13", 
      resolution: "1080 × 2400",
      tested: true,
      passing: false
    },
    { 
      device: "iPhone SE", 
      browser: "Safari", 
      os: "iOS 15", 
      resolution: "750 × 1334",
      tested: false,
      passing: null
    },
  ];

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium mb-3">Device Testing Matrix</h3>
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device</TableHead>
                <TableHead>Browser</TableHead>
                <TableHead>OS</TableHead>
                <TableHead>Resolution</TableHead>
                <TableHead>Tested</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testDevices.map((device, i) => (
                <TableRow key={i}>
                  <TableCell>{device.device}</TableCell>
                  <TableCell>{device.browser}</TableCell>
                  <TableCell>{device.os}</TableCell>
                  <TableCell className="text-xs">{device.resolution}</TableCell>
                  <TableCell>
                    {device.tested ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell>
                    {device.passing === null ? (
                      <span className="text-muted-foreground text-sm">Pending</span>
                    ) : device.passing ? (
                      <span className="text-green-500 text-sm font-medium">Pass</span>
                    ) : (
                      <span className="text-red-500 text-sm font-medium">Issues Found</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeviceMatrix;
