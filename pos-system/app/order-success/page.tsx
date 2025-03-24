"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function OrderSuccess() {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push("/"); // Redirect to home after 5 seconds
    }, 5000);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-3xl font-bold text-[#3c2f1f]">Order Successful!</h1>
      <p className="text-[#5c4f42] mt-2">Thank you for your order. It will be prepared shortly.</p>
      <Button 
        className="mt-4 bg-[#5c4f42] hover:bg-[#3c2f1f] text-white"
        onClick={() => router.push("/")}
      >
        Back to Home
      </Button>
    </div>
  );
}
