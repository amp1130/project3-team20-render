// app/menu-board/page.tsx
'use client';

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getProductEmojis } from "@/components/ui/menu-item-card"; // Import the emoji function

interface MenuItem {
  menu_id: number;
  item_name: string;
  price: number;
  ingredients: string[];
}

export default function MenuBoardPage() {
  const router = useRouter();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    const fetchMenuBoard = async () => {
      try {
        const response = await fetch('/api/menu-board'); // You’ll create this API route
        const data = await response.json();
        setMenuItems(data);
      } catch (error) {
        console.error("Failed to fetch menu board:", error);
      }
    };

    fetchMenuBoard();
  }, []);

  return (
    <div className="min-h-screen bg-[#2b211b] text-[#f8f5f2]">
      {/* Back Button */}
      <div className="p-4 flex items-center border-b border-[#e6ded5]">
        <button
          onClick={() => router.push("/")}
          className="p-2 rounded hover:bg-[#b79c85] text-[#b79c85]"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="ml-4 text-2xl text-[#b79c85] font-bold">Menu Board</h1>
      </div>

      {/* Menu Grid */}
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {menuItems.map((item) => (
          <div
            key={item.menu_id}
            className="bg-[#faf0e6] rounded-xl shadow-lg p-4 flex flex-col items-center"
          >
            {/* <Image
              src="/boba.png"
              alt={item.item_name}
              width={100}
              height={100}
              className="mb-4"
            /> */}
            <div className="h-20 w-full flex items-center justify-center">
              <div className="text-3xl">{getProductEmojis(item.item_name)}</div>
            </div>
            <h2 className="text-lg font-semibold text-[#b79c85]">
              {item.item_name}
            </h2>
            <p className="text-[#b79c85] mb-2">${item.price.toFixed(2)}</p>
            <p className="text-sm italic text-[#b79c85] text-center mt-1">
              {item.ingredients.join(", ")}
            </p>
          </div>
        ))}
      </div>


    </div>
  );
}
