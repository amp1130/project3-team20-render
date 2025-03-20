"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface Ingredient {
  ingredient_id: number;
  ingredient_name: string;
  current_amount: number;
  critical_amount: number;
}

interface RestockIngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  ingredients: Ingredient[];
}

export function RestockIngredientModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  ingredients 
}: RestockIngredientModalProps) {
  const [ingredientId, setIngredientId] = useState("");
  const [restockAmount, setRestockAmount] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  // Focus select when modal opens
  useEffect(() => {
    if (isOpen && selectRef.current) {
      selectRef.current.focus();
    }
  }, [isOpen]);

  // Handle click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle ESC key to close
  useEffect(() => {
    function handleEscKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
    }
    
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, onClose]);

  const resetForm = () => {
    setIngredientId("");
    setRestockAmount("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validate inputs
    if (!ingredientId) {
      setError("Please select an ingredient");
      return;
    }

    if (!restockAmount) {
      setError("Restock amount is required");
      return;
    }

    // Validate numeric field
    const amountNum = parseFloat(restockAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Restock amount must be a positive number");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/ingredients/restock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredient_id: parseInt(ingredientId),
          restock_amount: amountNum,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to restock ingredient");
      }

      resetForm();
      onSuccess();
    } catch (error) {
      console.error("Error restocking ingredient:", error);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>
        
        <h2 className="text-xl font-bold text-[#3c2f1f] mb-4">Restock Ingredient</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="ingredient-id" className="block text-sm font-medium text-[#5c4f42] mb-1">
                Select Ingredient
              </label>
              <select
                ref={selectRef}
                id="ingredient-id"
                value={ingredientId}
                onChange={(e) => setIngredientId(e.target.value)}
                className="w-full rounded-md border border-[#d4c8bc] bg-white py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#a67c52] focus:border-[#a67c52]"
              >
                <option value="">Select an ingredient</option>
                {ingredients.map((ingredient) => (
                  <option key={ingredient.ingredient_id} value={ingredient.ingredient_id}>
                    {ingredient.ingredient_name} (Current: {ingredient.current_amount})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="restock-amount" className="block text-sm font-medium text-[#5c4f42] mb-1">
                Restock Amount
              </label>
              <input
                type="number"
                id="restock-amount"
                value={restockAmount}
                onChange={(e) => setRestockAmount(e.target.value)}
                className="w-full rounded-md border border-[#d4c8bc] bg-white py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#a67c52] focus:border-[#a67c52]"
                placeholder="Enter amount to add"
                step="0.01"
              />
            </div>
            
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="border-[#d4c8bc] text-[#5c4f42]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#5c4f42] hover:bg-[#3c2f1f] text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Restocking..." : "Restock Ingredient"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 