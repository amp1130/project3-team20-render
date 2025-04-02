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
    
    // Validate required fields
    if (!employee_id || !name || !job_title || hourly_wage === undefined || hours === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Connect to the database
    const client = await pool.connect();
    
    try {
      // Check if employee with this ID already exists
      const checkResult = await client.query(
        'SELECT * FROM employees WHERE employee_id = $1',
        [employee_id]
      );
      
      if (checkResult.rows.length > 0) {
        return NextResponse.json(
          { error: "An employee with this ID already exists" },
          { status: 409 }
        );
      }
      
      // First check if the table exists
      const tableCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'employees'
        );
      `);
      
      const tableExists = tableCheck.rows[0].exists;

      if (!tableExists) {
        // Create the table if it doesn't exist
        await client.query(`
          CREATE TABLE employees (
            employee_id INTEGER PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            job_title VARCHAR(255) NOT NULL,
            hourly_wage DECIMAL(10,2) NOT NULL,
            hours INTEGER DEFAULT 0
          );
        `);
        console.log("Created employeees table");
      }
      
      // Insert the new employee with correct column names
      const insertQuery = `
        INSERT INTO employees (employee_id, name, job_title, hourly_wage, hours)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      
      const result = await client.query(insertQuery, [
        employee_id,
        name,
        job_title,
        hourly_wage,
        hours,
      ]);
      
      // Return the newly created employee
      return NextResponse.json(result.rows[0]);
    } finally {
      // Release the client back to the pool
      client.release();
    }
  } catch (error) {
    console.error("Error adding employee:", error);
    return NextResponse.json(
      { error: "Failed to add employee" },
      { status: 500 }
    );
  }
} 