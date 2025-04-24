"use client"; // Enable client-side rendering for this component

// Import necessary hooks and components
import { useEffect } from "react";
import { useRouter } from "next/navigation"; // For navigation control
import { Button } from "@/components/ui/button"; // Reusable Button component
import { useTheme } from "@/context/theme-context"; // Access theme context (light/dark)

export default function OrderSuccess() {
  const router = useRouter(); // Router instance to programmatically navigate
  const { theme } = useTheme(); // Get current theme from context

  // Automatically redirect to home after 5 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push("/"); // Navigate to home page
    }, 5000);

    // Clear timeout if component unmounts before 5 seconds
    return () => clearTimeout(timeout);
  }, [router]);

  const isDark = theme === "dark"; // Check if dark theme is enabled

  return (
    // Fullscreen centered layout with theme-based styling
    <div className={`flex flex-col items-center justify-center min-h-screen text-center ${isDark ? "bg-[#1c1c1c] text-white" : "bg-[#f8f5f2] text-[#3c2f1f]"}`}>
      {/* Confirmation Message */}
      <h1 className="text-3xl font-bold">Order Successful!</h1>
      <p className={`mt-2 ${isDark ? "text-gray-300" : "text-[#5c4f42]"}`}>
        Thank you for your order. It will be prepared shortly.
      </p>

      {/* Back button with styling based on theme */}
      <Button 
        className={`mt-4 ${isDark ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-[#5c4f42] hover:bg-[#3c2f1f] text-white"}`}
        onClick={() => router.back()} // Go back to previous page
      >
        Back to Home
      </Button>
    </div>
  );
}


