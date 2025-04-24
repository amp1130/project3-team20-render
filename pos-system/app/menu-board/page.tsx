// app/menu-board/page.tsx
'use client'; // Enables client-side rendering for this page

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react"; // Icon for the back button
import { useRouter } from "next/navigation"; // Navigation hook
import Image from "next/image"; // Not used but left commented for optional images
import { getProductEmojis } from "@/components/ui/menu-item-card"; // Function to get emoji for a product name

// Define the structure of a menu item
interface MenuItem {
  menu_id: number;
  item_name: string;
  price: number;
  ingredients: string[];
}

export default function MenuBoardPage() {
  const router = useRouter(); // Router to navigate between pages
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]); // State to hold fetched menu items

  // Fetch menu items from API when component mounts
  useEffect(() => {
    const fetchMenuBoard = async () => {
      try {
        const response = await fetch('/api/menu-board'); // API endpoint for menu board
        const data = await response.json();
        setMenuItems(data); // Save retrieved data to state
      } catch (error) {
        console.error("Failed to fetch menu board:", error);
      }
    };

    fetchMenuBoard();
  }, []);

  return (
    <div className="min-h-screen bg-[#2b211b] text-[#f8f5f2]">
      {/* Back Button and Page Title */}
      <div className="p-4 flex items-center border-b border-[#e6ded5]">
        <button
          onClick={() => router.push("/")} // Navigate back to home page
          className="p-2 rounded hover:bg-[#b79c85] text-[#b79c85]"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="ml-4 text-2xl text-[#b79c85] font-bold">Menu Board</h1>
      </div>

      {/* Grid of Menu Items */}
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {menuItems.map((item) => (
          <div
            key={item.menu_id}
            className="bg-[#faf0e6] rounded-xl shadow-lg p-4 flex flex-col items-center"
          >
            {/* Optional image placeholder (commented out)
            <Image
              src="/boba.png"
              alt={item.item_name}
              width={100}
              height={100}
              className="mb-4"
            /> 
            */}

            {/* Emoji representation of item */}
            <div className="h-20 w-full flex items-center justify-center">
              <div className="text-3xl">{getProductEmojis(item.item_name)}</div>
            </div>

            {/* Item name */}
            <h2 className="text-lg font-semibold text-[#b79c85]">
              {item.item_name}
            </h2>

            {/* Price of item */}
            <p className="text-[#b79c85] mb-2">${item.price.toFixed(2)}</p>

            {/* Ingredients listed in italic, comma-separated */}
            <p className="text-sm italic text-[#b79c85] text-center mt-1">
              {item.ingredients.join(", ")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
