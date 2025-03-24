"use client";

import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/ui/navigation";
import { MenuItemCard } from "@/components/ui/menu-item-card";
import { SearchBar } from "@/components/ui/search-bar";
import { OrderManager } from "@/components/ui/order-manager";
import { useState, useEffect } from "react";


interface MenuItem {
  id: number;
  menu_id: number;
  item_name: string;
  price: number | string;
  category: string;
  description?: string;
}

export default function Home() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  // Sample categories - replace with your actual categories
  const categories = ["All", "Milk Tea", "Fruit Tea", "Blended", "Fresh Milk"];

  // Fetch menu items on component mount
  useEffect(() => {
    async function fetchMenuItems() {
      try {
        const response = await fetch('/api/menu-items');
        const data = await response.json();
        setMenuItems(data);
        setFilteredItems(data);
      } catch (error) {
        console.error('Error fetching menu items:', error);
        setMenuItems([]);
        setFilteredItems([]);
      }
    }
    
    fetchMenuItems();
  }, []);

  // Handle search
  const handleSearch = (query: string) => {
    if (!query.trim()) {
      // If search is empty, show all items in the selected category
      filterByCategory(selectedCategory);
      return;
    }
    
    // Filter by search query and selected category
    const filtered = menuItems.filter(item => {
      const matchesSearch = item.item_name.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    
    setFilteredItems(filtered);
  };

  // Handle category filter
  const filterByCategory = (category: string) => {
    setSelectedCategory(category);
    
    if (category === "All") {
      setFilteredItems(menuItems);
    } else {
      const filtered = menuItems.filter(item => item.category === category);
      setFilteredItems(filtered);
    }
  };

  return (
    <>
      <Navigation />
      {/* Main container with fixed height, no scrolling */}
      <div className="fixed inset-0 pt-[72px] bg-[#f8f5f2] flex flex-col">
        {/* Search and Categories - Side by side, fixed at top */}
        <div className="p-4 border-b border-[#e6ded5] bg-[#f8f5f2]">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search Bar */}
            <SearchBar onSearch={handleSearch} />

            {/* Categories */}
            <div className="flex gap-3 overflow-x-auto pb-1 flex-grow">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant="outline"
                  className={`${
                    selectedCategory === category 
                      ? "bg-[#e6ded5] text-[#3c2f1f]" 
                      : "bg-[#f8f5f2] text-[#5c4f42]"
                  } border-[#d4c8bc] hover:bg-[#e6ded5] hover:text-[#3c2f1f] whitespace-nowrap px-4`}
                  onClick={() => filterByCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area - Fixed layout with internal scrolling */}
        <div className="flex flex-1 overflow-hidden">
          {/* Menu Items Grid - Only this area scrolls */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <h2 className="text-2xl font-bold text-[#5c4f42] mb-4">Menu Items</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item, index) => (
                    <MenuItemCard 
                      key={item.id || `item-${index}`} 
                      item={item} 
                    />
                  ))
                ) : (
                  <p className="text-[#8c7b6b] col-span-full text-center py-8">No menu items available.</p>
                )}
              </div>
            </div>
          </div>

          {/* Order Sidebar */}
          <OrderManager />
        </div>
      </div>
    </>
  );
}