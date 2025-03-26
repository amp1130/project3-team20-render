import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface HourlyData {
  hour: string;
  value: number;
}

interface EmployeeOrderData {
  employee: string;
  hourlyOrders: { [hour: string]: number };
  total: number;
}

interface XReportData {
  date: string;
  zReportRun: boolean;
  ordersByHour: HourlyData[];
  salesByHour: HourlyData[];
  employeeOrders: EmployeeOrderData[];
  tipsData: HourlyData[];
  summary: {
    totalOrders: number;
    totalSales: number;
    totalTips: number;
  };
}

const XReport: React.FC = () => {
  const [reportData, setReportData] = useState<XReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchXReport = async () => {
      try {
        const response = await fetch("/api/XReport");
        if (!response.ok) {
          throw new Error("Failed to fetch X Report");
        }
        const data = await response.json();
        setReportData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchXReport();
  }, []);

  // Function to generate zero data when Z-Report is run
  const generateZeroData = (originalData: XReportData): XReportData => {
    if (!originalData.zReportRun) return originalData;

    return {
      ...originalData,
      ordersByHour: originalData.ordersByHour.map(item => ({ ...item, value: 0 })),
      salesByHour: originalData.salesByHour.map(item => ({ ...item, value: 0 })),
      employeeOrders: originalData.employeeOrders.map(employee => ({
        ...employee,
        hourlyOrders: Object.fromEntries(
          Object.keys(employee.hourlyOrders).map(hour => [hour, 0])
        ),
        total: 0
      })),
      tipsData: originalData.tipsData.map(item => ({ ...item, value: 0 })),
      summary: {
        totalOrders: 0,
        totalSales: 0,
        totalTips: 0
      }
    };
  };

  if (loading) return <div>Loading X Report...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!reportData) return <div>No report data available</div>;

  // Apply zero data transformation if Z-Report is run
  const processedReportData = generateZeroData(reportData);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {processedReportData.zReportRun
            ? `X Report (After Z-Report) - ${processedReportData.date}`
            : `X Report - ${processedReportData.date}`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {processedReportData.zReportRun && (
          <div className="bg-blue-100 border border-blue-300 p-4 mb-4 rounded">
            <p className="text-blue-800 font-bold">
              NOTICE: Z-Report has already been run for today.
              This report shows zero values as all transactions have been reset.
            </p>
          </div>
        )}

        {/* Orders Per Hour Chart */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">Number of Orders Per Hour</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={processedReportData.ordersByHour}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis width={48} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#b79c85" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sales Per Hour Chart */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">Sales Amount Per Hour ($)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={processedReportData.salesByHour}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis width={48} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#b79c85" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Employee Orders Table */}
        {processedReportData.employeeOrders.length > 0 ? (
        <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">Orders Processed by Employee Per Hour</h2>
            <Table>
            <TableHeader>
                <TableRow className="bg-[#e6ded5] text-[#b79c85]">
                <TableHead className="font-bold">Employee</TableHead>
                {Object.keys(processedReportData.employeeOrders[0].hourlyOrders)
                    .filter((hour) => {
                    const hourNum = parseInt(hour, 10);
                    return hourNum >= 10 && hourNum <= 22;
                    })
                    .map((hour) => (
                    <TableHead key={hour} className="font-bold">{hour}</TableHead>
                    ))}
                <TableHead className="font-bold">Total</TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
                {processedReportData.employeeOrders.map((employee, index) => (
                <TableRow key={index}>
                    <TableCell>{employee.employee}</TableCell>
                    {Object.entries(employee.hourlyOrders)
                    .filter(([hour]) => {
                        const hourNum = parseInt(hour, 10);
                        return hourNum >= 10 && hourNum <= 22;
                    })
                    .map(([hour, orders]) => (
                        <TableCell key={hour}>{orders}</TableCell>
                    ))}
                    <TableCell>{employee.total}</TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </div>
        ) : (
        <p>No employee order data available.</p>
        )}

        {/* Tips Per Hour Table */}
        {processedReportData.tipsData.length > 0 ? (
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">Tips Received Per Hour</h2>
            <Table>
              <TableHeader>
                <TableRow className="bg-[#e6ded5] text-[#b79c85]">
                  <TableHead className="text-center">Hour</TableHead>
                  <TableHead className="text-center">Tips Amount ($)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedReportData.tipsData.map((tip, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-center">{tip.hour}</TableCell>
                    <TableCell className="text-center">${tip.value.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p>No tips data available.</p>
        )}

        {/* Daily Summary */}
        <div className="border p-4 rounded">
          <h2 className="text-xl font-bold mb-4">Daily Summary</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>Total Orders:</div>
            <div>{processedReportData.summary.totalOrders}</div>
            <div>Total Sales:</div>
            <div>${processedReportData.summary.totalSales?.toFixed(2) || "0.00"}</div>
            <div>Total Tips:</div>
            <div>${processedReportData.summary.totalTips?.toFixed(2) || "0.00"}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default XReport;