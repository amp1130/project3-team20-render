"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useTheme } from "@/context/theme-context"; // 👈 import theme

interface OrderItem {
  id: number;
  item_name: string;
  price: number;
  quantity: number;
  menu_id: number;
}

interface AddOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderItems: OrderItem[];
  total: number;
  employeeId: number | string;
  onSuccess: () => void;
}

export function AddOrderModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  orderItems, 
  total, 
  employeeId 
}: AddOrderModalProps) {
  const [tipAmount, setTipAmount] = useState(0);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { theme } = useTheme(); // 👈 get theme

  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  useEffect(() => {
    function handleEscKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    if (isOpen) document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [isOpen, onClose]);

  const resetForm = () => {
    setTipAmount(0);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isNaN(tipAmount) || tipAmount < 0) {
      setError("Tip must be a valid non-negative number");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: Date.now(),
          employee_id: employeeId,
          total_amount: total + tipAmount,
          tip_amount: tipAmount,
          items: orderItems.map((item) => ({
            item_id: item.id,
            quantity: item.quantity,
            menu_id: item.menu_id,
          })),
        }),
      });

      if (!response.ok) throw new Error("Failed to submit order");

      resetForm();
      onSuccess();
      router.push("/order-success");
    } catch (error) {
      console.error("Error submitting order:", error);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isDark = theme === "dark";
  const panelClasses = isDark ? "bg-[#1e1e1e] text-white border-gray-600" : "bg-white text-[#3c2f1f] border-[#e6ded5]";
  const inputClasses = isDark
    ? "bg-[#2a2a2a] border-gray-600 placeholder-gray-400 text-white focus:ring-gray-400 focus:border-gray-400"
    : "bg-white border-[#d4c8bc] placeholder-[#a89585] text-[#3c2f1f] focus:ring-[#a67c52] focus:border-[#a67c52]";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div ref={modalRef} className={`rounded-lg shadow-lg w-full max-w-md p-6 relative border ${panelClasses}`}>
        <Button onClick={onClose} variant="link" className="absolute top-4 right-4 text-gray-400 hover:text-gray-200">
          <X className="h-5 w-5" />
        </Button>

        <h2 className="text-xl font-bold mb-4">Confirm Order</h2>

        <ul className="mb-4">
          {orderItems.map((item) => (
            <li key={`${item.menu_id}-${item.quantity}`} className="flex justify-between text-sm">
              <span>{item.item_name} x {item.quantity}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>

        <div className="flex justify-between font-bold mb-4">
          <span>Subtotal</span>
          <span>${total.toFixed(2)}</span>
        </div>

        <div>
          <label htmlFor="tip-amount" className="block text-sm font-medium mb-1">
            Tip Amount
          </label>
          <input
            ref={firstInputRef}
            type="number"
            id="tip-amount"
            value={tipAmount === 0 ? "" : tipAmount}
            onChange={(e) => {
              const value = e.target.value;
              setTipAmount(value === "" ? 0 : parseFloat(value));
            }}
            className={`w-full rounded-md border py-2 px-3 text-sm focus:outline-none ${inputClasses}`}
            placeholder="Enter tip amount"
            step="0.01"
          />
        </div>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        <div className="flex justify-end space-x-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              resetForm();
              onClose();
            }}
            className={isDark ? "border-gray-600 text-white hover:bg-[#2a2a2a]" : "border-[#d4c8bc] text-[#5c4f42]"}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            className={isDark ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-[#5c4f42] hover:bg-[#3c2f1f] text-white"}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Confirm Order"}
          </Button>
        </div>
      </div>
    </div>
  );
}
