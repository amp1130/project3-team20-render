import { NextResponse } from "next/server";
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

export async function DELETE(request: Request) {
  try {
    const { menu_id } = await request.json();

    if (!menu_id) {
      return NextResponse.json(
        { error: "Menu item ID is required" },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const checkResult = await client.query(
        "SELECT * FROM MenuItems WHERE menu_id = $1",
        [menu_id]
      );

      if (checkResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          { error: "Menu item not found" },
          { status: 404 }
        );
      }

      // Delete from MenuToIngredient
      await client.query("DELETE FROM MenuToIngredient WHERE menu_id = $1", [menu_id]);

      // Delete from Nutrition
      await client.query("DELETE FROM Nutrition WHERE menu_id = $1", [menu_id]);

      // Delete from MenuItems
      const deleteResult = await client.query(
        "DELETE FROM MenuItems WHERE menu_id = $1 RETURNING *",
        [menu_id]
      );

      await client.query("COMMIT");

      return NextResponse.json({
        message: "Menu item deleted successfully (including nutrition data)",
        item: deleteResult.rows[0],
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error deleting menu item:", error);
    return NextResponse.json(
      { error: "Failed to delete menu item" },
      { status: 500 }
    );
  }
}

