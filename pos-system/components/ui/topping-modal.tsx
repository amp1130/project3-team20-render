"use client";

import { Dialog } from "@headlessui/react";
import { useState } from "react";
import { Button } from "./button";
import { useTheme } from "@/context/theme-context";

interface ToppingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (toppings: string[]) => void;
}

const otherToppings = [
  "Tapioca Pearls",
  "Lychee Jelly",
  "Aloe Vera",
  "Aiyu Jelly",
  "Cookie Crumbs",
];

export function ToppingModal({ isOpen, onClose, onConfirm }: ToppingModalProps) {
  const [iceLevel, setIceLevel] = useState<string>("Regular");
  const [sugarLevel, setSugarLevel] = useState<string>("Regular");
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const { theme } = useTheme();

  const toggleOtherTopping = (topping: string) => {
    setSelectedToppings((prev) =>
      prev.includes(topping)
        ? prev.filter((t) => t !== topping)
        : [...prev, topping]
    );
  };

  const handleSave = () => {
    const finalToppings = [
      ...(iceLevel !== "Regular" ? [iceLevel] : []),
      ...(sugarLevel !== "Regular" ? [sugarLevel] : []),
      ...selectedToppings,
    ];
    onConfirm(finalToppings);
    setIceLevel("Regular");
    setSugarLevel("Regular");
    setSelectedToppings([]);
    onClose();
  };

  const buttonClasses =
    theme === "dark"
      ? "bg-gray-700 text-white hover:bg-gray-600"
      : "bg-[#b79c85] text-white hover:bg-[#a88a77]";

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen bg-black/30">
        <Dialog.Panel
          className={`rounded-2xl p-6 w-[320px] shadow-xl border ${
            theme === "dark"
              ? "bg-[#1e1e1e] border-gray-700 text-white"
              : "bg-white border-[#e6ded5] text-[#3c2f1f]"
          }`}
        >
          <Dialog.Title className="text-lg font-bold mb-4">Modifications</Dialog.Title>

          {/* Ice Level */}
          <div className="mb-4">
            <div className="font-semibold mb-1">Ice Level</div>
            {["Regular", "Less Ice", "Extra Ice"].map((level) => (
              <label key={level} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="ice"
                  value={level}
                  checked={iceLevel === level}
                  onChange={() => setIceLevel(level)}
                  className="accent-[#5c4f42]"
                />
                <span>{level}</span>
              </label>
            ))}
          </div>

          {/* Sugar Level */}
          <div className="mb-4">
            <div className="font-semibold mb-1">Sugar Level</div>
            {["Regular", "Less Sugar", "Extra Sugar"].map((level) => (
              <label key={level} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="sugar"
                  value={level}
                  checked={sugarLevel === level}
                  onChange={() => setSugarLevel(level)}
                  className="accent-[#5c4f42]"
                />
                <span>{level}</span>
              </label>
            ))}
          </div>

          {/* Other Toppings */}
          <div className="mb-2 font-semibold">Select Toppings</div>
          <div className="space-y-2 mb-4">
            {otherToppings.map((topping) => (
              <label key={topping} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedToppings.includes(topping)}
                  onChange={() => toggleOtherTopping(topping)}
                  className="accent-[#5c4f42]"
                />
                <span>{topping}</span>
              </label>
            ))}
          </div>

          <div className="flex justify-center gap-4 mt-4">
            <Button className={`${buttonClasses} transition`} onClick={onClose}>
              Cancel
            </Button>
            <Button className={`${buttonClasses} transition`} onClick={handleSave}>
              Done
            </Button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}





