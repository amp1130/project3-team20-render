'use client';
import React, { createContext, useContext, useState } from "react";

const MagnifierContext = createContext<{
  isEnabled: boolean;
  toggleMagnifier: () => void;
}>({
  isEnabled: false,
  toggleMagnifier: () => {},
});

export const MagnifierProvider = ({ children }: { children: React.ReactNode }) => {
  const [isEnabled, setIsEnabled] = useState(false);

  const toggleMagnifier = () => setIsEnabled((prev) => !prev);

  return (
    <MagnifierContext.Provider value={{ isEnabled, toggleMagnifier }}>
      {children}
    </MagnifierContext.Provider>
  );
};

export const useMagnifier = () => useContext(MagnifierContext);
