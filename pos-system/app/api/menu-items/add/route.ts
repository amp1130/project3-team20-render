import { NextResponse } from "next/server";
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
        const { menu_id, item_name, price, description, ingredients } = await request.json();
        
        // Validate required fields (including menu_id as in the Java code)
        if (!menu_id || !item_name || !price) {
            return NextResponse.json(
                { error: "Menu ID, item name, and price are required" },
                { status: 400 }
            );
        }

        // Connect to the database
        const client = await pool.connect();
        
        try {
            // Start transaction
            await client.query('BEGIN');
            
            // Check if item with the same name already exists
            const checkResult = await client.query(
                'SELECT * FROM MenuItems WHERE item_name = $1',
                [item_name]
            );
            
            if (checkResult.rows.length > 0) {
                await client.query('ROLLBACK');
                return NextResponse.json(
                    { error: "Menu item with this name already exists" },
                    { status: 409 }
                );
            }
            
            // Insert the new menu item (with menu_id included)
            const insertQuery = `
                INSERT INTO MenuItems (menu_id, item_name, price, description) 
                VALUES ($1, $2, $3, $4) 
                RETURNING *
            `;
            
            const result = await client.query(insertQuery, [
                menu_id,
                item_name, 
                price,
                description || null
            ]);
            
            // Get the inserted item with its ID
            const newItem = result.rows[0];
            
            // Process ingredients if provided (similar to the Java code)
            if (ingredients && ingredients.length > 0) {
                const ingredientIds = Array.isArray(ingredients) 
                    ? ingredients 
                    : ingredients.split(',').map((id: string) => id.trim());
                
                for (const ingredientId of ingredientIds) {
                    await client.query(
                        'INSERT INTO MenuToIngredient (menu_id, ingredient_id) VALUES ($1, $2)',
                        [menu_id, parseInt(ingredientId)]
                    );
                }
            }
            
            // Commit transaction
            await client.query('COMMIT');
            
            // Assign a category to the new item
            const category = assignCategoryToItem(item_name);
            
            // Add category to the response item
            const itemWithCategory = {
                ...newItem,
                category
            };
            
            // Return success message with the new item
            return NextResponse.json({ 
                message: "Menu item added successfully",
                item: itemWithCategory
            });
        } catch (error) {
            // Rollback in case of error
            await client.query('ROLLBACK');
            throw error;
        } finally {
            // Release the client back to the pool
            client.release();
        }
    } catch (error) {
        console.error("Error adding menu item:", error);
        return NextResponse.json(
            { error: "Failed to add menu item" },
            { status: 500 }
        );
    }
}