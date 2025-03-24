"use client";

import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import Image from "next/image";
import { AddOrderModal } from "@/components/ui/add-order-modal";

export type OrderItem = {
  id: number;
  item_name: string;
  price: number;
  quantity: number;
  menu_id: number;
  orderItemId?: string; // Unique ID for each order item
};

interface OrderManagerProps {
  initialItems?: OrderItem[];
}

export function OrderManager({ initialItems = [] }: OrderManagerProps) {
  const [orderItems, setOrderItems] = useState<OrderItem[]>(initialItems);
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [tipAmount, setTipAmount] = useState(0); // Track tip amount
  const [total, setTotal] = useState(0);
  const [orderItemCounter, setOrderItemCounter] = useState(0);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Calculate totals whenever order items or tip changes
  useEffect(() => {
    const newSubtotal = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const newTax = newSubtotal * 0.0825; // 8.25% tax rate
    const newTotal = newSubtotal + newTax + tipAmount; // Include tip in total calculation

    setSubtotal(newSubtotal);
    setTax(newTax);
    setTotal(newTotal);
  }, [orderItems, tipAmount]); // Include tipAmount in the dependency array

  // Add item to order
  const addItem = (item: OrderItem) => {
    console.log("Adding item:", item); // Debug log
    
    setOrderItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (orderItem) => orderItem.item_name === item.item_name
      );
      
      if (existingItemIndex >= 0) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1
        };
        return updatedItems;
      } else {
        const orderItemId = `order-item-${Date.now()}-${orderItemCounter}`;
        setOrderItemCounter(prev => prev + 1);
        return [...prevItems, { ...item, quantity: 1, orderItemId, menu_id: item.menu_id }];
      }
    });
  };

  // Remove item from order
  const removeItem = (orderItemId: string) => {
    setOrderItems((prevItems) => prevItems.filter((item) => item.orderItemId !== orderItemId));
  };

  // Expose addItem function globally
  useEffect(() => {
    // @ts-ignore
    window.addToOrder = addItem;
    
    return () => {
      // @ts-ignore
      window.addToOrder = undefined;
    };
  }, []);

  return (
    <div className="w-80 border-l border-[#e6ded5] bg-white flex flex-col">
      <h2 className="text-xl font-bold text-[#5c4f42] p-4 pb-2">Current Order</h2>
      
      {/* Order Items List - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 pt-2">
        <div className="space-y-3">
          {orderItems.length > 0 ? (
            orderItems.map((item) => (
              <div key={item.orderItemId} className="flex items-start bg-[#f8f5f2] p-2 rounded-md">
                {/* Item Image */}
                <div className="flex-shrink-0 w-10 h-10 bg-white rounded-md mr-2 flex items-center justify-center">
                  <Image
                    src="/boba.png"
                    alt={item.item_name}
                    width={30}
                    height={30}
                    style={{ objectFit: "contain" }}
                  />
                </div>
                
                {/* Item Details */}
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="font-medium text-[#3c2f1f] text-sm">{item.item_name}</span>
                    <span className="text-[#5c4f42] text-sm">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[#8c7b6b] text-xs">Qty: {item.quantity}</span>
                    <button 
                      onClick={() => removeItem(item.orderItemId!)}
                      className="text-[#a67c52] hover:text-[#8c6542]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-[#8c7b6b] text-center py-8">No items in your order yet.</p>
          )}
        </div>
      </div>
      
      {/* Order Summary - Fixed at bottom */}
      <div className="p-4 border-t border-[#e6ded5]">
        <div className="flex justify-between mb-2">
          <span className="text-[#5c4f42]">Subtotal</span>
          <span className="text-[#5c4f42]">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-[#5c4f42]">Tax</span>
          <span className="text-[#5c4f42]">${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-[#5c4f42]">Tip</span>
          <span className="text-[#5c4f42]">${tipAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold mb-4">
          <span className="text-[#3c2f1f]">Total</span>
          <span className="text-[#3c2f1f]">${total.toFixed(2)}</span>
        </div>
        
        <Button 
          className="w-full bg-[#5c4f42] hover:bg-[#3c2f1f] text-white"
          disabled={orderItems.length === 0}
          onClick={() => setIsCheckoutOpen(true)}
        >
          Checkout
        </Button>
      </div>

      
      {/* AddOrderModal */}
      <AddOrderModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)}
        orderItems={orderItems} // Pass order items to modal
        total={total} // Pass total price including tax and tip
        onSuccess={() => {
          setOrderItems([]); // Clear order on success
          setIsCheckoutOpen(false);
        }}
      />
    </div>
  );
}