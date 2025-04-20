import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

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
  const searchParams = request.nextUrl.searchParams;
  const menuId = searchParams.get('menuId');
  
  if (!menuId) {
    return NextResponse.json(
      { error: "Menu ID is required" },
      { status: 400 }
    );
  }

  try {
    const client = await pool.connect();
    const query = `
      SELECT i.ingredient_id, i.ingredient
      FROM Ingredients i
      JOIN MenuToIngredient mti ON i.ingredient_id = mti.ingredient_id
      WHERE mti.menu_id = $1
    `;
    
    const result = await client.query(query, [menuId]);
    client.release();
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching menu ingredients:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu ingredients" },
      { status: 500 }
    );
  }
}