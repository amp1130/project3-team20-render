"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Image from "next/image";
import { OrderItem } from "./order-manager";

interface MenuItemCardProps {
  item: {
    id: number;
    item_name: string;
    description?: string;
    price: any;
  };
}

export function MenuItemCard({ item }: MenuItemCardProps) {
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

  return (
    <Card className="overflow-hidden border border-[#d4c8bc] bg-white hover:shadow-md transition-shadow flex flex-col h-full p-0">
      <div className="h-20 w-full flex items-center justify-center bg-[#f8f5f2]">
        <Image
          src="/boba.png"
          alt={item.item_name}
          width={50}
          height={50}
          style={{ objectFit: "contain" }}
          className="max-h-16"
        />
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