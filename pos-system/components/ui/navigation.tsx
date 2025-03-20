"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import { WeatherDisplay } from "./weather-display";
import { useState } from "react";
import { PasswordModal } from "./password-modal";
import { ConfirmationModal } from "./confirmation-modal";
import { useManager } from "@/context/manager-context";

export function Navigation() {
  const router = useRouter();
  const { user } = useUser();
  const { isManagerMode, setManagerMode } = useManager();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  
  // Get the user's first name or username
  const userName = user?.firstName || user?.username || "Guest";

  const handleManagerToggle = () => {
    if (isManagerMode) {
      // If already in manager mode, show confirmation modal before exiting
      setIsConfirmationModalOpen(true);
    } else {
      // If not in manager mode, show password modal
      setIsPasswordModalOpen(true);
    }
  };

  const handlePasswordSubmit = (password: string) => {
    // Get manager password from environment variable
    // Note: We need to create an API route for this since environment variables
    // with MANAGER_ prefix are not exposed to the client
    fetch('/api/verify-manager-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setManagerMode(true);
          setIsPasswordModalOpen(false);
          setPasswordError("");
        } else {
          setPasswordError("Incorrect password");
        }
      })
      .catch(error => {
        console.error('Error verifying password:', error);
        setPasswordError("An error occurred. Please try again.");
      });
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 flex items-center p-4 bg-card/80 backdrop-blur-sm z-10 border-b border-gray-300">
        <Image src="/logo.png" alt="Logo" width={56} height={56} className="mr-12" />
        <p className="text-[#3c2f1f] font-medium">Welcome, {userName}</p>
        
        {/* weather api */}
        <div className="ml-12">
          <WeatherDisplay />
        </div>
        
        <div className="ml-auto flex items-center gap-3.5">
          {/* Manager-specific buttons (only visible in manager mode) */}
          {isManagerMode && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="border-[#d4c8bc] bg-transparent text-[#5c4f42]"
                onClick={() => router.push('/reports')}
              >
                View Reports
              </Button>
              <Button
                variant="outline"
                className="border-[#d4c8bc] bg-transparent text-[#5c4f42]"
                onClick={() => router.push('/inventory')}
              >
                Inventory
              </Button>
            </div>
          )}
          
          {/* Manager Mode Toggle Button */}
          <Button
            variant="outline"
            className={`border-[#d4c8bc] ${
              isManagerMode 
                ? "bg-[#e6ded5] text-[#3c2f1f]" 
                : "bg-transparent text-[#5c4f42]"
            }`}
            onClick={handleManagerToggle}
          >
            {isManagerMode ? (
              <>
                <User className="h-4 w-4" />
                Switch to Cashier
              </>
            ) : (
              <>
                <User className="h-4 w-4" />
                Switch to Manager
              </>
            )}
          </Button>
          
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
      
      {/* Password Modal */}
      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => {
          setIsPasswordModalOpen(false);
          setPasswordError("");
        }}
        onSubmit={handlePasswordSubmit}
        error={passwordError}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        onConfirm={() => setManagerMode(false)}
        title="Exit Manager Mode"
        message="Are you sure you want to switch back to cashier mode? You will need to enter the password again to return to manager mode."
      />
    </>
  );
}