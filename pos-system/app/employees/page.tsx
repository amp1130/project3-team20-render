"use client";

import { Navigation } from "@/components/ui/navigation";
import { useRouter } from "next/navigation";
import { useManager } from "@/context/manager-context";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { EmployeeTable, Employee } from "@/components/ui/employee-table";
import { AddEmployeeModal } from "@/components/ui/add-employee-modal";
import { DeleteEmployeeModal } from "@/components/ui/delete-employee-modal";
import { UpdateEmployeeModal } from "@/components/ui/update-employee-modal";

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { isManagerMode, isInitialized } = useManager();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

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
                        onClick={() => setIsAddModalOpen(true)}
                        >
                            Add Employee
                        </Button>
                        <Button 
                            className="mt-4 bg-[#5c4f42] hover:bg-[#3c2f1f] text-white"
                            onClick={() => setIsUpdateModalOpen(true)}
                        >
                            Delete Employee
                        </Button>
                        <Button 
                            className="mt-4 bg-[#5c4f42] hover:bg-[#3c2f1f] text-white"
                            onClick={() => setIsDeleteModalOpen(true)}
                        >
                            Update Employee
                        </Button>
                    </div>
                </div>
                <AddEmployeeModal 
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onSuccess={() => {
                        setIsAddModalOpen(false);
                        fetchEmployees();
                    }}
                />
            </div>
        </>
    );
}