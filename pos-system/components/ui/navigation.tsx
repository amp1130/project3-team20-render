"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { User, ShoppingCart, BarChart2, Package, X, CheckCircle, Users, ArrowLeft, Moon, Sun, AArrowUp, AArrowDown } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import { WeatherDisplay } from "./weather-display";
import { useState, useEffect } from "react";
import { PasswordModal } from "./password-modal";
import { ConfirmationModal } from "./confirmation-modal";
import { useManager } from "@/context/manager-context";
import Link from 'next/link';
import { useTheme } from "@/context/theme-context";
import { useFont } from "@/context/font-size-context";

export function Navigation() {
  const router = useRouter();
  const { user } = useUser();
  const { isManagerMode, setManagerMode } = useManager();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const { isLarge, changeFontSize } = useFont();

  const userName = user?.firstName || user?.username || "Guest";

  useEffect(() => {
    if (showSuccessToast) {
      const fadeOutTimer = setTimeout(() => {
        setIsFadingOut(true);
      }, 2500);
      const removeTimer = setTimeout(() => {
        setShowSuccessToast(false);
        setIsFadingOut(false);
      }, 3000);
      return () => {
        clearTimeout(fadeOutTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [showSuccessToast]);

  const handleManagerToggle = () => {
    if (isManagerMode) {
      setIsConfirmationModalOpen(true);
    } else {
      setIsPasswordModalOpen(true);
    }
  };

  const handlePasswordSubmit = (password: string) => {
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
          setShowSuccessToast(true);
        } else {
          setPasswordError("Incorrect password");
        }
      })
      .catch(error => {
        console.error('Error verifying password:', error);
        setPasswordError("An error occurred. Please try again.");
      });
  };

  const handleCloseToast = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      setShowSuccessToast(false);
      setIsFadingOut(false);
    }, 300);
  };

  return (
    <>
      <div className={`fixed top-0 left-0 right-0 flex items-center p-4 backdrop-blur-sm z-10 border-b ${isDark ? 'bg-[#1c1c1c] border-gray-700 text-white' : 'bg-card/80 border-gray-300 text-[#3c2f1f]'}`}>
        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          className={`mr-4 p-2 rounded transition ${
            isDark
              ? "hover:bg-gray-700 text-white"
              : "hover:bg-[#e6ded5] text-[#3c2f1f]"
          }`}
          aria-label="Go Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        {/* Logo */}
        <Image
          src="/logo.png"
          alt="Logo"
          width={56}
          height={56}
          className="mr-12"
          style={{ filter: isDark ? "brightness(0) invert(1)" : "none" }}
        />

        <p className={`${isDark ? 'text-white' : 'text-[#3c2f1f]'} font-medium`}>Welcome, {userName}</p>

        <div className="ml-12">
          <WeatherDisplay />
        </div>

        <div className="ml-auto flex items-center gap-x-2">
          <Button
            variant="outline"
            className={`bg-transparent ${isDark ? 'text-gray-200 border-gray-600 hover:bg-gray-700' : 'text-[#5c4f42] border-[#d4c8bc] hover:bg-[#e6ded5]'}`}
            onClick={() => router.push('/Order')}
          >
            <ShoppingCart className="h-4 w-4" />
            Order Screen
          </Button>

          {isManagerMode && (
            <>
              <Button
                variant="outline"
                className={`bg-transparent ${isDark ? 'text-gray-200 border-gray-600 hover:bg-gray-700' : 'text-[#5c4f42] border-[#d4c8bc] hover:bg-[#e6ded5]'}`}
                onClick={() => router.push('/reports')}
              >
                <BarChart2 className="h-4 w-4" />
                View Reports
              </Button>
              <Button
                variant="outline"
                className={`bg-transparent ${isDark ? 'text-gray-200 border-gray-600 hover:bg-gray-700' : 'text-[#5c4f42] border-[#d4c8bc] hover:bg-[#e6ded5]'}`}
                onClick={() => router.push('/inventory')}
              >
                <Package className="h-4 w-4" />
                Inventory
              </Button>
              <Button
                variant="outline"
                className={`bg-transparent ${isDark ? 'text-gray-200 border-gray-600 hover:bg-gray-700' : 'text-[#5c4f42] border-[#d4c8bc] hover:bg-[#e6ded5]'}`}
                onClick={() => router.push('/employees')}
              >
                <Users className="h-4 w-4" />
                Employees
              </Button>
            </>
          )}

          <Button
            variant="outline"
            className={`${isDark ? 'text-gray-200 border-gray-600 hover:bg-gray-700' : isManagerMode ? 'bg-[#e6ded5] text-[#3c2f1f] border-[#d4c8bc]' : 'bg-transparent text-[#5c4f42] border-[#d4c8bc] hover:bg-[#e6ded5]'}`}
            onClick={handleManagerToggle}
          >
            <User className="h-4 w-4" />
            {isManagerMode ? "Switch to Cashier" : "Switch to Manager"}
          </Button>

          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full border transition ${isDark ? 'border-gray-500 hover:bg-gray-700' : 'border-[#d4c8bc] hover:bg-[#e6ded5]'}`}
            aria-label="Toggle Dark Mode"
          >
            {isDark ? (
              <Sun className="h-5 w-5 text-white" />
            ) : (
              <Moon className="h-5 w-5 text-[#3c2f1f]" />
            )}
          </button>

          <Button
            onClick={changeFontSize}
            className={`p-2 rounded-full border transition ${isDark ? 'border-gray-500 hover:bg-gray-700' : 'border-[#d4c8bc] hover:bg-[#e6ded5]'}`}
            aria-label="Increase Font Size"
          >
            {isLarge ? (
              <AArrowDown className="h-5 w-5" />
            ) : (
              <AArrowUp className="h-5 w-5" />    
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

      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => {
          setIsPasswordModalOpen(false);
          setPasswordError("");
        }}
        onSubmit={handlePasswordSubmit}
        error={passwordError}
      />

      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        onConfirm={() => setManagerMode(false)}
        title="Exit Manager Mode"
        message="Are you sure you want to switch back to cashier mode? You will need to enter the password again to return to manager mode."
      />

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

