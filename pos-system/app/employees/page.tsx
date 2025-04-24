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
    // State for list of employees and loading status
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);

    const router = useRouter();

    // Context to check if the user is in manager mode and if the mode is initialized
    const { isManagerMode, isInitialized } = useManager();

    // Modals state: track which modal is open
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

    // Function to fetch employee data from API
    const fetchEmployees = async () => {
        try {
            setLoading(true); // Show loading state while fetching
            const response = await fetch("/api/employees");
            if (!response.ok) {
                throw new Error("Failed to fetch employees");
            }
            const data = await response.json();
            setEmployees(data); // Populate employee list
        } catch (error) {
            console.error("Error fetching employees:", error);
        } finally {
            setLoading(false); // Hide loading state
        }
    };

    // Load employees only if manager mode is enabled and initialized
    useEffect(() => {
        if (!isInitialized) return;

        if (!isManagerMode) {
            router.push("/"); // Redirect unauthorized users to home
            return;
        }

        fetchEmployees(); // Fetch employees when page is loaded
    }, [isInitialized, isManagerMode, router]);

    return (
        <>
            <Navigation /> {/* Top navigation bar */}

            <div className="container mx-auto p-6 pt-24">
                {/* Page header with action buttons */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-[#3c2f1f]">Edit Employees</h1>
                    <div className="flex gap-2">
                        <Button 
                            className="bg-[#5c4f42] hover:bg-[#3c2f1f] text-white"
                            onClick={() => setIsAddModalOpen(true)}
                        >
                            Add Employee
                        </Button>
                        <Button 
                            className="bg-[#5c4f42] hover:bg-[#3c2f1f] text-white"
                            onClick={() => setIsDeleteModalOpen(true)}
                        >
                            Delete Employee
                        </Button>
                        <Button 
                            className="bg-[#5c4f42] hover:bg-[#3c2f1f] text-white"
                            onClick={() => setIsUpdateModalOpen(true)}
                        >
                            Update Employee
                        </Button>
                    </div>
                </div>

                {/* Table to display employees */}
                <EmployeeTable 
                    employees={employees} 
                    loading={loading} 
                />

                {/* Modal to add new employee */}
                <AddEmployeeModal 
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onSuccess={() => {
                        setIsAddModalOpen(false);
                        fetchEmployees(); // Refresh data after adding
                    }}
                />

                {/* Modal to delete an existing employee */}
                <DeleteEmployeeModal 
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onSuccess={() => {
                        setIsDeleteModalOpen(false);
                        fetchEmployees(); // Refresh data after deletion
                    }}
                />

                {/* Modal to update employee info */}
                <UpdateEmployeeModal 
                    isOpen={isUpdateModalOpen}
                    onClose={() => setIsUpdateModalOpen(false)}
                    onSuccess={() => {
                        setIsUpdateModalOpen(false);
                        fetchEmployees(); // Refresh data after update
                    }}
                />
            </div>
        </>
    );
}
