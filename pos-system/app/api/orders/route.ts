import { NextResponse } from "next/server";
import { Pool } from "pg";

// Create a connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || "5432"),
  ssl: process.env.NODE_ENV === "production",
});

export async function GET() {
  try {
    // Connect to the database
    const client = await pool.connect();
    
    try {
      // Query the orders table
      const result = await client.query('SELECT order_id, employee_id, order_date, total, tips FROM orders ORDER BY order_date DESC');
      
      // Return the orders as JSON
      return NextResponse.json(result.rows);
    } finally {
      // Release the client back to the pool
      client.release();
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
} 