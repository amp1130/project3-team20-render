"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Navigation } from "@/components/ui/navigation";
import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { useManager } from "@/context/manager-context";
import { AreaChart, PieChart } from "@/components/ui/charts";
import { Loader2, AlertCircle, Download, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import InventoryUsageChart from '@/components/ui/inventory-usage-chart';
import XReport from '@/components/x-report';
import ZReport from '@/components/ui/z-report';

interface Order {
  order_id: number;
  employee_id: number;
  order_date: string;
  total: number | string;
  tips: number | string;
}

interface OrderItem {
  item_name: string;
  quantity: number;
  price: number;
}

type TimeWindow = "daily" | "weekly" | "monthly" | "yearly" | "total";

// Helper function to format numbers with commas
function formatNumber(num: number): string {
  return num.toLocaleString('en-US', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export default function ReportsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeWindow, setTimeWindow] = useState<TimeWindow>("total");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [showItemizedSales, setShowItemizedSales] = useState(false);
  const router = useRouter();
  const { isManagerMode, isInitialized } = useManager();

  // Fetch orders data
  useEffect(() => {
    if (!isInitialized) return;
    
    if (!isManagerMode) {
      router.push("/");
      return;
    }

    async function fetchOrders() {
      try {
        const response = await fetch("/api/orders");
        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }
        const data = await response.json();
        
        // Convert string totals and tips to numbers
        const processedData = data.map((order: Order) => ({
          ...order,
          total: typeof order.total === 'string' ? parseFloat(order.total) : order.total,
          tips: typeof order.tips === 'string' ? parseFloat(order.tips) : order.tips || 0,
        }));
        
        setOrders(processedData);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [isManagerMode, isInitialized, router]);

  // Fetch order items for a specific date
  const fetchOrderItemsByDate = async (date: string) => {
    try {
      setLoading(true);
      
      // API call with date
      const response = await fetch(`/api/sales-by-item?date=${date}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch order items");
      }
      
      const data = await response.json();
      setOrderItems(data);
      setShowItemizedSales(true);
    } catch (error) {
      console.error("Error fetching order items:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle date selection from dialog
  const handleDateSelect = () => {
    setDatePickerOpen(false);
    fetchOrderItemsByDate(selectedDate);
  };
    
  // Filter orders based on time window
  const filteredOrders = useMemo(() => {
    if (!orders.length) return [];
    
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday as start of week
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    
    return orders.filter(order => {
      const orderDate = new Date(order.order_date);
      
      switch (timeWindow) {
        case "daily":
          return orderDate >= startOfDay;
        case "weekly":
          return orderDate >= startOfWeek;
        case "monthly":
          return orderDate >= startOfMonth;
        case "yearly":
          return orderDate >= startOfYear;
        case "total":
        default:
          return true;
      }
    });
  }, [orders, timeWindow]);

  // Calculate total sales
  const totalSales = useMemo(() => {
    return filteredOrders.reduce((sum, order) => {
      const orderTotal = typeof order.total === 'number' 
        ? order.total 
        : parseFloat(order.total as string);
      return sum + orderTotal;
    }, 0);
  }, [filteredOrders]);

  // Calculate total tips
  const totalTips = useMemo(() => {
    return filteredOrders.reduce((sum, order) => {
      if (!order.tips) return sum;
      const orderTips = typeof order.tips === 'number' 
        ? order.tips 
        : parseFloat(order.tips as string);
      return sum + orderTips;
    }, 0);
  }, [filteredOrders]);

  // Calculate average order value
  const averageOrderValue = useMemo(() => {
    if (filteredOrders.length === 0) return 0;
    return totalSales / filteredOrders.length;
  }, [filteredOrders, totalSales]);

  // Prepare data for charts
  const dailySalesData = useMemo(() => {
    if (!filteredOrders.length) return [];
    
    // Group orders by date
    const salesByDate = filteredOrders.reduce((acc, order) => {
      const date = new Date(order.order_date).toISOString().split('T')[0];
      const orderTotal = typeof order.total === 'number' 
        ? order.total 
        : parseFloat(order.total as string);
      
      if (!acc[date]) {
        acc[date] = { date, sales: 0 };
      }
      
      acc[date].sales += orderTotal;
      return acc;
    }, {} as Record<string, { date: string; sales: number }>);
    
    // Convert to array and sort by date
    return Object.values(salesByDate).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [filteredOrders]);


  // Prepare tips distribution data
  const tipsDistributionData = useMemo(() => {
    if (!filteredOrders.length) return [];
    
    return [
      { name: "Sales", value: totalSales - totalTips },
      { name: "Tips", value: totalTips }
    ];
  }, [filteredOrders, totalSales, totalTips]);

  // Helper function to get time window name for display
  const getTimeWindowName = () => {
    switch (timeWindow) {
      case "daily": return "today";
      case "weekly": return "this week";
      case "monthly": return "this month";
      case "yearly": return "this year";
      case "total": return "all time";
      default: return "";
    }
  };

  // Check if there's data to display
  const hasData = filteredOrders.length > 0;

  // Render empty state for charts
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full">
      <AlertCircle className="h-12 w-12 text-[#8c7b6b] mb-2" />
      <p className="text-[#8c7b6b] text-center">No data available for the selected time period</p>
    </div>
  );

  // Function to handle download report
  const handleDownloadReport = async () => {
    // Create a new PDF document
    const doc = new jsPDF({
      compress: true,
    });
    
    // Add title and date - define the date variable here
    const title = `Sales Report - ${getTimeWindowName()}`;
    const date = new Date().toLocaleDateString();
    
    // Add company logo - keep as PNG for transparency
    try {
      const logoImg = new Image();
      logoImg.src = '/logo.png';
      
      await new Promise((resolve, reject) => {
        logoImg.onload = resolve;
        logoImg.onerror = reject;
      });
      
      // Calculate dimensions to keep aspect ratio
      const logoWidth = 40;
      const logoHeight = (logoImg.height * logoWidth) / logoImg.width;
      
      // Position logo at top center
      const pageWidth = doc.internal.pageSize.getWidth();
      const xPosition = (pageWidth - logoWidth) / 2;
      
      // Add as PNG to preserve transparency
      doc.addImage({
        imageData: logoImg,
        format: 'PNG', // Explicitly use PNG format
        x: xPosition,
        y: 10,
        width: logoWidth,
        height: logoHeight,
        compression: 'MEDIUM'
      });
      
      // Continue with existing text placement...
      doc.setFontSize(20);
      doc.text(title, 14, logoHeight + 25);
      doc.setFontSize(10);
      doc.text(`Generated on: ${date}`, 14, logoHeight + 33);
      
      // Add KPI summary
      doc.setFontSize(16);
      doc.text("Key Performance Indicators", 14, logoHeight + 48);
      
      // Adjust starting position for the first table
      autoTable(doc, {
        startY: logoHeight + 53,
        head: [["Metric", "Value"]],
        body: [
          ["Total Sales", `$${formatNumber(totalSales)}`],
          ["Total Tips", `$${formatNumber(totalTips)}`],
          ["Average Order Value", `$${formatNumber(averageOrderValue)}`],
          ["Number of Orders", filteredOrders.length.toString()],
          ["Tips Percentage", `${totalSales > 0 ? ((totalTips / totalSales) * 100).toFixed(1) : 0}%`]
        ],
        theme: 'grid',
        headStyles: { fillColor: [166, 124, 82] }
      });
    } catch (error) {
      console.error("Error loading logo:", error);
      
      // Fallback without logo if logo loading fails
      doc.setFontSize(20);
      doc.text(title, 14, 22);
      doc.setFontSize(10);
      doc.text(`Generated on: ${date}`, 14, 30);
      
      // Add KPI summary
      doc.setFontSize(16);
      doc.text("Key Performance Indicators", 14, 45);
      
      // Create KPI table with default positioning
      autoTable(doc, {
        startY: 50,
        head: [["Metric", "Value"]],
        body: [
          ["Total Sales", `$${formatNumber(totalSales)}`],
          ["Total Tips", `$${formatNumber(totalTips)}`],
          ["Average Order Value", `$${formatNumber(averageOrderValue)}`],
          ["Number of Orders", filteredOrders.length.toString()],
          ["Tips Percentage", `${totalSales > 0 ? ((totalTips / totalSales) * 100).toFixed(1) : 0}%`]
        ],
        theme: 'grid',
        headStyles: { fillColor: [166, 124, 82] }
      });
    }
    
    // Fix for the finalY error - safe access
    let finalY = 0;
    try {
      finalY = (doc as any).lastAutoTable?.finalY || 50;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error accessing lastAutoTable.finalY:", error.message);
      } else {
        console.error("An unknown error occurred", error);
      }
      finalY = 50; // Fallback position
    }
    
    // Add daily sales data
    doc.setFontSize(16);
    doc.text("Daily Sales Data", 14, finalY + 15);
    
    // Create sales data table
    const salesTableData = dailySalesData.map(item => [
      new Date(item.date).toLocaleDateString(),
      `$${formatNumber(item.sales)}`
    ]);
    
    autoTable(doc, {
      startY: finalY + 20,
      head: [["Date", "Sales"]],
      body: salesTableData,
      theme: 'grid',
      headStyles: { fillColor: [166, 124, 82] },
    });
    
    // Handle finalY for chart captures with safe access
    try {
      finalY = (doc as any).lastAutoTable?.finalY || (finalY + 30);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error accessing lastAutoTable.finalY for charts:", error.message);
      } else {
        console.error("An unknown error occurred", error);
      }
      finalY += 30; // Just move down a bit from the previous position
    }
    
    // Get the chart elements
    try {
      const chartElements = document.querySelectorAll('.recharts-wrapper');
      
      // Add a new page if we're too far down
      if (finalY > 230) {
        doc.addPage();
        finalY = 20;
      }
      
      // Add charts title
      doc.setFontSize(16);
      doc.text("Charts", 14, finalY + 15);
      finalY += 25;
      
      // Convert each chart to an image and add to PDF
      for (let i = 0; i < Math.min(chartElements.length, 2); i++) {
        // Create a white background wrapper for the chart
        const chartWrapper = document.createElement('div');
        chartWrapper.style.backgroundColor = 'white';
        chartWrapper.style.padding = '10px';
        chartWrapper.style.borderRadius = '8px';
        
        // Clone the chart element
        const chartClone = (chartElements[i] as HTMLElement).cloneNode(true) as HTMLElement;
        chartWrapper.appendChild(chartClone);
        document.body.appendChild(chartWrapper);
        
        // Configure html2canvas with explicit white background
        const canvas = await html2canvas(chartWrapper, {
          scale: 1.5,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff' // Explicitly white background
        });
        
        // Clean up the temporary wrapper element
        document.body.removeChild(chartWrapper);
        
        // Use PNG format for better quality with transparency
        const imgData = canvas.toDataURL('image/png', 1.0);
        
        // Add a new page for each chart
        if (i > 0) {
          doc.addPage();
          finalY = 20;
        }
        
        // Calculate dimensions to fit the page
        const imgWidth = 180;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        
        // Add image with white background
        doc.setFillColor(255, 255, 255);
        doc.rect(14, finalY, imgWidth + 2, imgHeight + 2, 'F');
        
        // Add image with compression options
        doc.addImage({
          imageData: imgData,
          x: 15,
          y: finalY,
          width: imgWidth,
          height: imgHeight,
          format: 'PNG',
          compression: 'MEDIUM'
        });
        
        finalY += imgHeight + 10;
      }
    } catch (error) {
      console.error("Error capturing charts:", error);
    }

    
    // Save the PDF with a properly formatted filename
    doc.save(`sales-report-${timeWindow}-${date.replace(/\//g, '-')}.pdf`);
  };
  
  // Render daily sales by item
  const renderDailySalesByItem = () => (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div>
        <CardTitle>
          Daily Sales by Item - {new Date(selectedDate + "T00:00:00").toLocaleDateString()}
        </CardTitle>

          <CardDescription>Itemized sales for the selected date</CardDescription>
        </div>
        <Button 
          onClick={() => setShowItemizedSales(false)} 
          variant="outline" 
          className="bg-[#e6ded5] text-[#3c2f1f] hover:bg-[#d4c8bc]"
        >
          Back to Charts
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto max-h-[400px]">
          <table className="w-full">
            <thead className="sticky top-0 bg-[#b79c85] text-white">
              <tr>
                <th className="text-left p-3 rounded-tl-md">Menu Item</th>
                <th className="text-center p-3">Quantity</th>
                <th className="text-right p-3 rounded-tr-md">Sales</th>
              </tr>
            </thead>
            <tbody>
              {orderItems.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-[#f5f5f5]"}>
                  <td className="text-left p-3 font-medium">{item.item_name}</td>
                  <td className="text-center p-3">{item.quantity}</td>
                  <td className="text-right p-3">${formatNumber(item.quantity * item.price)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-[#e6ded5] font-bold">
              <tr>
                <td className="text-left p-3">Total</td>
                <td className="text-center p-3">{orderItems.reduce((sum, item) => sum + item.quantity, 0)}</td>
                <td className="text-right p-3">
                  ${formatNumber(orderItems.reduce((sum, item) => sum + (item.quantity * item.price), 0))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  );
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f5f2] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-[#a67c52] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f5f2]">
      <Navigation />
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-[#3c2f1f]">Sales Reports</h1>
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleDownloadReport}
              className="flex items-center gap-2 bg-[#e6ded5] text-[#3c2f1f] hover:bg-[#d4c8bc]"
            >
              <Download className="h-4 w-4" />
              <span>Download Report</span>
            </Button>
            <Select value={timeWindow} onValueChange={(value) => setTimeWindow(value as TimeWindow)} className="w-40">
              <SelectTrigger>
                {timeWindow ? timeWindow : "Select Period"}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Today</SelectItem>
                <SelectItem value="weekly">This Week</SelectItem>
                <SelectItem value="monthly">This Month</SelectItem>
                <SelectItem value="yearly">This Year</SelectItem>
                <SelectItem value="total">All Time</SelectItem>
              </SelectContent>
            </Select>

          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Total Sales Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Total Sales</CardTitle>
              <CardDescription>
                Revenue {getTimeWindowName()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#3c2f1f]">
                <span>${formatNumber(totalSales)}</span>
              </div>
              <p className="text-xs text-[#8c7b6b] mt-1">
                From {filteredOrders.length} orders
              </p>
            </CardContent>
          </Card>

          {/* Total Tips Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Total Tips</CardTitle>
              <CardDescription>
                Tips received {getTimeWindowName()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#3c2f1f]">
                <span>${formatNumber(totalTips)}</span>
              </div>
              <p className="text-xs text-[#8c7b6b] mt-1">
                {totalSales > 0 ? ((totalTips / totalSales) * 100).toFixed(1) : 0}% of total sales
              </p>
            </CardContent>
          </Card>

          {/* Average Order Value Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Average Order</CardTitle>
              <CardDescription>
                Average order value {getTimeWindowName()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#3c2f1f]">
                <span>${formatNumber(averageOrderValue)}</span>
              </div>
              <p className="text-xs text-[#8c7b6b] mt-1">
                Per transaction average
              </p>
            </CardContent>
          </Card>
        </div>

        {showItemizedSales ? (
          renderDailySalesByItem()
        ) : (
          <Tabs defaultValue="daily-sales" className="mt-8">
            <TabsList className="mb-4">
              <TabsTrigger value="daily-sales">Daily Sales</TabsTrigger>
              <TabsTrigger value="Xreport">X Report</TabsTrigger>
              <TabsTrigger value="Zreport">Z Report</TabsTrigger>
              <TabsTrigger value="tips">Tips Distribution</TabsTrigger>
              <TabsTrigger value="inventory">Inventory Usage</TabsTrigger>
            </TabsList>
            <TabsContent value="daily-sales">
              <Card>
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2">
                  <div>
                    <CardTitle>Daily Sales</CardTitle>
                    <CardDescription>
                      Sales performance by day
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => setDatePickerOpen(true)}
                    className="mt-2 sm:mt-0 flex items-center gap-2 bg-[#e6ded5] text-[#3c2f1f] hover:bg-[#d4c8bc]"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>View Sales by Item</span>
                  </Button>
                </CardHeader>
                <CardContent className="h-[400px] pt-6">
                  {!hasData ? (
                    renderEmptyState()
                  ) : (
                    <AreaChart 
                      data={dailySalesData}
                      categories={["sales"]}
                      index="date"
                      valueFormatter={(value) => `$${formatNumber(value)}`}
                      yAxisWidth={65}
                      colors={["#a67c52"]}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="Xreport">
              <XReport/>
            </TabsContent>
            <TabsContent value="Zreport">
              <ZReport/>
            </TabsContent>
            
            <TabsContent value="tips" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Tips Distribution</CardTitle>
                    <CardDescription>
                      Proportion of tips to total sales
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="h-[400px] pt-6">
                  {!hasData ? (
                    renderEmptyState()
                  ) : (
                    <PieChart 
                      data={tipsDistributionData}
                      category="value"
                      index="name"
                      valueFormatter={(value) => `$${formatNumber(value)}`}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* New Inventory Usage Tab */}
            <TabsContent value="inventory">
              <InventoryUsageChart />
            </TabsContent>
          </Tabs>
        )}

        {/* Date Picker Dialog */}
        <Dialog open={datePickerOpen} onOpenChange={setDatePickerOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Select a Date for Itemized Sales</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleDateSelect} className="bg-[#a67c52] hover:bg-[#8c6b45]">
                View Sales Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}