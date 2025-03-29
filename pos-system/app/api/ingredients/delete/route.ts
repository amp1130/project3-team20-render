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


export async function DELETE(request: Request) {
  try {
    const { ingredient_id } = await request.json();
    
    // Validate required fields
    if (!ingredient_id) {
      return NextResponse.json(
        { error: "Ingredient ID is required" },
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
      
      // Delete the ingredient
      const deleteQuery = 'DELETE FROM ingredients WHERE ingredient_id = $1 RETURNING *';
      const result = await client.query(deleteQuery, [ingredient_id]);
      
      // Return success message
      return NextResponse.json({ 
        message: "Ingredient deleted successfully",
        deleted: result.rows[0]
      });
    } finally {
      // Release the client back to the pool
      client.release();
    }
  } catch (error) {
    console.error("Error deleting ingredient:", error);
    return NextResponse.json(
      { error: "Failed to delete ingredient" },
      { status: 500 }
    );
  }
} 