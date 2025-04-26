import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || "5432"),
    ssl: { rejectUnauthorized: false },
});

export async function PUT(request: Request) {
    try {
        const { menu_id, price } = await request.json();
        if (!menu_id || price == null) {
            return NextResponse.json(
                { error: "Menu ID and price are required" },
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
                    { error: "No menu item found with the provided ID" },
                    { status: 404 }
                );
            }

            const updateQuery = `
                UPDATE MenuItems
                SET price = $1
                WHERE menu_id = $2
                RETURNING *
            `;
            const updatedItem = await client.query(updateQuery, [price, menu_id]);

            await client.query("COMMIT");
            return NextResponse.json({
                message: "Menu item updated successfully",
                item: updatedItem.rows[0],
            });
        } catch {
            await client.query("ROLLBACK");
            return NextResponse.json(
                { error: "Failed to update menu item" },
                { status: 500 }
            );
        } finally {
            client.release();
        }
    } catch {
        return NextResponse.json(
            { error: "Invalid request" },
            { status: 400 }
        );
    }
}
