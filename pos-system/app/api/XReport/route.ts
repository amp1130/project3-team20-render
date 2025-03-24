import { NextResponse } from 'next/server';
import { query } from '@/lib/db-utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    
    // Check if Z-Report has been run for today
    const zReportCheck = await query(
      "SELECT COUNT(*) AS count FROM zreports WHERE DATE(date) = ?",
      [date]
    );
    
    const zReportRun = zReportCheck.length > 0 && zReportCheck[0].count > 0;
    
    // Initialize data structures
    let ordersByHour = {};
    let salesByHour = {};
    let employeeData = {};
    let tipsByHour = {};
    
    // Initialize all business hours with 0 values
    for (let i = 10; i <= 22; i++) {
      ordersByHour[i] = 0;
      salesByHour[i] = 0.0;
      tipsByHour[i] = 0.0;
    }
    
    if (!zReportRun) {
      // Query to get order count per hour
      const orderCountData = await query(
        `SELECT EXTRACT(HOUR FROM order_date) AS hour, COUNT(order_id) AS order_count 
         FROM Orders 
         WHERE DATE(order_date) = ? 
         GROUP BY EXTRACT(HOUR FROM order_date) 
         ORDER BY hour`,
        [date]
      );
      
      // Fill orders by hour
      orderCountData.forEach(row => {
        const hour = parseInt(row.hour);
        ordersByHour[hour] = row.order_count;
      });
      
      // Query to get sales totals per hour
      const salesByHourData = await query(
        `SELECT EXTRACT(HOUR FROM order_date) AS hour, SUM(total) AS sales_amount 
         FROM Orders 
         WHERE DATE(order_date) = ? 
         GROUP BY EXTRACT(HOUR FROM order_date) 
         ORDER BY hour`,
        [date]
      );
      
      // Fill sales by hour
      salesByHourData.forEach(row => {
        const hour = parseInt(row.hour);
        salesByHour[hour] = parseFloat(row.sales_amount);
      });
      
      // Query to get order counts by employee and hour
      const employeeOrdersData = await query(
        `SELECT e.employee_id, e.name, EXTRACT(HOUR FROM o.order_date) AS hour, COUNT(o.order_id) AS order_count 
         FROM Orders o 
         JOIN Employees e ON o.employee_id = e.employee_id 
         WHERE DATE(o.order_date) = ? 
         GROUP BY e.employee_id, e.name, EXTRACT(HOUR FROM o.order_date) 
         ORDER BY e.name, hour`,
        [date]
      );
      
      // Process employee data
      employeeOrdersData.forEach(row => {
        const employeeId = row.employee_id;
        const name = row.name;
        const hour = parseInt(row.hour);
        const count = row.order_count;
        
        const key = `${employeeId} - ${name}`;
        
        if (!employeeData[key]) {
          employeeData[key] = {};
          // Initialize all hours with 0
          for (let i = 10; i <= 22; i++) {
            employeeData[key][i] = 0;
          }
        }
        
        employeeData[key][hour] = count;
      });
      
      // If no employees have orders, fetch all employees and initialize with zeros
      if (Object.keys(employeeData).length === 0) {
        const employeesData = await query(
          "SELECT employee_id, name FROM Employees ORDER BY name",
          []
        );
        
        employeesData.forEach(row => {
          const employeeId = row.employee_id;
          const name = row.name;
          const key = `${employeeId} - ${name}`;
          
          employeeData[key] = {};
          for (let i = 10; i <= 22; i++) {
            employeeData[key][i] = 0;
          }
        });
      }
      
      // Query to get tips per hour
      const tipsData = await query(
        `SELECT EXTRACT(HOUR FROM order_date) AS hour, SUM(tips) AS total_tips 
         FROM Orders 
         WHERE DATE(order_date) = ? 
         GROUP BY EXTRACT(HOUR FROM order_date) 
         ORDER BY hour`,
        [date]
      );
      
      // Fill tips by hour
      tipsData.forEach(row => {
        const hour = parseInt(row.hour);
        tipsByHour[hour] = parseFloat(row.total_tips);
      });
    } else {
      // If Z-Report was run, still populate employee data structure with zeros
      const employeesData = await query(
        "SELECT employee_id, name FROM Employees ORDER BY name",
        []
      );
      
      employeesData.forEach(row => {
        const employeeId = row.employee_id;
        const name = row.name;
        const key = `${employeeId} - ${name}`;
        
        employeeData[key] = {};
        for (let i = 10; i <= 22; i++) {
          employeeData[key][i] = 0;
        }
      });
    }
    
    // Calculate totals
    const totalOrders = Object.values(ordersByHour).reduce((sum: number, value: any) => sum + value, 0);
    const totalSales = Object.values(salesByHour).reduce((sum: number, value: any) => sum + parseFloat(value), 0);
    const totalTips = Object.values(tipsByHour).reduce((sum: number, value: any) => sum + parseFloat(value), 0);
    
    return NextResponse.json({
      date,
      zReportRun,
      ordersByHour,
      salesByHour,
      employeeData,
      tipsByHour,
      summary: {
        totalOrders,
        totalSales,
        totalTips
      }
    });
  } catch (error) {
    console.error("Error generating X Report:", error);
    return NextResponse.json(
      { error: "Failed to generate X Report" },
      { status: 500 }
    );
  }
}