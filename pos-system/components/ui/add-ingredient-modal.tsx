"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface AddIngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddIngredientModal({ isOpen, onClose, onSuccess }: AddIngredientModalProps) {
  const [ingredientId, setIngredientId] = useState("");
  const [ingredientName, setIngredientName] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [criticalAmount, setCriticalAmount] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Focus first input when modal opens
  useEffect(() => {
    if (isOpen && firstInputRef.current) {
      firstInputRef.current.focus();
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
    setIngredientName("");
    setCurrentAmount("");
    setCriticalAmount("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validate inputs
    if (!ingredientId || !ingredientName || !currentAmount || !criticalAmount) {
      setError("All fields are required");
      return;
    }

    // Validate numeric fields
    const idNum = parseInt(ingredientId);
    const currentNum = parseFloat(currentAmount);
    const criticalNum = parseFloat(criticalAmount);

    if (isNaN(idNum) || idNum <= 0) {
      setError("Ingredient ID must be a positive number");
      return;
    }

    if (isNaN(currentNum) || currentNum < 0) {
      setError("Current amount must be a non-negative number");
      return;
    }

    if (isNaN(criticalNum) || criticalNum < 0) {
      setError("Critical amount must be a non-negative number");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/ingredients/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredient_id: idNum,
          ingredient_name: ingredientName,
          current_amount: currentNum,
          critical_amount: criticalNum,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add ingredient");
      }

      resetForm();
      onSuccess();
    } catch (error) {
      console.error("Error adding ingredient:", error);
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
        
        <h2 className="text-xl font-bold text-[#3c2f1f] mb-4">Add New Ingredient</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="ingredient-id" className="block text-sm font-medium text-[#5c4f42] mb-1">
                Ingredient ID
              </label>
              <input
                ref={firstInputRef}
                type="number"
                id="ingredient-id"
                value={ingredientId}
                onChange={(e) => setIngredientId(e.target.value)}
                className="w-full rounded-md border border-[#d4c8bc] bg-white py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#a67c52] focus:border-[#a67c52]"
                placeholder="Enter ingredient ID"
              />
            </div>
            
            <div>
              <label htmlFor="ingredient-name" className="block text-sm font-medium text-[#5c4f42] mb-1">
                Ingredient Name
              </label>
              <input
                type="text"
                id="ingredient-name"
                value={ingredientName}
                onChange={(e) => setIngredientName(e.target.value)}
                className="w-full rounded-md border border-[#d4c8bc] bg-white py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#a67c52] focus:border-[#a67c52]"
                placeholder="Enter ingredient name"
              />
            </div>
            
            <div>
              <label htmlFor="current-amount" className="block text-sm font-medium text-[#5c4f42] mb-1">
                Current Amount
              </label>
              <input
                type="number"
                id="current-amount"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                className="w-full rounded-md border border-[#d4c8bc] bg-white py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#a67c52] focus:border-[#a67c52]"
                placeholder="Enter current amount"
                step="0.01"
              />
            </div>
            
            <div>
              <label htmlFor="critical-amount" className="block text-sm font-medium text-[#5c4f42] mb-1">
                Critical Amount
              </label>
              <input
                type="number"
                id="critical-amount"
                value={criticalAmount}
                onChange={(e) => setCriticalAmount(e.target.value)}
                className="w-full rounded-md border border-[#d4c8bc] bg-white py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#a67c52] focus:border-[#a67c52]"
                placeholder="Enter critical amount"
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
              {isSubmitting ? "Adding..." : "Add Ingredient"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 