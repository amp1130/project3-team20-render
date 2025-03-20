"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface DeleteIngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteIngredientModal({ isOpen, onClose, onSuccess }: DeleteIngredientModalProps) {
  const [ingredientId, setIngredientId] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
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
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validate input
    if (!ingredientId) {
      setError("Ingredient ID is required");
      return;
    }

    // Validate numeric field
    const idNum = parseInt(ingredientId);
    if (isNaN(idNum) || idNum <= 0) {
      setError("Ingredient ID must be a positive number");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/ingredients/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredient_id: idNum,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete ingredient");
      }

      resetForm();
      onSuccess();
    } catch (error) {
      console.error("Error deleting ingredient:", error);
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
        
        <h2 className="text-xl font-bold text-[#3c2f1f] mb-4">Delete Ingredient</h2>
        <p className="text-[#5c4f42] mb-6">
          Please enter the ID of the ingredient you want to delete. This action cannot be undone.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="ingredient-id" className="block text-sm font-medium text-[#5c4f42] mb-1">
                Ingredient ID
              </label>
              <input
                ref={inputRef}
                type="number"
                id="ingredient-id"
                value={ingredientId}
                onChange={(e) => setIngredientId(e.target.value)}
                className="w-full rounded-md border border-[#d4c8bc] bg-white py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#a67c52] focus:border-[#a67c52]"
                placeholder="Enter ingredient ID"
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
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Delete Ingredient"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 