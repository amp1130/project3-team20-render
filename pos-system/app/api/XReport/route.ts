import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || "5432"),
  ssl: {
    rejectUnauthorized: false,
  },
});


interface EmployeeOrderData {
  employee: string;
  hourlyOrders: { [hour: string]: number };
  total: number;
}

export async function GET() {
  try {
    const client = await pool.connect();
    const currentDate = new Date().toLocaleDateString("en-CA"); // "YYYY-MM-DD"

    // Check if Z-Report has been run
    const zReportCheck = await client.query(
      "SELECT COUNT(*) AS count FROM zreports WHERE DATE(date) = $1",
      [currentDate]
    );
    const zReportRun = parseInt(zReportCheck.rows[0].count) > 0;

    // Queries
    const ordersByHourQuery = `
      SELECT EXTRACT(HOUR FROM order_date)::int AS hour, COUNT(order_id) AS order_count 
      FROM Orders 
      WHERE DATE(order_date) = $1 
      GROUP BY hour 
      ORDER BY hour
    `;

    const salesByHourQuery = `
      SELECT EXTRACT(HOUR FROM order_date)::int AS hour, SUM(total) AS sales_amount 
      FROM Orders 
      WHERE DATE(order_date) = $1 
      GROUP BY hour 
      ORDER BY hour
    `;

    const employeeOrdersQuery = `
      SELECT e.employee_id, e.name, EXTRACT(HOUR FROM o.order_date)::int AS hour, COUNT(o.order_id) AS order_count 
      FROM Orders o 
      JOIN Employees e ON o.employee_id = e.employee_id 
      WHERE DATE(o.order_date) = $1 
      GROUP BY e.employee_id, e.name, hour 
      ORDER BY e.name, hour
    `;

    const tipsQuery = `
      SELECT EXTRACT(HOUR FROM order_date)::int AS hour, SUM(tips) AS total_tips 
      FROM Orders 
      WHERE DATE(order_date) = $1 
      GROUP BY hour 
      ORDER BY hour
    `;

    // Execute queries
    const [ordersResult, salesResult, employeesResult, tipsResult] =
      await Promise.all([
        client.query(ordersByHourQuery, [currentDate]),
        client.query(salesByHourQuery, [currentDate]),
        client.query(employeeOrdersQuery, [currentDate]),
        client.query(tipsQuery, [currentDate]),
      ]);

    // Format the data
    const ordersByHour = ordersResult.rows.map((row) => ({
      hour: `${row.hour}:00`,
      value: parseInt(row.order_count),
    }));

    const salesByHour = salesResult.rows.map((row) => ({
      hour: `${row.hour}:00`,
      value: parseFloat(row.sales_amount),
    }));

    const tipsData = tipsResult.rows.map((row) => ({
      hour: `${row.hour}:00`,
      value: parseFloat(row.total_tips),
    }));

    // Group employee orders
    const employeeOrders: EmployeeOrderData[] = [];
    const employeeMap = new Map<string, EmployeeOrderData>();

    employeesResult.rows.forEach((row) => {
      const key = `${row.employee_id} - ${row.name}`;
      if (!employeeMap.has(key)) {
        const hourlyOrders: { [hour: string]: number } = {};
        for (let i = 10; i <= 22; i++) {
          hourlyOrders[`${i}:00`] = 0;
        }
        employeeMap.set(key, {
          employee: key,
          hourlyOrders,
          total: 0,
        });
      }

      const employeeData = employeeMap.get(key)!;
      employeeData.hourlyOrders[`${row.hour}:00`] = parseInt(row.order_count);
      employeeData.total += parseInt(row.order_count);
    });

    employeeOrders.push(...Array.from(employeeMap.values()));

    // Calculate summary
    const summary = {
      totalOrders: ordersByHour.reduce((sum, item) => sum + item.value, 0),
      totalSales: salesByHour.reduce((sum, item) => sum + item.value, 0),
      totalTips: tipsData.reduce((sum, item) => sum + item.value, 0),
    };

    client.release();

    return NextResponse.json({
      date: currentDate,
      zReportRun,
      ordersByHour,
      salesByHour,
      employeeOrders,
      tipsData,
      summary,
    });
  } catch (error) {
    console.error("Error generating X Report:", error);
    return NextResponse.json(
      { error: "Failed to generate X Report" },
      { status: 500 }
    );
  }
}
