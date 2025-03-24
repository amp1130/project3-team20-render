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

  if (loading) return <div>Loading X Report...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!reportData) return <div>No report data available</div>;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {reportData.zReportRun
            ? `X Report (After Z-Report) - ${reportData.date}`
            : `X Report - ${reportData.date}`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {reportData.zReportRun && (
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
            <BarChart data={reportData.ordersByHour}>
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
            <BarChart data={reportData.salesByHour}>
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
        {reportData.employeeOrders.length > 0 ? (
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">Orders Processed by Employee Per Hour</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  {Object.keys(reportData.employeeOrders[0].hourlyOrders).map((hour) => (
                    <TableHead key={hour}>{hour}</TableHead>
                  ))}
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.employeeOrders.map((employee, index) => (
                  <TableRow key={index}>
                    <TableCell>{employee.employee}</TableCell>
                    {Object.entries(employee.hourlyOrders).map(([hour, orders]) => (
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
        {reportData.tipsData.length > 0 ? (
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">Tips Received Per Hour</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hour</TableHead>
                  <TableHead>Tips Amount ($)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.tipsData.map((tip, index) => (
                  <TableRow key={index}>
                    <TableCell>{tip.hour}</TableCell>
                    <TableCell>${tip.value.toFixed(2)}</TableCell>
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
            <div>{reportData.summary.totalOrders}</div>
            <div>Total Sales:</div>
            <div>${reportData.summary.totalSales?.toFixed(2) || "0.00"}</div>
            <div>Total Tips:</div>
            <div>${reportData.summary.totalTips?.toFixed(2) || "0.00"}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default XReport;
