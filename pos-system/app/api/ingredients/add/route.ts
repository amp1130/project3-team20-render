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
    const { ingredient_id, ingredient_name, current_amount, critical_amount } = await request.json();
    
    // Validate required fields
    if (!ingredient_id || !ingredient_name || current_amount === undefined || critical_amount === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Connect to the database
    const client = await pool.connect();
    
    try {
      // Check if ingredient with this ID already exists
      const checkResult = await client.query(
        'SELECT * FROM ingredients WHERE ingredient_id = $1',
        [ingredient_id]
      );
      
      if (checkResult.rows.length > 0) {
        return NextResponse.json(
          { error: "An ingredient with this ID already exists" },
          { status: 409 }
        );
      }
      
      // First check if the table exists
      const tableCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'ingredients'
        );
      `);
      
      const tableExists = tableCheck.rows[0].exists;

      if (!tableExists) {
        // Create the table if it doesn't exist
        await client.query(`
          CREATE TABLE ingredients (
            ingredient_id INTEGER PRIMARY KEY,
            ingredient VARCHAR(255) NOT NULL,
            current_count DECIMAL(10,2) NOT NULL,
            critical_count DECIMAL(10,2) NOT NULL,
            restock_count DECIMAL(10,2) DEFAULT 0
          );
        `);
        console.log("Created ingredients table");
      }
      
      // Insert the new ingredient with correct column names
      const insertQuery = `
        INSERT INTO ingredients (ingredient_id, ingredient, current_count, critical_count, restock_count)
        VALUES ($1, $2, $3, $4, 0)
        RETURNING *
      `;
      
      const result = await client.query(insertQuery, [
        ingredient_id,
        ingredient_name,
        current_amount,
        critical_amount
      ]);
      
      // Return the newly created ingredient
      return NextResponse.json(result.rows[0]);
    } finally {
      // Release the client back to the pool
      client.release();
    }
  } catch (error) {
    console.error("Error adding ingredient:", error);
    return NextResponse.json(
      { error: "Failed to add ingredient" },
      { status: 500 }
    );
  }
} 