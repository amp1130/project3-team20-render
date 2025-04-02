"use client";

import { Navigation } from "@/components/ui/navigation";
import { useRouter } from "next/navigation";
import { useManager } from "@/context/manager-context";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { EmployeeTable, Employee } from "@/components/ui/employee-table";

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { isManagerMode, isInitialized } = useManager();

    const fetchEmployees = async () => {
        try {
          setLoading(true);
          const response = await fetch("/api/employees");
          if (!response.ok) {
            throw new Error("Failed to fetch employees");
          }
          const data = await response.json();
          setEmployees(data);
        } catch (error) {
          console.error("Error fetching employees:", error);
        } finally {
          setLoading(false);
        }
      };
    

    useEffect(() => {
        if (!isInitialized) return;
        
        if (!isManagerMode) {
          router.push("/");
          return;
        }

        fetchEmployees();
      }, [isInitialized, isManagerMode, router]);

    return (
        <>
            <Navigation />
            <div className="container mx-auto p-6 pt-24">
                <EmployeeTable 
                    employees={employees} 
                    loading={loading} 
                />
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-[#3c2f1f]">Edit Employees</h1>
                    <div className="flex gap-2">
                        <Button 
                        className="mt-4 bg-[#5c4f42] hover:bg-[#3c2f1f] text-white"
                        onClick={() => router.push("/")}
                        >
                            Add Employee
                        </Button>
                        <Button 
                            className="mt-4 bg-[#5c4f42] hover:bg-[#3c2f1f] text-white"
                            onClick={() => router.push("/")}
                        >
                            Delete Employee
                        </Button>
                        <Button 
                            className="mt-4 bg-[#5c4f42] hover:bg-[#3c2f1f] text-white"
                            onClick={() => router.push("/")}
                        >
                            Update Employee
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}