import {NextResponse } from 'next/server';
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


export async function GET() {
  const client = await pool.connect();

  try {
    const currentDate = new Date().toLocaleDateString("en-CA"); // "YYYY-MM-DD"

    // Start a transaction to ensure atomic operations
    await client.query('BEGIN');

    // Insert record into zreports table
    await client.query(
      `INSERT INTO zreports (date, ran) 
       VALUES ($1, 1)`,
      [currentDate]
    );

    // Fetch daily totals
    const totalOrdersQuery = await client.query(
      `SELECT
        COALESCE(COUNT(order_id), 0) AS total_orders,
        COALESCE(SUM(total), 0.00) AS total_sales,
        COALESCE(SUM(tips), 0.00) AS total_tips
       FROM Orders
       WHERE DATE(order_date) = $1`,
      [currentDate]
    );

    // Fetch most popular item
    const popularItemQuery = await client.query(
      `SELECT
        COALESCE(mi.item_name, 'No item') as item_name,
        COALESCE(SUM(eoi.quantity), 0) as total_ordered
       FROM Orders o
       LEFT JOIN EachOrderedItem eoi ON o.order_id = eoi.order_id
       LEFT JOIN MenuItems mi ON eoi.menu_id = mi.menu_id
       WHERE DATE(o.order_date) = $1
       GROUP BY mi.item_name
       ORDER BY total_ordered DESC
       LIMIT 1`,
      [currentDate]
    );

    // Fetch employee order totals
    const employeeOrdersQuery = await client.query(
      `SELECT
        e.employee_id,
        e.name,
        COALESCE(COUNT(o.order_id), 0) AS total_orders
       FROM Employees e
       LEFT JOIN Orders o ON e.employee_id = o.employee_id
         AND DATE(o.order_date) = $1
       GROUP BY e.employee_id, e.name
       ORDER BY total_orders DESC`,
      [currentDate]
    );

    // Commit the transaction
    await client.query('COMMIT');

    // Prepare response with explicit numeric conversion
    const zReportData = {
      totalOrders: Number(totalOrdersQuery.rows[0]?.total_orders) || 0,
      totalSales: Number(totalOrdersQuery.rows[0]?.total_sales) || 0,
      totalTips: Number(totalOrdersQuery.rows[0]?.total_tips) || 0,
      mostPopularItem: {
        name: totalOrdersQuery.rows[0]?.item_name || 'None',
        count: Number(popularItemQuery.rows[0]?.total_ordered) || 0
      },
      employeeOrderTotals: employeeOrdersQuery.rows.map(row => ({
        employeeId: Number(row.employee_id),
        name: row.name,
        totalOrders: Number(row.total_orders)
      }))
    };

    return NextResponse.json(zReportData, { status: 200 });
  } catch (error) {
    // Rollback the transaction in case of error
    await client.query('ROLLBACK');

    console.error('Z-Report Generation Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate Z Report',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
