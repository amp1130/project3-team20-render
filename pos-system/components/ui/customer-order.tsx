"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import Image from "next/image";
import { AddOrderModal } from "@/components/ui/add-order-modal";
import { ToppingModal } from "@/components/ui/topping-modal";
import { useTheme } from "@/context/theme-context";
import { NutritionPopup } from "@/components/ui/NutritionPopup";

export type OrderItem = {
  id: number;
  item_name: string;
  price: number;
  quantity: number;
  menu_id: number;
  toppings?: string[];
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
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [isToppingModalOpen, setIsToppingModalOpen] = useState(false);
  const [pendingItem, setPendingItem] = useState<OrderItem | null>(null);
  const { theme } = useTheme();

  const [isNutritionOpen, setIsNutritionOpen] = useState(false);
  const [pendingToppings, setPendingToppings] = useState<string[]>([]);
  const [nutritionInfo, setNutritionInfo] = useState({
    calories: 0,
    sugar: 0,
    toppings: [] as string[],  
  });
  

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
    if (newQuantity === 0) return removeItem(orderItemId);

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

  const handleAddToOrder = (item: OrderItem) => {
    setPendingItem(item);
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

  const confirmToppings = async (toppings: string[]) => {
    if (pendingItem?.menu_id) {
      try {
        const filteredToppings = toppings.filter(
          (t) => !["Less Ice", "Extra Ice", "Less Sugar", "Extra Sugar"].includes(t)
        );
  
        setPendingToppings(toppings); // full list for cart
        setIsToppingModalOpen(false);
  
        const res = await fetch(`/api/nutrition?menuId=${pendingItem.menu_id}`);
        if (!res.ok) throw new Error("Nutrition fetch failed");
  
        const data = await res.json();
        setNutritionInfo({
          calories: data.calories,
          sugar: data.sugar,
          toppings: filteredToppings, // filtered for nutrition popup
        });
  
        setIsNutritionOpen(true);
      } catch (err) {
        console.error("Failed to fetch nutrition:", err);
        setNutritionInfo({ calories: 0, sugar: 0, toppings: [] });
        setIsNutritionOpen(true);
      }
    }
  };
  
  
  
  

  const handleNutritionContinue = () => {
    if (pendingItem) {
      addItem({ ...pendingItem, toppings: pendingToppings });
      setPendingItem(null);
      setPendingToppings([]);
      setIsNutritionOpen(false);
    }
  };

  const bgClass = theme === "dark" ? "bg-[#2a2a2a]" : "bg-white";
  const panelClass = theme === "dark" ? "bg-[#1e1e1e] text-white" : "bg-[#f8f5f2] text-[#3c2f1f]";
  const textClass = theme === "dark" ? "text-gray-200" : "text-[#5c4f42]";
  const borderClass = theme === "dark" ? "border-gray-600" : "border-[#e6ded5]";
  const accentText = theme === "dark" ? "text-white" : "text-[#3c2f1f]";
  const removeButtonClass = theme === "dark" ? "text-gray-400 hover:text-red-400" : "text-[#a67c52] hover:text-[#8c6542]";

  return (
    <>
      <div className={`w-80 border-l ${borderClass} ${bgClass} flex flex-col`}>
        <h2 className={`text-xl font-bold ${accentText} p-4 pb-2`}>Current Order</h2>
        <div className="flex-1 overflow-y-auto p-4 pt-2">
          <div className="space-y-3">
            {orderItems.length > 0 ? (
              orderItems.map((item) => (
                <div key={item.orderItemId} className={`flex items-start ${panelClass} p-2 rounded-md`}>
                  <div className="flex-shrink-0 w-10 h-10 bg-white rounded-md mr-2 flex items-center justify-center">
                    <Image src="/boba.png" alt={item.item_name} width={30} height={30} style={{ objectFit: "contain" }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <span className={`font-medium ${accentText} text-sm`}>{item.item_name}</span>
                        {item.toppings && item.toppings.length > 0 && (
                          <p className={`text-xs italic ${theme === "dark" ? "text-gray-400" : "text-[#8c7b6b]"}`}>
                            {item.toppings.join(", ")}
                          </p>
                        )}
                      </div>
                      <span className={`${textClass} text-sm`}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => updateItemQuantity(item.orderItemId!, item.quantity - 1)} className={`${textClass} text-xl`}>-</button>
                        <span className="text-[#8c7b6b] text-xs">{item.quantity}</span>
                        <button onClick={() => updateItemQuantity(item.orderItemId!, item.quantity + 1)} className={`${textClass} text-xl`}>+</button>
                      </div>
                      <button onClick={() => removeItem(item.orderItemId!)} className={removeButtonClass}>
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className={`text-center py-8 ${theme === "dark" ? "text-gray-400" : "text-[#8c7b6b]"}`}>No items in your order yet.</p>
            )}
          </div>
        </div>

        <div className={`p-4 border-t ${borderClass}`}>
          <div className="flex justify-between mb-2"><span className={textClass}>Subtotal</span><span className={textClass}>${subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between mb-2"><span className={textClass}>Tax</span><span className={textClass}>${tax.toFixed(2)}</span></div>
          <div className="flex justify-between mb-2"><span className={textClass}>Tip</span><span className={textClass}>${tipAmount.toFixed(2)}</span></div>
          <div className="flex justify-between font-bold mb-4"><span className={accentText}>Total</span><span className={accentText}>${total.toFixed(2)}</span></div>

          <Button
            className={`w-full transition ${theme === "dark" ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-[#5c4f42] hover:bg-[#3c2f1f] text-white"}`}
            disabled={orderItems.length === 0}
            onClick={() => {
              const randomId = Math.floor(Math.random() * 10) + 1;
              setEmployeeId(randomId);
              setIsCheckoutOpen(true);
            }}
          >
            Checkout
          </Button>
        </div>

        <AddOrderModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          orderItems={orderItems}
          total={total}
          employeeId={employeeId ?? 0}
          onSuccess={() => {
            setOrderItems([]);
            setIsCheckoutOpen(false);
          }}
        />
      </div>

      <ToppingModal
        isOpen={isToppingModalOpen}
        onClose={() => setIsToppingModalOpen(false)}
        onConfirm={confirmToppings}
      />

      <NutritionPopup
        isOpen={isNutritionOpen}
        onClose={() => setIsNutritionOpen(false)}
        onContinue={handleNutritionContinue}
        menuId={pendingItem?.menu_id}
        toppings={nutritionInfo.toppings}
      />

    </>
  );
}




