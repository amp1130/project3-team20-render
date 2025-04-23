"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Ingredient {
  ingredient_id: number;
  ingredient_name: string;
  current_amount: number;
  critical_amount: number;
  restock_count: number;
}

interface MenuItem {
  menu_id: number;
  item_name: string;
  price: number;
}

interface InventoryTableProps {
  ingredients: Ingredient[];
  loading: boolean;
}

type SortField = 'ingredient_id' | 'ingredient_name' | 'current_amount' | 'critical_amount' | 'restock_count';
type SortDirection = 'asc' | 'desc';

export function InventoryTable({ ingredients, loading }: InventoryTableProps) {
  const [sortField, setSortField] = useState<SortField>('ingredient_id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [viewMenu, setViewMenu] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    if (viewMenu) {
      fetch("/api/menu-board?simple=true")
        .then((res) => res.json())
        .then((data) => setMenuItems(data))
        .catch((err) => console.error("Failed to fetch menu:", err));
    }
  }, [viewMenu]);

  if (loading && !viewMenu) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#5c4f42]" />
      </div>
    );
  }

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedIngredients = [...ingredients].sort((a, b) => {
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

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' 
      ? <ChevronUp className="ml-1 h-4 w-4 inline" /> 
      : <ChevronDown className="ml-1 h-4 w-4 inline" />;
  };

  return (
    <div className="rounded-md border border-[#d4c8bc] p-4">
      <div className="flex justify-between mb-4">
        <h2 className="text-lg font-semibold text-[#3c2f1f]">
          {viewMenu ? "Simplified Menu View" : "Inventory Table"}
        </h2>
        <Button onClick={() => setViewMenu((prev) => !prev)}>
          {viewMenu ? "View Inventory" : "View Menu"}
        </Button>
      </div>

      {viewMenu ? (
        <Table>
          <TableHeader className="bg-[#f8f5f2]">
            <TableRow>
              <TableHead className="font-medium text-[#3c2f1f]">ID</TableHead>
              <TableHead className="font-medium text-[#3c2f1f]">Item Name</TableHead>
              <TableHead className="font-medium text-[#3c2f1f]">Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {menuItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-[#8c7b6b]">
                  No menu items found.
                </TableCell>
              </TableRow>
            ) : (
              menuItems.map((item) => (
                <TableRow key={item.menu_id}>
                  <TableCell className="font-medium">{item.menu_id}</TableCell>
                  <TableCell>{item.item_name}</TableCell>
                  <TableCell>${Number(item.price).toFixed(2)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      ) : (
        <Table>
          <TableHeader className="bg-[#f8f5f2]">
            <TableRow>
              <TableHead className="font-medium text-[#3c2f1f] cursor-pointer" onClick={() => handleSort('ingredient_id')}>
                ID {renderSortIndicator('ingredient_id')}
              </TableHead>
              <TableHead className="font-medium text-[#3c2f1f] cursor-pointer" onClick={() => handleSort('ingredient_name')}>
                Ingredient Name {renderSortIndicator('ingredient_name')}
              </TableHead>
              <TableHead className="font-medium text-[#3c2f1f] cursor-pointer" onClick={() => handleSort('current_amount')}>
                Current Amount {renderSortIndicator('current_amount')}
              </TableHead>
              <TableHead className="font-medium text-[#3c2f1f] cursor-pointer" onClick={() => handleSort('critical_amount')}>
                Critical Amount {renderSortIndicator('critical_amount')}
              </TableHead>
              <TableHead className="font-medium text-[#3c2f1f] cursor-pointer" onClick={() => handleSort('restock_count')}>
                Restock Count {renderSortIndicator('restock_count')}
              </TableHead>
              <TableHead className="font-medium text-[#3c2f1f]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedIngredients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-[#8c7b6b]">
                  No ingredients found.
                </TableCell>
              </TableRow>
            ) : (
              sortedIngredients.map((ingredient) => (
                <TableRow key={ingredient.ingredient_id}>
                  <TableCell className="font-medium">{ingredient.ingredient_id}</TableCell>
                  <TableCell>{ingredient.ingredient_name}</TableCell>
                  <TableCell>{ingredient.current_amount}</TableCell>
                  <TableCell>{ingredient.critical_amount}</TableCell>
                  <TableCell>{ingredient.restock_count}</TableCell>
                  <TableCell>
                    {ingredient.current_amount <= ingredient.critical_amount ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Low Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        In Stock
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
