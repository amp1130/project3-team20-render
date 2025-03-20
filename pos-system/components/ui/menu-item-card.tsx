"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { OrderItem } from "./order-manager";

interface MenuItemCardProps {
  item: {
    id: number;
    item_name: string;
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

// Function to get random pastel background color
const getBackgroundColor = (): string => {
  // Generate a random pastel color
  const colors = [
    "bg-red-100", "bg-blue-100", "bg-green-100", "bg-yellow-100", 
    "bg-purple-100", "bg-pink-100", "bg-indigo-100", "bg-teal-100",
    "bg-orange-100", "bg-amber-100", "bg-lime-100", "bg-emerald-100",
    "bg-cyan-100", "bg-sky-100", "bg-violet-100", "bg-fuchsia-100"
  ];
  
  // Get a truly random index
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
};

export function MenuItemCard({ item }: MenuItemCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  // Store the random background color in state so it doesn't change on re-renders
  const [backgroundColor] = useState(getBackgroundColor());
  
  const handleAddToOrder = () => {
    // Convert price to number to ensure consistency
    const numericPrice = typeof item.price === 'number' 
      ? item.price 
      : parseFloat(item.price);
    
    // Create order item
    const orderItem: OrderItem = {
      id: item.id,
      item_name: item.item_name,
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
      <div className={`h-20 w-full flex items-center justify-center ${backgroundColor}`}>
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
          className="w-full bg-[#a67c52] hover:bg-[#8c6542] text-white text-xs h-7"
          onClick={handleAddToOrder}
        >
          Add
        </Button>
      </CardFooter>
    </Card>
  );
} 