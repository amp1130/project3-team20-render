import {NextRequest, NextResponse } from "next/server";
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
  

export async function GET(request: NextRequest) {
  // Get the date from the URL
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get('date');
  
  if (!dateParam) {
      return NextResponse.json(
          { message: 'Date parameter is required' },
          { status: 400 }
      );
  }

  try {
      // Ensure the date is treated as UTC (Prevents Time Zone Shift Issues)
      const utcDate = new Date(dateParam + 'T00:00:00Z').toISOString().split('T')[0];

      // Connect to the database
      const client = await pool.connect();

      try {
          const sql = `
              SELECT mi.item_name, SUM(eoi.quantity) AS quantity, mi.price
              FROM Orders o
              JOIN EachOrderedItem eoi ON o.order_id = eoi.order_id
              JOIN MenuItems mi ON eoi.menu_id = mi.menu_id
              WHERE DATE(o.order_date) = $1
              GROUP BY mi.item_name, mi.price
              ORDER BY quantity DESC
          `;

          // Execute the query using the forced UTC date
          const result = await client.query(sql, [utcDate]);

          // Format the results for the frontend
          const formattedResults = result.rows.map(item => ({
              item_name: item.item_name,
              quantity: parseInt(item.quantity),
              price: parseFloat(item.price)
          }));

          return NextResponse.json(formattedResults);
      } finally {
          // Release the client back to the pool
          client.release();
      }
    } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Error fetching order items:", error.message);
        } else {
          console.error("An unknown error occurred", error);
        }
        return NextResponse.json(
          { error: "Failed to fetch order items" },
          { status: 500 }
        );
    }
}

