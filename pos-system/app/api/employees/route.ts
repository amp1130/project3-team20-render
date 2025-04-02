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
      // Query the employees table with the correct column names
      const result = await client.query(`
        SELECT 
          employee_id, 
          name as employee_name, 
          job_title, 
          hourly_wage,
          SUM(hours) as total_hours
        FROM employees
        GROUP BY employee_id, name, job_title, hourly_wage 
        ORDER BY employee_id
      `);
      
      // Return the employees as JSON
      return NextResponse.json(result.rows);
    } finally {
      // Release the client back to the pool
      client.release();
    }
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json(
      { error: "Failed to fetch employees" },
      { status: 500 }
    );
  }
} 