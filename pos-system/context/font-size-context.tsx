"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";


interface FontSizeContextType {
  isLarge: boolean;
  changeFontSize: () => void;
}

const FontSizeContextType = createContext<FontSizeContextType | undefined>(undefined);

export const FontSizeProvider = ({ children }: { children: ReactNode }) => {
  const [isLarge, setSize] = useState<boolean>(false);

  // Load saved size from localStorage or system preference
  useEffect(() => {
    const savedSize = localStorage.getItem("largeFont");
    if (savedSize !== null) {
      const isLarge = savedSize === "true";
      setSize(isLarge);
      document.documentElement.classList.toggle("largeFont", isLarge);
    }
    
    if (savedSize) {
      setSize(savedSize === "true");
      document.documentElement.classList.toggle("largeFont", savedSize === "true");
    } else {
      const prefersLarge = window.matchMedia("(prefers-large-dont: true)").matches;
      setSize(prefersLarge);
      document.documentElement.classList.toggle("largeFont", prefersLarge);
    }
  }, []);

  // Toggle size and update <html> class + localStorage
  const changeFontSize = () => {
    const newSize = !isLarge;
    setSize(newSize);
    document.documentElement.classList.toggle("largeFont", newSize === true);
    localStorage.setItem("largeFont", newSize.toString());
  };

  return (
    <FontSizeContextType.Provider value={{ isLarge, changeFontSize }}>
      {children}
    </FontSizeContextType.Provider>
  );
};

// Hook for easy usage in components
export const useFont = () => {
  const context = useContext(FontSizeContextType);
  if (!context) {
    throw new Error("useFont must be used within a FontSizeProvider");
  }
  return context;
};
