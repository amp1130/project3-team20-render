"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from 'next/image';

export function Navigation() {
  const router = useRouter();
  const { user } = useUser();
  
  // Get the user's first name or username
  const userName = user?.firstName || user?.username || "Guest";

  return (
    <div className="fixed top-0 left-0 right-0 flex items-center p-4 bg-card/80 backdrop-blur-sm z-10 border-b border-gray-300">
      <Image src="/logo.png" alt="Logo" width={56} height={56} className="mr-4" />
      <p className="text-[#3c2f1f] font-medium">Welcome, {userName}</p>
      <div className="ml-auto">
        <UserButton 
          afterSignOutUrl="/"
          appearance={{
            elements: {
              userButtonAvatarBox: "h-16 w-16",
            }
          }}
        />
      </div>
    </div>
  );
}