import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { BarChart } from '@/components/ui/charts';

// Define interfaces for our data structures
interface InventoryItem {
  ingredient: string;
  usage: number;
}

// Format numbers with commas
function formatNumber(num: number): string {
  return num.toLocaleString('en-US', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

const InventoryUsageChart = () => {
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasData, setHasData] = useState(false);
  
  // Fetch inventory usage data for a specific date
  const fetchInventoryUsage = async (date: string) => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/inventory-usage?date=${date}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch inventory usage data");
      }
      
      const data = await response.json();
      
      // Transform data for BarChart component
      const chartData = data.map((item: InventoryItem) => ({
        ingredient: item.ingredient,
        usage: item.usage
      }));
      
      setInventoryData(chartData);
      setHasData(chartData.length > 0);
    } catch (error) {
      console.error("Error fetching inventory usage:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle date selection from dialog
  const handleDateSelect = () => {
    setDatePickerOpen(false);
    fetchInventoryUsage(selectedDate);
  };

  // Render empty state for charts
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full">
      <AlertCircle className="h-12 w-12 text-[#8c7b6b] mb-2" />
      <p className="text-[#8c7b6b] text-center">No data available for the selected date</p>
    </div>
  );

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2">
          <div>
            <CardTitle>Inventory Usage</CardTitle>
            <CardDescription>
              Ingredient usage by quantity
            </CardDescription>
          </div>
          <Button
            onClick={() => setDatePickerOpen(true)}
            className="mt-2 sm:mt-0 flex items-center gap-2 bg-[#e6ded5] text-[#3c2f1f] hover:bg-[#d4c8bc]"
          >
            <Calendar className="h-4 w-4" />
            <span>Select Date</span>
          </Button>
        </CardHeader>
        <CardContent className="h-[400px] pt-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="h-8 w-8 text-[#a67c52] animate-spin border-4 border-[#a67c52] border-t-transparent rounded-full"></div>
            </div>
          ) : !hasData ? (
            renderEmptyState()
          ) : (
            <BarChart 
              data={inventoryData}
              categories={["usage"]}
              index="ingredient"
              valueFormatter={(value) => `${formatNumber(value)} units`}
              yAxisWidth={65}
              colors={["#b79c85"]}
            />
          )}
        </CardContent>
      </Card>

      {/* Date Picker Dialog */}
      <Dialog open={datePickerOpen} onOpenChange={setDatePickerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select a Date for Inventory Usage</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="inventory-date" className="text-right">
                Date
              </Label>
              <Input
                id="inventory-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleDateSelect} className="bg-[#a67c52] hover:bg-[#8c6b45]">
              View Inventory Usage
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InventoryUsageChart;