"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface ManagerContextType {
  isManagerMode: boolean;
  setManagerMode: (value: boolean) => void;
}

const ManagerContext = createContext<ManagerContextType | undefined>(undefined);

export function ManagerProvider({ children }: { children: ReactNode }) {
  const [isManagerMode, setIsManagerMode] = useState(false);

  const setManagerMode = (value: boolean) => {
    setIsManagerMode(value);
  };

  return (
    <ManagerContext.Provider value={{ isManagerMode, setManagerMode }}>
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