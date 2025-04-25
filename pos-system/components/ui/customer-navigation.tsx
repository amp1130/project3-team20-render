"use client";

import {
  ArrowLeft,
  Moon,
  Sun,
  AArrowUp,
  AArrowDown,
  ZoomIn,
  Globe,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { WeatherDisplay } from "./weather-display";
import { useTheme } from "@/context/theme-context";
import { useFont } from "@/context/font-size-context";
import { useMagnifier } from "@/context/page-magnifier-context";
import { useEffect, useState, useRef } from "react";

export function CustomerNavigation() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { isLarge, changeFontSize } = useFont();
  const { toggleMagnifier } = useMagnifier();
  const isDark = theme === "dark";
  const [isTranslateReady, setIsTranslateReady] = useState(false);
  const [translateVisible, setTranslateVisible] = useState(false);
  const translateRef = useRef<HTMLDivElement>(null);

  const handleTranslateClick = () => {
    const iframe = document.querySelector("iframe.goog-te-menu-frame") as HTMLIFrameElement;
    if (iframe) {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      const menu = iframeDoc?.querySelector(".goog-te-menu2");
      if (menu) {
        iframe.style.display = translateVisible ? "none" : "block";
        setTranslateVisible(!translateVisible);
      }
    }
  };

  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = `
      .goog-te-menu-frame.skiptranslate {
        display: none;
        position: absolute !important;
        top: 48px !important;
        right: 12px !important;
        width: 80vw !important;
        height: 200px !important;
        overflow-x: auto !important;
        overflow-y: hidden !important;
        border: 1px solid #ccc !important;
        z-index: 9999 !important;
      }
      .goog-te-menu2 {
        white-space: nowrap !important;
      }
      .goog-te-menu2-item {
        display: inline-block !important;
        margin: 0 8px !important;
      }
    `;
    document.head.appendChild(styleElement);
  
    // Ensure script is only injected once
    if (!(window as any).googleTranslateScriptAdded) {
      const googleTranslateScript = document.createElement("script");
      googleTranslateScript.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      googleTranslateScript.async = true;
      document.body.appendChild(googleTranslateScript);
      (window as any).googleTranslateScriptAdded = true;
    }
  
    // Ensure init runs even if script already loaded
    (window as any).googleTranslateElementInit = function () {
      if (!(window as any)._translateInitialized) {
        new (window as any).google.translate.TranslateElement(
          {
            pageLanguage: "en",
            layout: (window as any).google.translate.TranslateElement.InlineLayout.VERTICAL,
          },
          "google-translate-element"
        );
        (window as any)._translateInitialized = true;
      }
    };
  
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  

  return (
    <div
      className={`fixed top-0 left-0 right-0 flex items-center justify-between p-4 z-10 border-b ${
        isDark ? "bg-[#1c1c1c] border-gray-700 text-white" : "bg-card/80 border-gray-300 text-[#3c2f1f]"
      } backdrop-blur-sm`}
    >
      {/* Left: Back + Logo */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.push("/")}
          className={`p-2 rounded transition ${
            isDark ? "hover:bg-gray-700 text-white" : "hover:bg-[#e6ded5] text-[#3c2f1f]"
          }`}
          aria-label="Go Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Image
          src="/logo.png"
          alt="Logo"
          width={56}
          height={56}
          style={{ filter: isDark ? "brightness(0) invert(1)" : "none" }}
        />
      </div>

      {/* Center: Weather */}
      <div>
        <WeatherDisplay />
      </div>

      {/* Right: Toggles */}
      <div className="flex items-center space-x-2">
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-full border transition ${
            isDark ? "border-gray-500 hover:bg-gray-700" : "border-[#d4c8bc] hover:bg-[#e6ded5]"
          }`}
          aria-label="Toggle Dark Mode"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5 text-[#3c2f1f]" />}
        </button>

        <button
          onClick={changeFontSize}
          className={`p-2 rounded-full border transition ${
            isDark ? "border-gray-500 hover:bg-gray-700" : "border-[#d4c8bc] hover:bg-[#e6ded5]"
          }`}
          aria-label="Font Size Toggle"
        >
          {isLarge ? <AArrowDown className="h-5 w-5" /> : <AArrowUp className="h-5 w-5" />}
        </button>

        <button
          onClick={toggleMagnifier}
          className={`p-2 rounded-full border transition ${
            isDark ? "border-gray-500 hover:bg-gray-700" : "border-[#d4c8bc] hover:bg-[#e6ded5]"
          }`}
          aria-label="Magnifier"
        >
          <ZoomIn className="h-5 w-5" />
        </button>

        {/* Translate */}
        <div
          ref={translateRef}
          onClick={handleTranslateClick}
          className={`p-2 rounded-full border relative cursor-pointer transition ${
            isDark ? "border-gray-500 hover:bg-gray-700" : "border-[#d4c8bc] hover:bg-[#e6ded5]"
          }`}
          aria-label="Translate"
        >
          <Globe className="h-5 w-5 z-10" />
          <div id="google-translate-element" className="absolute inset-0 opacity-0 z-0" />
        </div>
      </div>
    </div>
  );
}


