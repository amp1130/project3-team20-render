"use client"; // This file runs on the client side

// Import UI components and hooks
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/ui/navigation";
import { MenuItemCard } from "@/components/ui/menu-item-card";
import { SearchBar } from "@/components/ui/search-bar";
import { OrderManager } from "@/components/ui/order-manager";
import { useState, useEffect } from "react";
import { useTheme } from "@/context/theme-context";

// Define the shape of a menu item object
interface MenuItem {
  id: number;
  menu_id: number;
  item_name: string;
  price: number | string;
  category: string;
  description?: string;
}

export default function Home() {
  // State variables to manage menu data and UI selections
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Get current theme from context (dark or light mode)
  const { theme } = useTheme();

  // Define menu categories for filtering
  const categories = ["All", "Milk Tea", "Fruit Tea", "Blended", "Fresh Milk", "Crema", "Coffee", "Tea"];

  // Fetch menu items when component mounts
  useEffect(() => {
    async function fetchMenuItems() {
      try {
        const response = await fetch("/api/menu-items");
        const data = await response.json();
        setMenuItems(data);           // Store full list
        setFilteredItems(data);       // Initially display all items
      } catch (error) {
        console.error("Error fetching menu items:", error);
        setMenuItems([]);             // Clear on error
        setFilteredItems([]);
      }
    }

    fetchMenuItems();
  }, []);

  // Handles search logic and applies category filter
  const handleSearch = (query: string) => {
    if (!query.trim()) {
      filterByCategory(selectedCategory); // Reset filter if query is empty
      return;
    }

    const filtered = menuItems.filter((item) => {
      const matchesSearch = item.item_name.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    setFilteredItems(filtered);
  };

  // Filters items based on selected category
  const filterByCategory = (category: string) => {
    setSelectedCategory(category);

    if (category === "All") {
      setFilteredItems(menuItems); // Show all items
    } else {
      const filtered = menuItems.filter((item) => item.category === category);
      setFilteredItems(filtered);
    }
  };

  const isDark = theme === "dark"; // Boolean for dark theme check

  return (
    <>
      <Navigation /> {/* Top navigation bar */}

      {/* Page layout with theme-based background and text */}
      <div className={`fixed inset-0 pt-[72px] ${isDark ? "bg-[#1c1c1c] text-white" : "bg-[#f8f5f2] text-[#3c2f1f]"} flex flex-col`}>
        
        {/* Search bar and category filter */}
        <div className={`p-4 border-b ${isDark ? "border-gray-700 bg-[#1c1c1c]" : "border-[#e6ded5] bg-[#f8f5f2]"}`}>
          <div className="flex flex-wrap items-center gap-4">
            <SearchBar onSearch={handleSearch} />
            
            {/* Category filter buttons */}
            <div className="flex gap-3 overflow-x-auto pb-1 flex-grow">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant="outline"
                  className={`
                    ${selectedCategory === category
                      ? isDark
                        ? "bg-gray-700 text-white"
                        : "bg-[#e6ded5] text-[#3c2f1f]"
                      : isDark
                      ? "bg-[#1c1c1c] text-gray-300"
                      : "bg-[#f8f5f2] text-[#5c4f42]"}
                    border border-[#d4c8bc] whitespace-nowrap px-4
                    ${isDark ? "hover:bg-gray-700 hover:text-white" : "hover:bg-[#e6ded5] hover:text-[#3c2f1f]"}
                  `}
                  onClick={() => filterByCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Menu item display section */}
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <h2 className="text-2xl font-bold mb-4">Menu Items</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item, index) => (
                    <MenuItemCard key={item.id || `item-${index}`} item={item} />
                  ))
                ) : (
                  <p className="col-span-full text-center py-8 text-[#8c7b6b]">No menu items available.</p>
                )}
              </div>
            </div>
          </div>

          <OrderManager /> {/* Floating order summary/cart manager */}
        </div>
      </div>
    </>
  );
}
