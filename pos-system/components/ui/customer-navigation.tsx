'use client';

import { ArrowLeft, Moon, Sun, AArrowUp, AArrowDown, ZoomIn } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { WeatherDisplay } from "./weather-display";
import { useTheme } from "@/context/theme-context";
import { useFont } from "@/context/font-size-context";
import { useMagnifier } from "@/context/page-magnifier-context";
import { useEffect } from 'react';

export function CustomerNavigation() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { isLarge, changeFontSize } = useFont();
  const { toggleMagnifier } = useMagnifier();

  const isDark = theme === "dark";

  useEffect(() => {
    // Add Google Translate script
    const googleTranslateScript = document.createElement('script');
    googleTranslateScript.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    googleTranslateScript.async = true;
    document.body.appendChild(googleTranslateScript);

    // Initialize Google Translate
    window.googleTranslateElementInit = function() {
      new (window.google as any).translate.TranslateElement(
        {
          pageLanguage: 'en',
          layout: (window.google as any).translate.TranslateElement.InlineLayout.SIMPLE
        },
        'google-translate-element'
      );
    };

    // Cleanup function
    return () => {
      document.body.removeChild(googleTranslateScript);
      delete window.googleTranslateElementInit;
    };
  }, []);

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

      <button
        onClick={changeFontSize}
        className={`p-2 rounded-full border transition ${isDark ? 'border-gray-500 hover:bg-gray-700' : 'border-[#d4c8bc] hover:bg-[#e6ded5]'}`}
        aria-label="Increase Font Size"
      >
        {isLarge ? (
          <AArrowDown className="h-5 w-5" />
        ) : (
          <AArrowUp className="h-5 w-5" />    
        )}
      </button>

      <button
        onClick={toggleMagnifier}
        className={`p-2 rounded-full border transition ${isDark ? 'border-gray-500 hover:bg-gray-700' : 'border-[#d4c8bc] hover:bg-[#e6ded5]'}`}
        aria-label="Magnifier"
      >
        <ZoomIn className="h-5 w-5" />
      </button>

      {/* Google Translate Widget */}
      <div id="google-translate-element" className="ml-4"></div>

    </div>
  );
}


