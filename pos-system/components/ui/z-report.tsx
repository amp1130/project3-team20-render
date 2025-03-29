"use client";

import React, { useState} from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from 'lucide-react';

interface ZReportData {
  totalOrders: number;
  totalSales: number;
  totalTips: number;
  mostPopularItem: {
    name: string;
    count: number;
  };
  employeeOrderTotals: Array<{
    employeeId: number;
    name: string;
    totalOrders: number;
  }>;
}

interface ErrorResponse {
  error: string;
  details?: string;
}

export function ZReport() {
  const [reportData, setReportData] = useState<ZReportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [reportDate, setReportDate] = useState<string | null>(null);

  const generateZReport = async () => {
    setIsLoading(true);
    setError(null);
    setErrorDetails(null);

    try {
      const response = await fetch('/api/z-report', {
        method: 'GET',
      });

      const data = await response.json();

      if (!response.ok) {
        const errorResponse = data as ErrorResponse;
        setError(errorResponse.error || 'Failed to generate Z Report');
        setErrorDetails(errorResponse.details || 'No additional details available');
        return;
      }

      setReportData(data);
      // Set the current date as the report date
      setReportDate(new Date().toLocaleDateString());
    } catch (err) {
      setError('Network or Parsing Error');
      setErrorDetails(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-center">Z Report {reportDate && `- ${reportDate}`}</h1>
      
      <Button 
        onClick={generateZReport} 
        disabled={isLoading}
        className="mb-4"
      >
        {isLoading ? 'Generating...' : 'Generate Z Report'}
      </Button>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{error}</AlertTitle>
          <AlertDescription>
            {errorDetails}
          </AlertDescription>
        </Alert>
      )}

      {reportData && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Daily Totals</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#e6ded5] text-[#b79c85]">
                    <TableHead className="font-bold text-center">Metric</TableHead>
                    <TableHead className="font-bold text-center">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="text-center">Total Orders</TableCell>
                    <TableCell className="text-center">{reportData.totalOrders}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-center">Total Sales</TableCell>
                    <TableCell className="text-center">${reportData.totalSales.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-center">Total Tips</TableCell>
                    <TableCell className="text-center">${reportData.totalTips.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-center">Most Popular Item</TableCell>
                    <TableCell className="text-center">
                      {reportData.mostPopularItem.name} 
                      ({reportData.mostPopularItem.count} orders)
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">Employee Order Totals</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#e6ded5] text-[#b79c85]">
                    <TableHead className="font-bold text-center">Employee</TableHead>
                    <TableHead className="font-bold text-center">Total Orders</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.employeeOrderTotals.map((employee) => (
                    <TableRow key={employee.employeeId}>
                      <TableCell className="text-center">{employee.employeeId} - {employee.name}</TableCell>
                      <TableCell className="text-center">{employee.totalOrders}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Alert variant="default">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              This Z-Report has reset the daily totals. All future transactions will be counted towards the next business day.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}

export default ZReport;