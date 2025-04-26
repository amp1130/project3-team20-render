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
  const [translateVisible, setTranslateVisible] = useState(false);
  const translateRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Function to reset and fully reinitialize the translate functionality
  const resetTranslateWidget = () => {
    // Remove existing widget components
    const existingIframe = document.querySelector("iframe.goog-te-menu-frame") as HTMLIFrameElement;
    if (existingIframe) {
      existingIframe.remove();
    }
    
    const gtBanner = document.getElementById(":1.container");
    if (gtBanner) {
      gtBanner.remove();
    }

    // Clear the translate element
    const translateElement = document.getElementById("google-translate-element");
    if (translateElement) {
      translateElement.innerHTML = '';
    }

    // Remove and reload the script completely
    const existingScript = document.querySelector('script[src*="translate.google.com"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Load script fresh
    loadGoogleTranslateScript();
  };

  // Function to handle translate button click
  const handleTranslateClick = () => {
    const iframe = document.querySelector("iframe.goog-te-menu-frame") as HTMLIFrameElement;
    
    if (!iframe || !scriptLoaded) {
      resetTranslateWidget();
      // Set visibility to true for when it loads
      setTranslateVisible(true);
      return;
    }

    // If iframe exists, toggle visibility
    iframe.style.display = translateVisible ? "none" : "block";
    setTranslateVisible(!translateVisible);
  };

  // Function to load the Google Translate script
  const loadGoogleTranslateScript = () => {
    // Make sure we don't add the script if it's already loading
    if (document.querySelector('script[src*="translate.google.com"]')) {
      return;
    }
    
    // Create the script element
    const googleTranslateScript = document.createElement("script");
    googleTranslateScript.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    googleTranslateScript.async = true;
    
    // Define the init function
    (window as any).googleTranslateElementInit = function () {
      const googleObj = (window as any).google;
      if (googleObj && 
          googleObj.translate && 
          googleObj.translate.TranslateElement) {
        
        try {
          new googleObj.translate.TranslateElement(
            {
              pageLanguage: "en",
              autoDisplay: false,
              layout: googleObj.translate.TranslateElement.InlineLayout ? 
                googleObj.translate.TranslateElement.InlineLayout.VERTICAL : undefined
            },
            "google-translate-element"
          );
          setScriptLoaded(true);
          
          // Hide iframe by default
          setTimeout(() => {
            const iframe = document.querySelector("iframe.goog-te-menu-frame") as HTMLIFrameElement;
            if (iframe) {
              iframe.style.display = "none";
            }
          }, 300);
        } catch (e) {
          console.error("Error initializing Google Translate:", e);
        }
      }
    };
    
    // Append script to document
    document.body.appendChild(googleTranslateScript);
  };

  // Initial setup
  useEffect(() => {
    // Add custom CSS for Google Translate widget
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

    // Initialize translation
    loadGoogleTranslateScript();

    // Cleanup
    return () => {
      document.head.removeChild(styleElement);
      setTranslateVisible(false);
    };
  }, []);

  // Effect for reinitializing on navigation
  useEffect(() => {
    // Function to run after navigation
    const handleRouteChange = () => {
      // Reset translate visibility
      setTranslateVisible(false);
      
      // Short delay to let the DOM update
      setTimeout(() => {
        // Try to reset and reinitialize the widget
        resetTranslateWidget();
      }, 200);
    };

    // Listen for navigation events
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
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
          <div id="google-translate-element" className="absolute inset-0 z-0" />
        </div>
      </div>
    </div>
  );
}


