"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/theme-context"; // ✅ import theme context

export default function OrderSuccess() {
  const router = useRouter();
  const { theme } = useTheme(); // ✅ get current theme

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push("/"); // Redirect after 5 sec
    }, 5000);

    return () => clearTimeout(timeout);
  }, [router]);

  const isDark = theme === "dark";

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen text-center ${isDark ? "bg-[#1c1c1c] text-white" : "bg-[#f8f5f2] text-[#3c2f1f]"}`}>
      <h1 className="text-3xl font-bold">Order Successful!</h1>
      <p className={`mt-2 ${isDark ? "text-gray-300" : "text-[#5c4f42]"}`}>
        Thank you for your order. It will be prepared shortly.
      </p>
      <Button 
        className={`mt-4 ${isDark ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-[#5c4f42] hover:bg-[#3c2f1f] text-white"}`}
        onClick={() => router.back()}
      >
        Back to Home
      </Button>
    </div>
  );
}

