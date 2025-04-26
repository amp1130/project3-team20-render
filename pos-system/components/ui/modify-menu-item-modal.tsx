"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ModifyMenuItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    itemId?: number;
    currentPrice?: number;
}

export function ModifyMenuItemModal({
    isOpen,
    onClose,
    onSuccess,
    itemId,
    currentPrice
}: ModifyMenuItemModalProps) {
    const [localItemId, setLocalItemId] = useState(itemId?.toString() || "");
    const [price, setPrice] = useState(currentPrice?.toString() || "");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
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
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose]);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        const newPrice = parseFloat(price);
        const itemIdNumber = parseInt(localItemId, 10);

        if (isNaN(itemIdNumber) || itemIdNumber < 1 || isNaN(newPrice) || newPrice <= 0) {
            setError("Invalid menu ID or price");
            return;
        }
        setIsSubmitting(true);

        try {
            const response = await fetch("/api/menu-items/modify", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ menu_id: itemIdNumber, price: newPrice }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to modify price");
            }
            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${
                isOpen ? "block" : "hidden"
            }`}
        >
            <div ref={modalRef} className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                    <X className="h-5 w-5" />
                </button>
                <h2 className="text-xl font-bold text-[#3c2f1f] mb-4">Modify Price</h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="itemId" className="block text-sm font-medium text-[#5c4f42] mb-1">
                                Menu ID
                            </label>
                            <input
                                type="number"
                                id="itemId"
                                value={localItemId}
                                onChange={(e) => setLocalItemId(e.target.value)}
                                className="w-full rounded-md border border-[#d4c8bc] bg-white py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#a67c52]"
                            />
                        </div>
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-[#5c4f42] mb-1">
                                New Price
                            </label>
                            <input
                                ref={firstInputRef}
                                type="number"
                                id="price"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="w-full rounded-md border border-[#d4c8bc] bg-white py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#a67c52]"
                                step="0.01"
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="border-[#d4c8bc] text-[#5c4f42]"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-[#5c4f42] hover:bg-[#3c2f1f] text-white"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Modifying..." : "Modify"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}