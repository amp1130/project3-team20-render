"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddEmployeeModal({ isOpen, onClose, onSuccess }: AddEmployeeModalProps) {
  const [employeeID, setEmployeeID] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [hourlyWage, setHourlyWage] = useState("");
  const [hours, setHours] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Focus first input when modal opens
  useEffect(() => {
    if (isOpen && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [isOpen]);

  // Handle click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle ESC key to close
  useEffect(() => {
    function handleEscKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
    }
    
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, onClose]);

  const resetForm = () => {
    setEmployeeID("");
    setEmployeeName("");
    setJobTitle("");
    setHourlyWage("");
    setHours("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validate inputs
    if (!employeeID || !employeeName || !jobTitle || !hourlyWage || !hours) {
      setError("All fields are required");
      return;
    }

    // Validate numeric fields
    const idNum = parseInt(employeeID);
    const wageNum = parseFloat(hourlyWage);
    const hoursNum = parseInt(hours);

    if (isNaN(idNum) || idNum <= 0) {
      setError("Employee ID must be a positive number");
      return;
    }

    if (isNaN(wageNum) || wageNum < 0) {
      setError("Hourly wage must be a non-negative number");
      return;
    }

    if (isNaN(hoursNum) || hoursNum < 0) {
      setError("Hours must be a non-negative number");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/employees/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employee_id: idNum,
          name: employeeName,
          job_title: jobTitle,
          hourly_wage: wageNum,
          hours: hoursNum,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add employee");
      }

      resetForm();
      onSuccess();
    } catch (error) {
      console.error("Error adding employee:", error);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>
        
        <h2 className="text-xl font-bold text-[#3c2f1f] mb-4">Add New Employee</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="employee-id" className="block text-sm font-medium text-[#5c4f42] mb-1">
                Employee ID
              </label>
              <input
                ref={firstInputRef}
                type="number"
                id="employee-id"
                value={employeeID}
                onChange={(e) => setEmployeeID(e.target.value)}
                className="w-full rounded-md border border-[#d4c8bc] bg-white py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#a67c52] focus:border-[#a67c52]"
                placeholder="Enter employee ID"
              />
            </div>
            
            <div>
              <label htmlFor="employee-name" className="block text-sm font-medium text-[#5c4f42] mb-1">
                Employee Name
              </label>
              <input
                type="text"
                id="employee-name"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                className="w-full rounded-md border border-[#d4c8bc] bg-white py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#a67c52] focus:border-[#a67c52]"
                placeholder="Enter employee name"
              />
            </div>
            
            <div>
              <label htmlFor="job-title" className="block text-sm font-medium text-[#5c4f42] mb-1">
                Job Title
              </label>
              <input
                type="text"
                id="job-title"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full rounded-md border border-[#d4c8bc] bg-white py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#a67c52] focus:border-[#a67c52]"
                placeholder="Enter job title"
                step="0.01"
              />
            </div>
            
            <div>
              <label htmlFor="hourly-wage" className="block text-sm font-medium text-[#5c4f42] mb-1">
                Hourly Wage
              </label>
              <input
                type="number"
                id="hourly-wage"
                value={hourlyWage}
                onChange={(e) => setHourlyWage(e.target.value)}
                className="w-full rounded-md border border-[#d4c8bc] bg-white py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#a67c52] focus:border-[#a67c52]"
                placeholder="Enter hourly wage"
                step="0.01"
              />
            </div>

            <div>
              <label htmlFor="hours" className="block text-sm font-medium text-[#5c4f42] mb-1">
                Hours
              </label>
              <input
                type="number"
                id="hours"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-full rounded-md border border-[#d4c8bc] bg-white py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#a67c52] focus:border-[#a67c52]"
                placeholder="Enter hours"
                step="0.01"
              />
            </div>
            
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="border-[#d4c8bc] text-[#5c4f42]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#5c4f42] hover:bg-[#3c2f1f] text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Employee"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 