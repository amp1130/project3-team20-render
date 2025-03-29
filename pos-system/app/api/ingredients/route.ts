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


export async function GET() {
  try {
    // Connect to the database
    const client = await pool.connect();
    
    try {
      // Query the ingredients table with the correct column names
      const result = await client.query(`
        SELECT 
          ingredient_id, 
          ingredient as ingredient_name, 
          current_count as current_amount, 
          critical_count as critical_amount,
          restock_count
        FROM ingredients
        ORDER BY ingredient_id
      `);
      
      // Return the ingredients as JSON
      return NextResponse.json(result.rows);
    } finally {
      // Release the client back to the pool
      client.release();
    }
  } catch (error) {
    console.error("Error fetching ingredients:", error);
    return NextResponse.json(
      { error: "Failed to fetch ingredients" },
      { status: 500 }
    );
  }
} 