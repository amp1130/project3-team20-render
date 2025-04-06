import { NextResponse } from "next/server";
import { Pool } from "pg";

// Create a connection pool
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


export async function POST(request: Request) {
  try {
    const { employee_id } = await request.json();
    
    // Validate required fields
    if (!employee_id) {
      return NextResponse.json(
        { error: "Employee ID is required" },
        { status: 400 }
      );
    }

    // Connect to the database
    const client = await pool.connect();
    
    try {
      // Check if employee exists
      const checkResult = await client.query(
        'SELECT * FROM employees WHERE employee_id = $1',
        [employee_id]
      );
      
      if (checkResult.rows.length === 0) {
        return NextResponse.json(
          { error: "Employee not found" },
          { status: 404 }
        );
      }
      
      // Return success message
      return NextResponse.json({ 
        message: "Employee found",
        employee: checkResult.rows[0]
      });
    } finally {
      // Release the client back to the pool
      client.release();
    }
  } catch (error) {
    console.error("Error finding employee:", error);
    return NextResponse.json(
      { error: "Failed to find employee" },
      { status: 500 }
    );
  }
} 