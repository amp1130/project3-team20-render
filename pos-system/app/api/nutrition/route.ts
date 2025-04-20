import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

// PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || "5432"),
  ssl: { rejectUnauthorized: false },
});

// GET /api/nutrition?menuId=1
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const menuIdParam = searchParams.get("menuId");

    if (!menuIdParam) {
      return NextResponse.json({ error: "Missing menuId query parameter" }, { status: 400 });
    }

    const menuId = parseInt(menuIdParam);

    if (isNaN(menuId)) {
      return NextResponse.json({ error: "Invalid menuId" }, { status: 400 });
    }

    const client = await pool.connect();

    const result = await client.query(
      "SELECT calories, sugar FROM nutrition WHERE menu_id = $1",
      [menuId]
    );

    client.release();

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Nutrition data not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error) {
    console.error("Error fetching nutrition data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

