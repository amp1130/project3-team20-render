"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Search, Mic } from "lucide-react";
import { useState, useRef } from "react";
import { useTheme } from "@/context/theme-context";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Your browser does not support speech recognition.");
      return;
    }

    inputRef.current?.focus();

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      onSearch(transcript);
    };
    recognition.onerror = (event: any) => {
      if (event.error === "no-speech") return;
      console.error("Speech recognition error:", event.error, event.message);
      alert(`Speech recognition error: ${event.error}`);
    };
    recognition.start();
  };

  const iconColor = theme === "dark" ? "#A9A9A9" : "#8c7b6b";
  const inputStyle =
    theme === "dark"
      ? "border border-gray-600 bg-[#2a2a2a] text-[#A9A9A9] placeholder-[#A9A9A9] focus:ring-gray-400 focus:border-gray-400"
      : "border border-[#d4c8bc] bg-white text-sm placeholder:text-[#a89585] focus:ring-[#a67c52] focus:border-[#a67c52]";

  return (
    <div className="relative w-full sm:w-auto sm:min-w-[320px] sm:flex-grow-0">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5" style={{ color: iconColor }} />
      </div>
      <input
        ref={inputRef}
        type="text"
        placeholder="Search menu items..."
        className={`pl-10 pr-10 w-full rounded-md py-2 px-3 focus:outline-none focus:ring-2 ${inputStyle}`}
        value={searchQuery}
        onChange={handleSearch}
      />
      <button
        type="button"
        onClick={handleVoiceInput}
        className="absolute inset-y-0 right-0 pr-3 flex items-center"
      >
        <Mic className="h-5 w-5" style={{ color: iconColor }} />
      </button>
    </div>
  );
}
