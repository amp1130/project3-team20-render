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
import { useEffect } from "react";

export function CustomerNavigation() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { isLarge, changeFontSize } = useFont();
  const { toggleMagnifier } = useMagnifier();
  const isDark = theme === "dark";

  // --- Initial setup ---
  useEffect(() => {
    // Add custom CSS for Google Translate
    const styleElement = document.createElement("style");
    styleElement.textContent = `
      .goog-te-menu-frame.skiptranslate {
        position: absolute !important;
        top: 48px !important;
        right: 12px !important;
        width: 80vw !important;
        height: 200px !important;
        overflow-x: auto !important;
        overflow-y: hidden !important;
        border: 1px solid #ccc !important;
        z-index: 9999 !important;
        background-color: white !important;
      }
      .goog-te-menu2 {
        white-space: nowrap !important;
        width: 100% !important;
      }
      .goog-te-menu2-item {
        display: inline-block !important;
        margin: 0 8px !important;
      }
      #google-translate-element {
        position: absolute;
        height: 100%;
        width: 100%;
        opacity: 0;
      }
      .VIpgJd-ZVi9od-l4eHX-hSRGPd, .skiptranslate.goog-te-gadget {
        font-size: 0px !important;
      }
      .VIpgJd-ZVi9od-l4eHX-hSRGPd div {
        display: none !important;
      }
    `;
    document.head.appendChild(styleElement);

    const initializeTranslate = () => {
      if ((window as any).google && (window as any).google.translate && (window as any).google.translate.TranslateElement) {
        new (window as any).google.translate.TranslateElement(
          {
            pageLanguage: "en",
            layout: (window as any).google.translate.TranslateElement.InlineLayout.VERTICAL,
            autoDisplay: true,
          },
          "google-translate-element"
        );
      }
    };

    if (document.querySelector('script[src*="translate.google.com"]')) {
      initializeTranslate();
    } else {
      const googleTranslateScript = document.createElement("script");
      googleTranslateScript.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      googleTranslateScript.async = true;
      document.body.appendChild(googleTranslateScript);

      (window as any).googleTranslateElementInit = initializeTranslate;
    }

    return () => {
      document.head.removeChild(styleElement);
      const translateElement = document.getElementById("google-translate-element");
      if (translateElement) {
        translateElement.innerHTML = "";
      }
    };
  }, []);

  // --- Reinitialize on navigation ---
  useEffect(() => {
    const reinitializeTranslate = () => {
      if ((window as any).google && (window as any).google.translate && (window as any).google.translate.TranslateElement) {
        new (window as any).google.translate.TranslateElement(
          {
            pageLanguage: "en",
            layout: (window as any).google.translate.TranslateElement.InlineLayout.VERTICAL,
            autoDisplay: true,
          },
          "google-translate-element"
        );
      }
    };

    const handleRouteChange = () => {
      setTimeout(() => {
        const translateElement = document.getElementById("google-translate-element");
        if (translateElement) {
          translateElement.innerHTML = "";
        }
        reinitializeTranslate();
      }, 200);
    };

    window.addEventListener("popstate", handleRouteChange);

    return () => {
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, []);

  // --- UI ---
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
          className={`p-2 rounded-full border relative cursor-pointer transition ${
            isDark ? "border-gray-500 hover:bg-gray-700" : "border-[#d4c8bc] hover:bg-[#e6ded5]"
          }`}
          aria-label="Translate"
        >
          <Globe className="h-5 w-5 z-10" />
          <div id="google-translate-element" className="absolute inset-0 z-0" />
        </div>
      </div>
    </div>
  );
}



