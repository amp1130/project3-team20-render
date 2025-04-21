"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import Image from "next/image";
import { AddOrderModal } from "@/components/ui/add-order-modal";
import { ToppingModal } from "@/components/ui/topping-modal";
import { useTheme } from "@/context/theme-context";

export type OrderItem = {
  id: number;
  item_name: string;
  price: number;
  quantity: number;
  menu_id: number;
  orderItemId?: string;
  toppings?: string[];
  discountedPrice?: number;
};

interface OrderManagerProps {
  initialItems?: OrderItem[];
}
function isHappyHour(): boolean {
  const now = new Date();
  const hour = now.getHours();
  return hour >= 14 && hour < 17;
}

export function OrderManager({ initialItems = [] }: OrderManagerProps) {
  const [orderItems, setOrderItems] = useState<OrderItem[]>(initialItems);
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [tipAmount] = useState(0);
  const [total, setTotal] = useState(0);
  const [orderItemCounter, setOrderItemCounter] = useState(0);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState<string>('');
  const [isEmployeeIdConfirmed, setIsEmployeeIdConfirmed] = useState(false);
  const [employeeIdInput, setEmployeeIdInput] = useState('');
  const [isToppingModalOpen, setIsToppingModalOpen] = useState(false);
  const [pendingItem, setPendingItem] = useState<OrderItem | null>(null);
  const [pendingToppings, setPendingToppings] = useState<string[]>([]);
  const { theme } = useTheme();

  useEffect(() => {
    const newSubtotal = orderItems.reduce(
      (sum, item) => sum + (item.discountedPrice ?? item.price) * item.quantity,
      0
    );
    const newTax = newSubtotal * 0.0825;
    const newTotal = newSubtotal + newTax + tipAmount;

    setSubtotal(newSubtotal);
    setTax(newTax);
    setTotal(newTotal);
  }, [orderItems, tipAmount]);

  const addItem = (item: OrderItem) => {
    setOrderItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (orderItem) => orderItem.item_name === item.item_name
      );

      if (existingItemIndex >= 0) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + item.quantity
        };
        return updatedItems;
      } else {
        const orderItemId = `order-item-${Date.now()}-${orderItemCounter}`;
        setOrderItemCounter(prev => prev + 1);
        return [...prevItems, { ...item, orderItemId, menu_id: item.menu_id }];
      }
    });
  };

  const removeItem = (orderItemId: string) => {
    setOrderItems((prevItems) => prevItems.filter((item) => item.orderItemId !== orderItemId));
  };

  const updateItemQuantity = (orderItemId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      return removeItem(orderItemId);
    }

    setOrderItems((prevItems) => {
      const updatedItems = [...prevItems];
      const itemIndex = updatedItems.findIndex(item => item.orderItemId === orderItemId);
      if (itemIndex >= 0) {
        updatedItems[itemIndex] = {
          ...updatedItems[itemIndex],
          quantity: newQuantity
        };
      }
      return updatedItems;
    });
  };

  const handleEmployeeIdConfirm = () => {
    if (employeeIdInput.trim() !== '') {
      setEmployeeId(employeeIdInput);
      setIsEmployeeIdConfirmed(true);
    }
  };

  const handleEmployeeIdReset = () => {
    setEmployeeId('');
    setIsEmployeeIdConfirmed(false);
    setEmployeeIdInput('');
  };

  const handleAddToOrder = (item: OrderItem) => {
    const discountedItem = {
      ...item,
      discountedPrice: isHappyHour() ? Number((item.price * 0.8).toFixed(2)) : undefined,
    };
    setPendingItem(discountedItem);
    setIsToppingModalOpen(true);
  };

  useEffect(() => {
    // @ts-ignore
    window.addToOrder = handleAddToOrder;
    return () => {
      // @ts-ignore
      window.addToOrder = undefined;
    };
  }, []);

  const confirmToppings = (toppings: string[]) => {
    if (pendingItem) {
      addItem({ ...pendingItem, toppings, discountedPrice: pendingItem.discountedPrice });
      setPendingItem(null);
    }
  };

  const bgClass = theme === "dark" ? "bg-[#2a2a2a] text-white" : "bg-white text-[#3c2f1f]";
  const subtextClass = theme === "dark" ? "text-gray-400" : "text-[#8c7b6b]";
  const accentClass = theme === "dark" ? "text-white" : "text-[#3c2f1f]";
  const borderColor = theme === "dark" ? "border-gray-700" : "border-[#e6ded5]";
  const buttonBg = theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-[#5c4f42] hover:bg-[#3c2f1f]";
  const controlColor = theme === "dark" ? "text-gray-200" : "text-[#5c4f42]";
  const iconColor = theme === "dark" ? "text-red-400 hover:text-red-300" : "text-[#a67c52] hover:text-[#8c6542]";

  return (
    <div className={`w-80 border-l ${borderColor} ${bgClass} flex flex-col`}>
      {/* Employee ID Section */}
      <div className={`p-4 border-b ${borderColor}`}>
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
                className={`${buttonBg} text-white p-2 rounded-md`}
              >
                <Check className="h-5 w-5" />
              </button>
            </>
          ) : (
            <div className="flex-1 flex justify-between items-center">
              <span className="font-medium">Employee ID: {employeeId}</span>
              <button 
                onClick={handleEmployeeIdReset}
                className={iconColor}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      <h2 className={`text-xl font-bold p-4 pb-2 ${accentClass}`}>Current Order</h2>
      <div className="flex-1 overflow-y-auto p-4 pt-2">
        <div className="space-y-3">
          {orderItems.length > 0 ? (
            orderItems.map((item) => (
              <div key={item.orderItemId} className={`flex items-start ${bgClass} p-2 rounded-md`}>
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
                    <div>
                      <span className={`font-medium text-sm ${accentClass}`}>{item.item_name}</span>
                      {item.toppings && item.toppings.length > 0 && (
                        <p className={`text-xs italic ${subtextClass}`}>{item.toppings.join(", ")}</p>
                      )}
                    </div>
                    <span className={`text-sm ${controlColor}`}>
                      ${((item.discountedPrice ?? item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => updateItemQuantity(item.orderItemId!, item.quantity - 1)}
                        className={`text-xl ${controlColor}`}
                      >-
                      </button>
                      <span className={`text-xs ${subtextClass}`}>{item.quantity}</span>
                      <button 
                        onClick={() => updateItemQuantity(item.orderItemId!, item.quantity + 1)}
                        className={`text-xl ${controlColor}`}
                      >+
                      </button>
                    </div>
                    <button 
                      onClick={() => removeItem(item.orderItemId!)}
                      className={iconColor}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className={`text-center py-8 ${subtextClass}`}>No items in your order yet.</p>
          )}
        </div>
      </div>

      <div className={`p-4 border-t ${borderColor}`}>
        <div className="flex justify-between mb-2">
          <span className={controlColor}>Subtotal</span>
          <span className={controlColor}>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className={controlColor}>Tax</span>
          <span className={controlColor}>${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className={controlColor}>Tip</span>
          <span className={controlColor}>${tipAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold mb-4">
          <span className={accentClass}>Total</span>
          <span className={accentClass}>${total.toFixed(2)}</span>
        </div>

        <Button 
          className={`w-full ${buttonBg} text-white`}
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
      <ToppingModal
        isOpen={isToppingModalOpen}
        onClose={() => {
          setIsToppingModalOpen(false);
          setPendingItem(null);
        }}
        onConfirm={confirmToppings}
      />
    </div>
  );
}

