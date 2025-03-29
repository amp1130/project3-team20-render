"use client";

import { Navigation } from "@/components/ui/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useManager } from "@/context/manager-context";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, RefreshCw } from "lucide-react";
import { InventoryTable } from "@/components/ui/inventory-table";
import { AddIngredientModal } from "@/components/ui/add-ingredient-modal";
import { DeleteIngredientModal } from "@/components/ui/delete-ingredient-modal";
import { RestockIngredientModal } from "@/components/ui/restock-ingredient-modal";

interface Ingredient {
  ingredient_id: number;
  ingredient_name: string;
  current_amount: number;
  critical_amount: number;
  restock_count: number;
}

export default function InventoryPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const router = useRouter();
  const { isManagerMode, isInitialized } = useManager();

  // Fetch ingredients data
  const fetchIngredients = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/ingredients");
      if (!response.ok) {
        throw new Error("Failed to fetch ingredients");
      }
      const data = await response.json();
      setIngredients(data);
    } catch (error) {
      console.error("Error fetching ingredients:", error);
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

    fetchIngredients();
  }, [isInitialized, isManagerMode, router]);

  return (
    <>
      <Navigation />
      <div className="container mx-auto p-6 pt-24">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#3c2f1f]">Inventory Management</h1>
          <div className="flex gap-2">
            <Button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-[#5c4f42] hover:bg-[#3c2f1f] text-white"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Ingredient
            </Button>
            <Button 
              onClick={() => setIsDeleteModalOpen(true)}
              variant="outline"
              className="border-[#d4c8bc] text-[#5c4f42]"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete Ingredient
            </Button>
            <Button 
              onClick={() => setIsRestockModalOpen(true)}
              variant="outline"
              className="border-[#d4c8bc] text-[#5c4f42]"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Restock Ingredient
            </Button>
          </div>
        </div>

        <InventoryTable 
          ingredients={ingredients} 
          loading={loading} 
        />

        <AddIngredientModal 
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            setIsAddModalOpen(false);
            fetchIngredients();
          }}
        />

        <DeleteIngredientModal 
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onSuccess={() => {
            setIsDeleteModalOpen(false);
            fetchIngredients();
          }}
        />

        <RestockIngredientModal 
          isOpen={isRestockModalOpen}
          onClose={() => setIsRestockModalOpen(false)}
          onSuccess={() => {
            setIsRestockModalOpen(false);
            fetchIngredients();
          }}
          ingredients={ingredients}
        />
      </div>
    </>
  );
} 