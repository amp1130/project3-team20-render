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
    const { ingredient_id, restock_amount } = await request.json();
    
    // Validate required fields
    if (!ingredient_id || restock_amount === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (restock_amount <= 0) {
      return NextResponse.json(
        { error: "Restock amount must be positive" },
        { status: 400 }
      );
    }

    // Connect to the database
    const client = await pool.connect();
    
    try {
      // Check if ingredient exists
      const checkResult = await client.query(
        'SELECT * FROM ingredients WHERE ingredient_id = $1',
        [ingredient_id]
      );
      
      if (checkResult.rows.length === 0) {
        return NextResponse.json(
          { error: "Ingredient not found" },
          { status: 404 }
        );
      }
      
      // Update the ingredient's current amount and restock count
      const updateQuery = `
        UPDATE ingredients 
        SET current_count = current_count + $1,
            restock_count = restock_count + 1
        WHERE ingredient_id = $2
        RETURNING *
      `;
      
      const result = await client.query(updateQuery, [restock_amount, ingredient_id]);
      
      // Return the updated ingredient
      return NextResponse.json({
        message: "Ingredient restocked successfully",
        updated: result.rows[0]
      });
    } finally {
      // Release the client back to the pool
      client.release();
    }
  } catch (error) {
    console.error("Error restocking ingredient:", error);
    return NextResponse.json(
      { error: "Failed to restock ingredient" },
      { status: 500 }
    );
  }
} 