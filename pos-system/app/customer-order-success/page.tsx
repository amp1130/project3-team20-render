"use client"; // Enable client-side rendering for this component

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation"; // ADD usePathname
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/theme-context";

export default function OrderSuccess() {
  const router = useRouter();
  const pathname = usePathname(); // Get current path
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Automatically redirect to home after 5 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push("/"); // Navigate to home page
    }, 5000);

    return () => clearTimeout(timeout);
  }, [router]);

  // Corrected Back button behavior
  const handleBackClick = () => {
    if (pathname.startsWith("/order")) {
      window.location.href = "/Order"; // Force reload to Employees page
    } else {
      window.location.href = "/customers"; // Force reload to Customers page
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen text-center ${isDark ? "bg-[#1c1c1c] text-white" : "bg-[#f8f5f2] text-[#3c2f1f]"}`}>
      {/* Confirmation Message */}
      <h1 className="text-3xl font-bold">Order Successful!</h1>
      <p className={`mt-2 ${isDark ? "text-gray-300" : "text-[#5c4f42]"}`}>
        Thank you for your order. It will be prepared shortly.
      </p>

      {/* Back button with correct forced redirect */}
      <Button 
        className={`mt-4 ${isDark ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-[#5c4f42] hover:bg-[#3c2f1f] text-white"}`}
        onClick={handleBackClick}
      >
        Back To Home
      </Button>
    </div>
  );
}