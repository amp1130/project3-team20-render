"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {User, ShoppingCart, BarChart2, Package, X, CheckCircle, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import { WeatherDisplay } from "./weather-display";
import { useState, useEffect } from "react";
import { PasswordModal } from "./password-modal";
import { ConfirmationModal } from "./confirmation-modal";
import { useManager } from "@/context/manager-context";
import Link from 'next/link';

export function Navigation() {
  const router = useRouter();
  const { user } = useUser();
  const { isManagerMode, setManagerMode } = useManager();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  
  // Get the user's first name or username
  const userName = user?.firstName || user?.username || "Guest";

  // Handle showing and hiding the success toast
  useEffect(() => {
    if (showSuccessToast) {
      // Set timer to start fade-out animation
      const fadeOutTimer = setTimeout(() => {
        setIsFadingOut(true);
      }, 2500); // Start fade out after 2.5 seconds
      
      // Set timer to completely remove toast after animation
      const removeTimer = setTimeout(() => {
        setShowSuccessToast(false);
        setIsFadingOut(false);
      }, 3000); // Remove after 3 seconds (allowing 500ms for fade animation)
      
      return () => {
        clearTimeout(fadeOutTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [showSuccessToast]);

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
          setShowSuccessToast(true); // Show success toast
        } else {
          setPasswordError("Incorrect password");
        }
      })
      .catch(error => {
        console.error('Error verifying password:', error);
        setPasswordError("An error occurred. Please try again.");
      });
  };

  // When toast close button is clicked
  const handleCloseToast = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      setShowSuccessToast(false);
      setIsFadingOut(false);
    }, 300); // Allow 300ms for fade-out animation
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 flex items-center p-4 bg-card/80 backdrop-blur-sm z-10 border-b border-gray-300">
        <Link href="/" className="cursor-pointer">
          <Image src="/logo.png" alt="Logo" width={56} height={56} className="mr-12" />
        </Link>
        <p className="text-[#3c2f1f] font-medium">Welcome, {userName}</p>
        
        {/* weather api */}
        <div className="ml-12">
          <WeatherDisplay />
        </div>
        
        <div className="ml-auto flex items-center">
          <Button
            variant="outline"
            className="border-[#d4c8bc] mr-2 bg-transparent text-[#5c4f42]"
            onClick={() => router.push('/')}
          >
            <ShoppingCart className="h-4 w-4" />
            Order Screen
          </Button>
          
          {/* Manager-specific buttons (only visible in manager mode) */}
          {isManagerMode && (
            <div className="flex mr-2">
              <Button
                variant="outline"
                className="border-[#d4c8bc] mr-2 bg-transparent text-[#5c4f42]"
                onClick={() => router.push('/reports')}
              >
                <BarChart2 className="h-4 w-4" />
                View Reports
              </Button>
              <Button
                variant="outline"
                className="border-[#d4c8bc] bg-transparent text-[#5c4f42]"
                onClick={() => router.push('/inventory')}
              >
                <Package className="h-4 w-4" />
                Inventory
              </Button>
              <Button
                variant="outline"
                className="border-[#d4c8bc] bg-transparent text-[#5c4f42]"
                onClick={() => router.push('/employees')}
              >
                <Users className="h-4 w-4" />
                Employees
              </Button>
            </div>
          )}
          
          {/* Manager Mode Toggle Button */}
          <Button
            variant="outline"
            className={`border-[#d4c8bc] mr-2 ${
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
      
      {/* Success Toast with fade-out animation */}
      {showSuccessToast && (
        <div 
          className={`fixed bottom-4 right-4 bg-green-50 border border-green-200 text-green-800 rounded-md shadow-md p-4 flex items-center z-50 transition-opacity duration-300 ease-in-out ${
            isFadingOut ? "opacity-0" : "opacity-100"
          }`}
        >
          <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
          <div>
            <h3 className="font-medium">Success!</h3>
            <p className="text-sm">Logged in to manager mode</p>
          </div>
          <button 
            onClick={handleCloseToast}
            className="ml-4 text-green-600 hover:text-green-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </>
  );
}