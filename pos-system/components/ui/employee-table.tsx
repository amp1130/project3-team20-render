"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, ChevronUp, ChevronDown } from "lucide-react";

export interface Employee {
  employee_id: number;
  employee_name: string;
  job_title: string;
  hourly_wage: number;
  total_hours: number;
}

interface EmployeeTableProps {
  employees: Employee[];
  loading: boolean;
}

type SortField = 'employee_id' | 'employee_name' | 'job_title' | 'hourly_wage' | 'total_hours';
type SortDirection = 'asc' | 'desc';

export function EmployeeTable({ employees, loading }: EmployeeTableProps) {
  const [sortField, setSortField] = useState<SortField>('employee_id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#5c4f42]" />
      </div>
    );
  }

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sort the ingredients array
  const sortedIngredients = [...employees].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    } else {
      return sortDirection === 'asc' 
        ? (aValue as number) - (bValue as number) 
        : (bValue as number) - (aValue as number);
    }
  });

  // Helper to render sort indicator
  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) return null;
    
    return sortDirection === 'asc' 
      ? <ChevronUp className="ml-1 h-4 w-4 inline" /> 
      : <ChevronDown className="ml-1 h-4 w-4 inline" />;
  };

  return (
    <div className="rounded-md border border-[#d4c8bc]">
      <Table>
        <TableHeader className="bg-[#f8f5f2]">
          <TableRow>
            <TableHead 
              className="font-medium text-[#3c2f1f] cursor-pointer"
              onClick={() => handleSort('employee_id')}
            >
              Employee ID {renderSortIndicator('employee_id')}
            </TableHead>
            <TableHead 
              className="font-medium text-[#3c2f1f] cursor-pointer"
              onClick={() => handleSort('employee_name')}
            >
              Employee Name {renderSortIndicator('employee_name')}
            </TableHead>
            <TableHead 
              className="font-medium text-[#3c2f1f] cursor-pointer"
              onClick={() => handleSort('job_title')}
            >
              Job Title {renderSortIndicator('job_title')}
            </TableHead>
            <TableHead 
              className="font-medium text-[#3c2f1f] cursor-pointer"
              onClick={() => handleSort('hourly_wage')}
            >
              Hourly Wage {renderSortIndicator('hourly_wage')}
            </TableHead>
            <TableHead 
              className="font-medium text-[#3c2f1f] cursor-pointer"
              onClick={() => handleSort('total_hours')}
            >
              Total Hours {renderSortIndicator('total_hours')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedIngredients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-[#8c7b6b]">
                No employees found.
              </TableCell>
            </TableRow>
          ) : (
            sortedIngredients.map((employee) => (
              <TableRow key={employee.employee_id}>
                <TableCell className="font-medium">{employee.employee_id}</TableCell>
                <TableCell>{employee.employee_name}</TableCell>
                <TableCell>{employee.job_title}</TableCell>
                <TableCell>{employee.hourly_wage}</TableCell>
                <TableCell>{employee.total_hours}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
} 