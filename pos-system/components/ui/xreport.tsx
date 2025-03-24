'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Download, AlertCircle } from 'lucide-react';
import { BarChart } from '@/components/ui/charts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function formatNumber(num: number): string {
  return num.toLocaleString('en-US', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

interface XReportProps {
  date: string;
}

interface XReportData {
  date: string;
  zReportRun: boolean;
  ordersByHour: Record<string, number>;
  salesByHour: Record<string, number>;
  employeeData: Record<string, Record<string, number>>;
  tipsByHour: Record<string, number>;
  summary: {
    totalOrders: number;
    totalSales: number;
    totalTips: number;
  };
  noData?: boolean; // Added this property for when no data is available
  error?: string; // Add error property
}

export function XReport({ date }: XReportProps) {
  const [data, setData] = useState<XReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchXReportData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Log the date to make sure it's correct
        console.log("Fetching X Report for date:", date);
        
        const response = await fetch(`/api/xreport-data?date=${date}`);
        console.log("Response status:", response.status);
        
        if (!response.ok) {
          if (response.status === 404) {
            setData({ noData: true } as XReportData);
          } else {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
          }
        } else {
          const reportData = await response.json();
          console.log("Report data received:", reportData);
          setData(reportData);
        }
      } catch (error) {
        console.error('Error fetching X Report data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load X Report data');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchXReportData();
  }, [date]);

  // Format data for charts
  const formatOrdersChartData = () => {
    if (!data) return [];
    
    return Object.entries(data.ordersByHour).map(([hour, count]) => ({
      hour: `${hour}:00`,
      orders: count
    }));
  };

  const formatSalesChartData = () => {
    if (!data) return [];
    
    return Object.entries(data.salesByHour).map(([hour, amount]) => ({
      hour: `${hour}:00`,
      sales: amount
    }));
  };

  const downloadPDF = () => {
    if (!data) return;
    
    const pdf = new jsPDF();
    const reportTitle = data.zReportRun ? `X Report (After Z-Report) - ${data.date}` : `X Report - ${data.date}`;
    
    // Add title
    pdf.setFontSize(18);
    pdf.text(reportTitle, 14, 20);
    
    // Add Z-Report notice if applicable
    if (data.zReportRun) {
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 255);
      pdf.text('NOTICE: Z-Report has already been run for today. This report shows zero values as all transactions have been reset.', 14, 30);
      pdf.setTextColor(0, 0, 0);
    }
    
    // Summary section
    pdf.setFontSize(14);
    pdf.text('Daily Summary', 14, 45);
    
    autoTable(pdf, {
      startY: 50,
      head: [['Metric', 'Value']],
      body: [
        ['Total Orders', data.summary.totalOrders.toString()],
        ['Total Sales', `$${formatNumber(data.summary.totalSales)}`],
        ['Total Tips', `$${formatNumber(data.summary.totalTips)}`]
      ],
    });
    
    // Employee orders table
    let yPos = pdf.lastAutoTable?.finalY || 100;
    
    pdf.setFontSize(14);
    pdf.text('Orders Processed by Employee Per Hour', 14, yPos + 10);
    
    // Prepare employee table data
    const employeeHeaders = ['Employee', ...Array.from({ length: 13 }, (_, i) => `${i + 10}:00`), 'Total'];
    
    const employeeRows = Object.entries(data.employeeData).map(([employee, hours]) => {
      const hourValues = Array.from({ length: 13 }, (_, i) => hours[i + 10] || 0);
      const total = hourValues.reduce((sum, val) => sum + val, 0);
      return [employee, ...hourValues.map(v => v.toString()), total.toString()];
    });
    
    autoTable(pdf, {
      startY: yPos + 15,
      head: [employeeHeaders],
      body: employeeRows,
    });
    
    // Tips table
    yPos = pdf.lastAutoTable?.finalY || 150;
    
    pdf.setFontSize(14);
    pdf.text('Tips Received Per Hour', 14, yPos + 10);
    
    const tipsData = Object.entries(data.tipsByHour).map(([hour, amount]) => [
      `${hour}:00`,
      `$${formatNumber(amount)}`
    ]);
    
    autoTable(pdf, {
      startY: yPos + 15,
      head: [['Hour', 'Tips Amount ($)']],
      body: tipsData,
    });
    
    pdf.save(`x-report-${data.date}.pdf`);
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>X Report - Loading...</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#a67c52]"></div>
            <p>Loading report data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Check for no data state
  if (data?.noData) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>X Report - {date}</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-64">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-gray-500 text-lg">No data available for {date}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>X Report</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error || 'Failed to load X Report data'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>
            {data.zReportRun ? `X Report (After Z-Report) - ${date}` : `X Report - ${date}`}
          </CardTitle>
          <CardDescription>Daily business activity report</CardDescription>
        </div>
        <Button 
          onClick={downloadPDF}
          className="flex items-center gap-2 bg-[#a67c52] hover:bg-[#8c6b45]"
        >
          <Download className="h-4 w-4" />
          <span>Download PDF</span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-8">
        {data.zReportRun && (
          <Alert className="border-blue-500">
            <AlertCircle className="h-4 w-4 text-blue-500" />
            <AlertTitle className="text-blue-500 font-bold">NOTICE</AlertTitle>
            <AlertDescription>
              Z-Report has already been run for today. This report shows zero values as all transactions have been reset.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data.summary.totalOrders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${formatNumber(data.summary.totalSales)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${formatNumber(data.summary.totalTips)}</div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Number of Orders Per Hour</h3>
          <div className="h-[300px]">
            <BarChart 
              data={formatOrdersChartData()}
              categories={["orders"]}
              index="hour"
              yAxisWidth={48}
              colors={["#b79c85"]}
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Sales Amount Per Hour ($)</h3>
          <div className="h-[300px]">
            <BarChart 
              data={formatSalesChartData()}
              categories={["sales"]}
              index="hour"
              valueFormatter={(value) => `$${formatNumber(value)}`}
              yAxisWidth={65}
              colors={["#b79c85"]}
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Orders Processed by Employee Per Hour</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#b79c85] text-white">
                  <TableHead>Employee</TableHead>
                  {Array.from({ length: 13 }, (_, i) => (
                    <TableHead key={i} className="text-center">{`${i + 10}:00`}</TableHead>
                  ))}
                  <TableHead className="text-center">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(data.employeeData).map(([employee, hours], index) => {
                  const hourValues = Array.from({ length: 13 }, (_, i) => hours[i + 10] || 0);
                  const total = hourValues.reduce((sum, val) => sum + val, 0);
                  
                  return (
                    <TableRow key={employee} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <TableCell>{employee}</TableCell>
                      {hourValues.map((count, i) => (
                        <TableCell key={i} className="text-center">{count}</TableCell>
                      ))}
                      <TableCell className="text-center font-semibold">{total}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Tips Received Per Hour</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#b79c85] text-white">
                  <TableHead>Hour</TableHead>
                  <TableHead>Tips Amount ($)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(data.tipsByHour).map(([hour, amount], index) => (
                  <TableRow key={hour} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <TableCell>{`${hour}:00`}</TableCell>
                    <TableCell>${formatNumber(amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}