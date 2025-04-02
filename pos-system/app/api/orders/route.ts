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


export async function GET() {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT order_id, employee_id, order_date, total, tips FROM orders ORDER BY order_date DESC"
      );
      return NextResponse.json(result.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN"); // Start transaction
    const { total_amount, tip_amount, items, employee_id } = await request.json();
    
    // Validate input - ensure employee_id is provided
    if (!total_amount || tip_amount === undefined || !items || items.length === 0 || !employee_id) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    
    const order_date = new Date().toLocaleString("en-US", {
      timeZone: "America/Chicago",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true
    });
    console.log(order_date); 
    
    // Fetch last order ID
    const result = await client.query("SELECT MAX(last_order_id) AS last_order_id FROM OrderIDTracker");
    const lastOrderId = result.rows[0]?.last_order_id ?? 15624;
    const newOrderId = lastOrderId + 1;
    
    // Update tracker table
    await client.query("INSERT INTO OrderIDTracker (last_order_id) VALUES ($1)", [newOrderId]);
    
    // Fetch last `localEachOrderedID`
    const idTrackerResult = await client.query("SELECT local_each_ordered_id FROM IDTracker WHERE id = 1");
    let localEachOrderedID = idTrackerResult.rows[0]?.local_each_ordered_id ?? 16209;
    
    // Insert new order
    const orderResult = await client.query(
      `INSERT INTO Orders (order_id, employee_id, order_date, total, tips)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [newOrderId, employee_id, order_date, total_amount, tip_amount]
    );
    
    // Insert each ordered item
    for (const item of items) {
      localEachOrderedID++;
      await client.query(
        `INSERT INTO EachOrderedItem (item_id, menu_id, quantity, order_id)
         VALUES ($1, $2, $3, $4)`,
        [localEachOrderedID, item.menu_id, item.quantity, newOrderId]
      );
    }
    
    // Update `IDTracker`
    await client.query("UPDATE IDTracker SET local_each_ordered_id = $1 WHERE id = 1", [localEachOrderedID]);
    
    await client.query("COMMIT"); // Commit transaction
    return NextResponse.json({ order: orderResult.rows[0] }, { status: 201 });
  } catch (error) {
    await client.query("ROLLBACK"); // Rollback on error
    console.error("Error inserting order:", error);
    return NextResponse.json({ error: "Failed to add order" }, { status: 500 });
  } finally {
    client.release();
  }
}