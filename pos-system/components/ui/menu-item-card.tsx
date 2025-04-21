"use client";

import { useState } from "react";
import { useTheme } from "@/context/theme-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { OrderItem } from "./order-manager";

interface MenuItemCardProps {
  item: {
    id: number;
    item_name: string;
    menu_id: number;
    description?: string;
    price: any;
  };
}

function isHappyHour(): boolean {
  const now = new Date();
  const hour = now.getHours();
  return hour >= 14 && hour < 17;
}

export function getProductEmojis(productName: string): string {
  const productNameLower = productName.toLowerCase();
  if (productNameLower.includes("taro pearl milk tea")) return "🍠🧋";
  if (productNameLower.includes("okinawa pearl milk tea")) return "🗾🧋";
  if (productNameLower.includes("matcha red bean milk tea")) return "🍵🫘🧋";
  if (productNameLower.includes("classic coffee")) return "☕👍";
  if (productNameLower.includes("hawaii fruit tea")) return "🏝️ 🍵 🍎";
  if (productNameLower.includes("honey lemonade")) return "🍯 🍋";
  if (productNameLower.includes("kiwi fruit tea")) return "🥝 🍵";
  if (productNameLower.includes("strawberry tea")) return "🍓 🍵";
  if (productNameLower.includes("peach kiwi tea")) return "🍑 🥝 🍵";
  if (productNameLower.includes("ginger tea")) return "🫚🍵";
  if (productNameLower.includes("ginger milk tea")) return "🫚🧋";
  if (productNameLower.includes("matcha milk tea")) return "🍵🥛";
  if (productNameLower.includes("wintermelon creama")) return "🍉🍦";
  if (productNameLower.includes("mango creama")) return "🥭🍦";
  if (productNameLower.includes("handmade taro with fresh milk")) return "🥛🍠";
  if (productNameLower.includes("wintermelon with fresh milk")) return "🍉🥛";
  if (productNameLower.includes("fresh milk")) return "🥛👪";
  if (productNameLower.includes("taro ice blended")) return "🍠🧊";
  if (productNameLower.includes("oreo ice blended")) return "🍪🧊";
  if (productNameLower.includes("mango ice blended")) return "🥭🧊";
  return "🧋";
}

export function MenuItemCard({ item }: MenuItemCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { theme } = useTheme();

  const numericPrice = typeof item.price === "number" ? item.price : parseFloat(item.price);
  const happyHour = isHappyHour();
  const discountedPrice = happyHour ? numericPrice * 0.8 : numericPrice;

  const handleAddToOrder = () => {
    const orderItem: OrderItem = {
      id: item.id,
      item_name: item.item_name,
      menu_id: item.menu_id,
      price: numericPrice,
      quantity: 1,
    };
    // @ts-ignore
    if (typeof window.addToOrder === "function") {
      // @ts-ignore
      window.addToOrder(orderItem);
    }
  };

  const emojis = getProductEmojis(item.item_name);

  return (
    <Card
      className={`overflow-hidden border transition-shadow flex flex-col h-full p-0 ${
        theme === "dark"
          ? "border-gray-600 bg-[#3a3a3a] text-white" 
          : "border-[#d4c8bc] bg-white text-[#3c2f1f]"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`h-20 w-full flex items-center justify-center ${
          theme === "dark" ? "bg-[#4a4a4a]" : "bg-[#f2e1d0]"
        }`}
      >
        <div className="text-3xl">{emojis}</div>
      </div>
      <CardContent className="p-3 pb-1 pt-2 flex-grow">
        <h3 className="font-medium text-sm">{item.item_name}</h3>

        <div className="mt-1 text-sm font-bold">
          {happyHour ? (
            <>
              <span className="line-through mr-1 opacity-70">
                ${numericPrice.toFixed(2)}
              </span>
              <span className="text-green-600">
                ${discountedPrice.toFixed(2)}
              </span>
              <span className="ml-1 text-xs text-green-500 font-normal">(20% off!)</span>
            </>
          ) : (
            <span className={theme === "dark" ? "text-gray-300" : "text-[#a67c52]"}>
              ${numericPrice.toFixed(2)}
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter className="px-3 pt-0 pb-2">
        <Button
          className={`w-full text-white text-xs h-7 ${
            theme === "dark"
              ? "bg-[#5a5a5a] hover:bg-[#777]"
              : "bg-[#6f4518] hover:bg-[#8c6542]"
          }`}
          onClick={handleAddToOrder}
        >
          Add
        </Button>
      </CardFooter>
    </Card>
  );
}
