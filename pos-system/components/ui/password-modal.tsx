"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useTheme } from "@/context/theme-context";

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string) => void;
  error?: string;
}

export function PasswordModal({ isOpen, onClose, onSubmit, error }: PasswordModalProps) {
  const [password, setPassword] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(password);
  };

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

        <h2 className="text-xl font-bold mb-4">Manager Authentication</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="password"
              className={`block text-sm font-medium mb-1 ${
                isDark ? "text-gray-200" : "text-[#5c4f42]"
              }`}
            >
              Enter Manager Password
            </label>
            <input
              ref={inputRef}
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full rounded-md border py-2 px-3 text-sm focus:outline-none focus:ring-2 ${
                isDark
                  ? "bg-[#2c2c2c] border-gray-600 text-white focus:ring-gray-500 focus:border-gray-500"
                  : "bg-white border-[#d4c8bc] text-[#3c2f1f] focus:ring-[#a67c52] focus:border-[#a67c52]"
              }`}
              placeholder="Password"
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className={`${isDark ? "text-white border-gray-600 hover:bg-gray-700" : "border-[#d4c8bc] text-[#5c4f42] hover:bg-[#e6ded5]"}`}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={`${isDark ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-[#5c4f42] hover:bg-[#3c2f1f] text-white"}`}
            >
              Login
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
