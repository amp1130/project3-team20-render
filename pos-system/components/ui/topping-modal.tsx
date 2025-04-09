"use client";
import { Dialog } from "@headlessui/react";
import { useState } from "react";
import { Button } from "./button";

interface ToppingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (toppings: string[]) => void;
}

const availableToppings = [
  "Extra Sugar",
  "Extra Ice",
  "Less Ice",
  "Tapioca Pearls",
  "Cookie Crumbs",
];

export function ToppingModal({ isOpen, onClose, onConfirm }: ToppingModalProps) {
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);

  const toggleTopping = (topping: string) => {
    setSelectedToppings((prev) =>
      prev.includes(topping)
        ? prev.filter((t) => t !== topping)
        : [...prev, topping]
    );
  };

  const handleSave = () => {
    onConfirm(selectedToppings);
    setSelectedToppings([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen bg-black/30">
        <Dialog.Panel className="bg-white rounded-2xl p-6 w-[320px] shadow-xl border border-[#e6ded5]">

          <Dialog.Title className="text-lg font-bold mb-4 text-[#3c2f1f]">Select Toppings</Dialog.Title>
          <div className="space-y-2 mb-4">
            {availableToppings.map((topping) => (
              <label key={topping} className="flex items-center space-x-2 text-[#5c4f42]">
                <input
                  type="checkbox"
                  checked={selectedToppings.includes(topping)}
                  onChange={() => toggleTopping(topping)}
                  className="accent-[#5c4f42]"
                />
                <span>{topping}</span>
              </label>
            ))}
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <Button
                className="bg-[#b79c85] text-white hover:bg-[#a88a77] transition"
                onClick={onClose}
            >
                Cancel
            </Button>
            <Button
                className="bg-[#b79c85] text-white hover:bg-[#a88a77] transition"
                onClick={handleSave}
            >
                Done
            </Button>
          </div>

        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
