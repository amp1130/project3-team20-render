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
// Function to determine the category of the new menu item
function assignCategoryToItem(itemName: string) {
    // Simple assignment based on common keywords
    const lowerName = itemName.toLowerCase();
    
    if (lowerName.includes("milk tea") || lowerName.includes("boba")) {
        return "Milk Tea";
    } else if (lowerName.includes("fruit") || lowerName.includes("tea")) {
        return "Fruit Tea";
    } else if (lowerName.includes("blend") || lowerName.includes("smoothie")) {
        return "Blended";
    } else if (lowerName.includes("fresh milk")) {
        return "Fresh Milk";
    } else {
        return "Other"; // Default category
    }
}

export async function POST(request: Request) {
    try {
      const { menu_id, item_name, price, description, ingredients, calories, sugar } = await request.json();
  
      if (!menu_id || !item_name || !price || calories == null || sugar == null) {
        return NextResponse.json(
          { error: "Menu ID, item name, price, calories, and sugar are required" },
          { status: 400 }
        );
      }
  
      const client = await pool.connect();
  
      try {
        await client.query("BEGIN");
  
        const checkResult = await client.query(
          "SELECT * FROM MenuItems WHERE item_name = $1",
          [item_name]
        );
        if (checkResult.rows.length > 0) {
          await client.query("ROLLBACK");
          return NextResponse.json(
            { error: "Menu item with this name already exists" },
            { status: 409 }
          );
        }
  
        const insertQuery = `
          INSERT INTO MenuItems (menu_id, item_name, price)
          VALUES ($1, $2, $3)
          RETURNING *
        `;
        const result = await client.query(insertQuery, [menu_id, item_name, price]);
        const newItem = result.rows[0];
  
        if (ingredients && ingredients.length > 0) {
          const ingredientIds = Array.isArray(ingredients)
            ? ingredients
            : ingredients.split(",").map((id: string) => id.trim());
  
          for (const ingredientId of ingredientIds) {
            await client.query(
              "INSERT INTO MenuToIngredient (menu_id, ingredient_id) VALUES ($1, $2)",
              [newItem.menu_id, parseInt(ingredientId)]
            );
          }
        }
  
        // Insert into nutrition table
        await client.query(
          "INSERT INTO nutrition (menu_id, calories, sugar) VALUES ($1, $2, $3)",
          [newItem.menu_id, calories, sugar]
        );
  
        await client.query("COMMIT");
  
        const category = assignCategoryToItem(item_name);
  
        return NextResponse.json({
          message: "Menu item added successfully",
          item: { ...newItem, category }
        });
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Error adding menu item:", error);
      return NextResponse.json({ error: "Failed to add menu item" }, { status: 500 });
    }
}
  