"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface ManagerContextType {
  isManagerMode: boolean;
  setManagerMode: (value: boolean) => void;
  isInitialized: boolean;
}

const ManagerContext = createContext<ManagerContextType | undefined>(undefined);

export function ManagerProvider({ children }: { children: ReactNode }) {
  const [isManagerMode, setIsManagerMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load manager mode state from localStorage on initial render
  useEffect(() => {
    // Only run in browser environment
    if (typeof window !== 'undefined') {
      const storedManagerMode = localStorage.getItem('isManagerMode');
      if (storedManagerMode) {
        setIsManagerMode(storedManagerMode === 'true');
      }
      setIsInitialized(true);
    }
  }, []);

  // Save manager mode state to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      localStorage.setItem('isManagerMode', isManagerMode.toString());
    }
  }, [isManagerMode, isInitialized]);

  const setManagerMode = (value: boolean) => {
    setIsManagerMode(value);
  };

  return (
    <ManagerContext.Provider value={{ isManagerMode, setManagerMode, isInitialized }}>
      {children}
    </ManagerContext.Provider>
  );
}

export function useManager() {
  const context = useContext(ManagerContext);
  if (context === undefined) {
    throw new Error("useManager must be used within a ManagerProvider");
  }
  return context;
} 