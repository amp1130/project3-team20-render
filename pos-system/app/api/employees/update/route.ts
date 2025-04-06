import e from "express";
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
    const { employee_id, name, job_title, hourly_wage, hours } = await request.json();

    // Connect to the database
    const client = await pool.connect();
    
    try {
      // Update the employee
      const updateQuery = `
        UPDATE employees
        SET name = $2, job_title = $3, hourly_wage = $4, hours = $5
        WHERE employee_id = $1
        RETURNING *;
      `;
      const result = await client.query(updateQuery, [employee_id, name, job_title, hourly_wage, hours]);
      
      // Return success message
      return NextResponse.json({ 
        message: "Employee updated successfully",
        employee: result.rows[0]
      });
    } finally {
      // Release the client back to the pool
      client.release();
    }
  } catch (error) {
    console.error("Error updating employee:", error);
    return NextResponse.json(
      { error: "Failed to update employee" },
      { status: 500 }
    );
  }
} 