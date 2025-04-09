// components/ui/customer-navigation.tsx
'use client';

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { WeatherDisplay } from "./weather-display";

export function CustomerNavigation() {
  const router = useRouter();

  return (
    <div className="fixed top-0 left-0 right-0 flex items-center p-4 bg-card/80 backdrop-blur-sm z-10 border-b border-gray-300">
      {/* Back Button */}
      <button
        onClick={() => router.push('/')}
        className="mr-4 p-2 rounded hover:bg-[#e6ded5] text-[#3c2f1f] transition"
        aria-label="Go Back"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      {/* Logo */}
      <Image src="/logo.png" alt="Logo" width={56} height={56} className="mr-12" />

      {/* Weather */}
      <div className="ml-auto">
        <WeatherDisplay />
      </div>
    </div>
  );
}

