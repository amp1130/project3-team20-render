import { NextRequest, NextResponse } from "next/server";
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

export async function GET(request: NextRequest) {
  // Get the date from the URL
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');

  if (!date) {
    return NextResponse.json(
      { message: 'Date parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Connect to the database
    const client = await pool.connect();
    try {
      // SQL query adapted from the Java version
      const sql = `
        SELECT i.ingredient, SUM(eoi.quantity) AS total_usage 
        FROM Orders o 
        JOIN EachOrderedItem eoi ON o.order_id = eoi.order_id 
        JOIN MenuToIngredient mti ON eoi.menu_id = mti.menu_id 
        JOIN Ingredients i ON mti.ingredient_id = i.ingredient_id 
        WHERE DATE(o.order_date) = $1 
        GROUP BY i.ingredient 
        ORDER BY i.ingredient
      `;
      
      // Execute the query with the date parameter
      const result = await client.query(sql, [date]);
      
      // Format the results for the frontend
      const formattedResults = result.rows.map(item => ({
        ingredient: item.ingredient,
        usage: parseInt(item.total_usage)
      }));
      
      return NextResponse.json(formattedResults);
    } finally {
      // Release the client back to the pool
      client.release();
    }
  } catch (error: any) {
    console.error("Error fetching inventory usage:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory usage data" },
      { status: 500 }
    );
  }
}