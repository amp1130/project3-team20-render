import { getMenuItems } from "@/lib/db-utils";
import { NextResponse } from "next/server";


function assignCategoryToItem(item: { menu_id: number; item_name: string; price: number | string }) {
  let category = "";

  // Assign categories based on item IDs
  if (item.menu_id === 1 || item.menu_id === 2 || item.menu_id === 3 || item.menu_id === 11 || item.menu_id === 12) {
    category = "Milk Tea";
  } else if (item.menu_id === 5 || item.menu_id === 6 || item.menu_id === 7 || item.menu_id === 8 || item.menu_id === 9) {
    category = "Fruit Tea";
  } else if (item.menu_id === 18 || item.menu_id === 19 || item.menu_id === 20) {
    category = "Blended";
  }
  else if (item.menu_id === 15 || item.menu_id === 16 || item.menu_id === 17){
    category = "Fresh Milk";
  }

  return { ...item, category };
}
export async function GET() {
  try {
    const menuItems = await getMenuItems();
    const categorizedItems = menuItems.map(assignCategoryToItem);
    return NextResponse.json(categorizedItems);

  } catch (error) {
    console.error("Error fetching menu items:", error);
    return NextResponse.json({ error: "Failed to fetch menu items" }, { status: 500 });
  }
} 
