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
        const { menu_id } = await request.json();
        
        // Validate required fields
        if (!menu_id) {
            return NextResponse.json(
                { error: "Menu item ID is required" },
                { status: 400 }
            );
        }

        // Connect to the database
        const client = await pool.connect();
        
        try {
            // Start transaction
            await client.query('BEGIN');
            
            // Check if item exists
            const checkResult = await client.query(
                'SELECT * FROM MenuItems WHERE menu_id = $1',
                [menu_id]
            );
            
            if (checkResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return NextResponse.json(
                    { error: "Menu item not found" },
                    { status: 404 }
                );
            }
            
            // Delete any menu-ingredient relationships first
            await client.query(
                'DELETE FROM MenuToIngredient WHERE menu_id = $1',
                [menu_id]
            );
            
            // Delete the menu item
            const deleteResult = await client.query(
                'DELETE FROM MenuItems WHERE menu_id = $1 RETURNING *',
                [menu_id]
            );
            
            // Commit transaction
            await client.query('COMMIT');
            
            // Return success message with the deleted item
            return NextResponse.json({ 
                message: "Menu item deleted successfully",
                item: deleteResult.rows[0]
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
        console.error("Error deleting menu item:", error);
        return NextResponse.json(
            { error: "Failed to delete menu item" },
            { status: 500 }
        );
    }
}
