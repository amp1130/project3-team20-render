"use client";

import { useState } from "react";
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

// Function to get emojis based on product name
const getProductEmojis = (productName: string): string => {
  const productNameLower = productName.toLowerCase();
  
  // Map specific product names to emojis
  if (productNameLower.includes("taro pearl milk tea")) {
    return "🍠🧋";
  } else if (productNameLower.includes("okinawa pearl milk tea")) {
    return "🗾🧋";
  } else if (productNameLower.includes("matcha red bean milk tea")) {
    return "🍵🫘🧋";
  } else if (productNameLower.includes("classic coffee")) {
    return "☕👍";
  } else if (productNameLower.includes("hawaii fruit tea")) {
    return "🏝️ 🍵 🍎";
  } else if (productNameLower.includes("honey lemonade")) {
    return "🍯 🍋";
  } else if (productNameLower.includes("kiwi fruit tea")) {
    return "🥝 🍵";
  } else if (productNameLower.includes("strawberry tea")) {
    return "🍓 🍵";
  } else if (productNameLower.includes("peach kiwi tea")) {
    return "🍑 🥝 🍵";
  } else if (productNameLower.includes("ginger tea")) {
    return "🫚🍵";
  } else if (productNameLower.includes("ginger milk tea")) {
    return "🫚🧋";
  } else if (productNameLower.includes("matcha milk tea")) {
    return "🍵🥛";
  } else if (productNameLower.includes("wintermelon creama")) {
    return "🍉🍦";
  } else if (productNameLower.includes("mango creama")) {
    return "🥭🍦";
  } else if (productNameLower.includes("handmade taro with fresh milk")) {
    return "🥛🍠";
  } else if (productNameLower.includes("wintermelon with fresh milk")) {
    return "🍉🥛";
  } else if (productNameLower.includes("fresh milk")) {
    return "🥛👪";
  } else if (productNameLower.includes("taro ice blended")) {
    return "🍠🧊";
  } else if (productNameLower.includes("oreo ice blended")) {
    return "🍪🧊";
  } else if (productNameLower.includes("mango ice blended")) {
    return "🥭🧊";
  } else {
    return "🧋"; // Default emoji for other products
  }
};

export function MenuItemCard({ item }: MenuItemCardProps) {
  // @ts-ignore
  const [isHovered, setIsHovered] = useState(false);
  
  const handleAddToOrder = () => {
    // Convert price to number to ensure consistency
    const numericPrice = typeof item.price === 'number' 
      ? item.price 
      : parseFloat(item.price);
    
    // Create order item
    const orderItem: OrderItem = {
      id: item.id,
      item_name: item.item_name,
      menu_id: item.menu_id,
      price: numericPrice,
      quantity: 1
    };
    
    // Call the global addToOrder function
    // @ts-ignore
    if (typeof window.addToOrder === 'function') {
      // @ts-ignore
      window.addToOrder(orderItem);
    }
  };

  const emojis = getProductEmojis(item.item_name);

  return (
    <Card 
      className="overflow-hidden border border-[#d4c8bc] bg-white hover:shadow-md transition-shadow flex flex-col h-full p-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="h-20 w-full flex items-center justify-center bg-[#f2e1d0]">
        <div className="text-3xl">{emojis}</div>
      </div>
      <CardContent className="p-3 pb-1 pt-2 flex-grow">
        <h3 className="font-medium text-[#3c2f1f] text-sm">{item.item_name}</h3>
        <p className="text-[#a67c52] font-bold text-sm mt-1">
          ${typeof item.price === 'number' 
            ? item.price.toFixed(2) 
            : item.price ? parseFloat(item.price).toFixed(2) : "N/A"}
        </p>
      </CardContent>
      <CardFooter className="px-3 pt-0 pb-2">
        <Button 
          className="w-full bg-[#6f4518] hover:bg-[#8c6542] text-white text-xs h-7"
          onClick={handleAddToOrder}
        >
          Add
        </Button>
      </CardFooter>
    </Card>
  );
} 