"use client";

import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useTheme } from "@/context/theme-context";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message 
}: ConfirmationModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div 
        ref={modalRef}
        className={`rounded-lg shadow-lg w-full max-w-md p-6 relative ${
          isDark ? "bg-[#1e1e1e] text-white" : "bg-white text-[#3c2f1f]"
        }`}
      >
        <button 
          onClick={onClose}
          className={`absolute top-4 right-4 transition ${
            isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <X className="h-5 w-5" />
        </button>
        
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <p className="mb-6">{message}</p>
        
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className={`${
              isDark
                ? "text-white border-gray-600 hover:bg-gray-700"
                : "text-[#5c4f42] border-[#d4c8bc] hover:bg-[#e6ded5]"
            }`}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`${
              isDark
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-[#5c4f42] hover:bg-[#3c2f1f] text-white"
            }`}
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}
