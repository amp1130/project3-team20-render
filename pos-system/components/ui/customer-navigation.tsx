'use client';

import { ArrowLeft, Moon, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { WeatherDisplay } from "./weather-display";
import { useTheme } from "@/context/theme-context";

export function CustomerNavigation() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === "dark";

  return (
    <div
      className={`fixed top-0 left-0 right-0 flex items-center p-4 z-10 border-b ${
        isDark
          ? "bg-[#1c1c1c] border-gray-700 text-white"
          : "bg-card/80 border-gray-300 text-[#3c2f1f]"
      } backdrop-blur-sm`}
    >
      {/* Back Button */}
      <button
        onClick={() => router.push('/')}
        className={`mr-4 p-2 rounded transition ${
          isDark
            ? "hover:bg-gray-700 text-white"
            : "hover:bg-[#e6ded5] text-[#3c2f1f]"
        }`}
        aria-label="Go Back"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      {/* Logo */}
      <Image
        src="/logo.png"
        alt="Logo"
        width={56}
        height={56}
        className="mr-12"
        style={{ filter: isDark ? "brightness(0) invert(1)" : "none" }}
      />

      {/* Weather */}
      <div className="ml-auto">
        <WeatherDisplay />
      </div>

      {/* Dark Mode Toggle */}
      <button
        onClick={toggleTheme}
        className={`ml-4 p-2 rounded-full border transition ${
          isDark
            ? "border-gray-500 hover:bg-gray-700"
            : "border-[#d4c8bc] hover:bg-[#e6ded5]"
        }`}
        aria-label="Toggle Dark Mode"
      >
        {isDark ? (
          <Sun className="h-5 w-5 text-white" />
        ) : (
          <Moon className="h-5 w-5 text-[#3c2f1f]" />
        )}
      </button>
    </div>
  );
}


