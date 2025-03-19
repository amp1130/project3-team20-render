"use client";

import { Search } from "lucide-react";
import { useState } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  return (
    <div className="relative w-full sm:w-auto sm:min-w-[300px] sm:flex-grow-0">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-[#8c7b6b]" />
      </div>
      <input
        type="text"
        placeholder="Search menu items..."
        className="pl-10 w-full rounded-md border border-[#d4c8bc] bg-white py-2 px-3 text-sm placeholder:text-[#a89585] focus:outline-none focus:ring-2 focus:ring-[#a67c52] focus:border-[#a67c52]"
        value={searchQuery}
        onChange={handleSearch}
      />
    </div>
  );
} 