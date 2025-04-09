// app/api/menu-board/route.ts
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

interface MenuBoardItem {
  menu_id: number;
  item_name: string;
  price: number;
  ingredients: string[];
}

export async function GET() {
  try {
    const client = await pool.connect();

    const menuItemsQuery = `
      SELECT mi.menu_id, mi.item_name, mi.price, i.ingredient, i.ingredient_id
      FROM MenuItems mi
      LEFT JOIN MenuToIngredient mti ON mi.menu_id = mti.menu_id
      LEFT JOIN Ingredients i ON mti.ingredient_id = i.ingredient_id
      ORDER BY mi.menu_id;
    `;

    const result = await client.query(menuItemsQuery);

    // Group ingredients under each menu item
    const menuMap = new Map<number, MenuBoardItem>();

    result.rows.forEach((row) => {
      const menuId = row.menu_id;
      if (!menuMap.has(menuId)) {
        menuMap.set(menuId, {
          menu_id: menuId,
          item_name: row.item_name,
          price: parseFloat(row.price),
          ingredients: [],
        });
      }

      if (row.ingredient && ![26, 27, 28].includes(row.ingredient_id)) {
        menuMap.get(menuId)!.ingredients.push(row.ingredient);
      }
    });

    client.release();

    return NextResponse.json(Array.from(menuMap.values()));
  } catch (error) {
    console.error("Error fetching menu board:", error);
    return NextResponse.json(
      { error: "Failed to load menu board" },
      { status: 500 }
    );
  }
}
