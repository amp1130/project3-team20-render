"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface DeleteMenuItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function DeleteMenuItemModal({ isOpen, onClose, onSuccess }: DeleteMenuItemModalProps) {
    const [itemId, setItemId] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const modalRef = useRef<HTMLDivElement>(null);
    const firstInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        console.log("DeleteMenuItemModal isOpen:", isOpen);
    }, [isOpen]);

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
        setItemId("");
        setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        
        // Validate input
        if (!itemId) {
            setError("Menu item ID is required");
            return;
        }

        // Validate numeric field
        const idNum = parseInt(itemId);

        if (isNaN(idNum) || idNum <= 0) {
            setError("Item ID must be a positive number");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/menu-items/delete', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    menu_id: idNum,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to delete menu item");
            }

            resetForm();
            onSuccess();
        } catch (error) {
            console.error("Error deleting menu item:", error);
            setError(error instanceof Error ? error.message : "An unknown error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Even if not open, render the component but with conditional visibility
    return (
        <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${isOpen ? 'block' : 'hidden'}`}>
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
                
                <h2 className="text-xl font-bold text-[#3c2f1f] mb-4">Delete Menu Item</h2>
                
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="item-id" className="block text-sm font-medium text-[#5c4f42] mb-1">
                                Menu Item ID
                            </label>
                            <input
                                ref={firstInputRef}
                                type="number"
                                id="item-id"
                                value={itemId}
                                onChange={(e) => setItemId(e.target.value)}
                                className="w-full rounded-md border border-[#d4c8bc] bg-white py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#a67c52] focus:border-[#a67c52]"
                                placeholder="Enter menu item ID to delete"
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
                            {isSubmitting ? "Deleting..." : "Delete Menu Item"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
