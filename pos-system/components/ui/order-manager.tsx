"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import Image from "next/image";
import { AddOrderModal } from "@/components/ui/add-order-modal";

export type OrderItem = {
  id: number;
  item_name: string;
  price: number;
  quantity: number;
  menu_id: number;
  orderItemId?: string;
};

interface OrderManagerProps {
  initialItems?: OrderItem[];
}

export function OrderManager({ initialItems = [] }: OrderManagerProps) {
  const [orderItems, setOrderItems] = useState<OrderItem[]>(initialItems);
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [tipAmount] = useState(0);
  const [total, setTotal] = useState(0);
  const [orderItemCounter, setOrderItemCounter] = useState(0);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  // Employee ID state
  const [employeeId, setEmployeeId] = useState<string>('');
  const [isEmployeeIdConfirmed, setIsEmployeeIdConfirmed] = useState(false);
  const [employeeIdInput, setEmployeeIdInput] = useState('');

  // Calculate totals whenever order items or tip changes
  useEffect(() => {
    const newSubtotal = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const newTax = newSubtotal * 0.0825;
    const newTotal = newSubtotal + newTax + tipAmount;

    setSubtotal(newSubtotal);
    setTax(newTax);
    setTotal(newTotal);
  }, [orderItems, tipAmount]);

  // Add item to order
  const addItem = (item: OrderItem) => {
    console.log("Adding item:", item);
    
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

  // Handle employee ID confirmation
  const handleEmployeeIdConfirm = () => {
    if (employeeIdInput.trim() !== '') {
      setEmployeeId(employeeIdInput);
      setIsEmployeeIdConfirmed(true);
    }
  };

  // Reset employee ID
  const handleEmployeeIdReset = () => {
    setEmployeeId('');
    setIsEmployeeIdConfirmed(false);
    setEmployeeIdInput('');
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
      {/* Employee ID Section - Added at the top */}
      <div className="p-4 border-b border-[#e6ded5]">
        <div className="flex items-center space-x-2">
          {!isEmployeeIdConfirmed ? (
            <>
              <input 
                type="text" 
                placeholder="Enter Employee ID" 
                value={employeeIdInput}
                onChange={(e) => setEmployeeIdInput(e.target.value)}
                className="flex-1 p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#5c4f42]"
              />
              <button 
                onClick={handleEmployeeIdConfirm}
                className="bg-[#5c4f42] text-white p-2 rounded-md hover:bg-[#3c2f1f]"
              >
                <Check className="h-5 w-5" />
              </button>
            </>
          ) : (
            <div className="flex-1 flex justify-between items-center">
              <span className="text-[#5c4f42] font-medium">Employee ID: {employeeId}</span>
              <button 
                onClick={handleEmployeeIdReset}
                className="text-[#a67c52] hover:text-[#8c6542]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      <h2 className="text-xl font-bold text-[#5c4f42] p-4 pb-2">Current Order</h2>
      
      {/* Rest of the component remains the same */}
      <div className="flex-1 overflow-y-auto p-4 pt-2">
        <div className="space-y-3">
          {orderItems.length > 0 ? (
            orderItems.map((item) => (
              <div key={item.orderItemId} className="flex items-start bg-[#f8f5f2] p-2 rounded-md">
                <div className="flex-shrink-0 w-10 h-10 bg-white rounded-md mr-2 flex items-center justify-center">
                  <Image
                    src="/boba.png"
                    alt={item.item_name}
                    width={30}
                    height={30}
                    style={{ objectFit: "contain" }}
                  />
                </div>
                
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
          disabled={orderItems.length === 0 || !isEmployeeIdConfirmed}
          onClick={() => setIsCheckoutOpen(true)}
        >
          Checkout
        </Button>
      </div>

      <AddOrderModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)}
        orderItems={orderItems}
        total={total}
        employeeId={employeeId}
        onSuccess={() => {
          setOrderItems([]); 
          setIsCheckoutOpen(false);
        }}
      />
    </div>
  );
}