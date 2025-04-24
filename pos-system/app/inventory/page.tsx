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
import { AddMenuItemModal } from "@/components/ui/add-menu-item";
import { DeleteMenuItemModal } from "@/components/ui/delete-menu-item";

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

export default function InventoryPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [isAddMenuItemModalOpen, setIsAddMenuItemModalOpen] = useState(false);
  const [isDeleteMenuItemModalOpen, setIsDeleteMenuItemModalOpen] = useState(false);
  const router = useRouter();
  const { isManagerMode, isInitialized } = useManager();

  const fetchIngredients = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/ingredients");
      if (!response.ok) throw new Error("Failed to fetch ingredients");
      const data = await response.json();
      setIngredients(data);
    } catch (error) {
      console.error("Error fetching ingredients:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await fetch("/api/menu-board?simple=true");
      if (!response.ok) throw new Error("Failed to fetch menu items");
      const data = await response.json();
      setMenuItems(data);
    } catch (error) {
      console.error("Error fetching menu items:", error);
    }
  };

  useEffect(() => {
    if (!isInitialized) return;

    if (!isManagerMode) {
      router.push("/");
      return;
    }

    fetchIngredients();
    fetchMenuItems();
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
            <Button 
              onClick={() => setIsAddMenuItemModalOpen(true)}
              className="bg-[#5c4f42] hover:bg-[#3c2f1f] text-white"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Menu Item
            </Button>
            <Button 
              onClick={() => setIsDeleteMenuItemModalOpen(true)}
              variant="outline"
              className="border-[#d4c8bc] text-[#5c4f42] hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete Menu Item
            </Button>
          </div>
        </div>

        <InventoryTable 
          ingredients={ingredients} 
          loading={loading} 
          menuItems={menuItems}
          fetchMenuItems={fetchMenuItems}
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

        <AddMenuItemModal 
          isOpen={isAddMenuItemModalOpen}
          onClose={() => setIsAddMenuItemModalOpen(false)}
          onSuccess={() => {
            setIsAddMenuItemModalOpen(false);
            fetchMenuItems();
          }}
        />
        
        <DeleteMenuItemModal 
          isOpen={isDeleteMenuItemModalOpen}
          onClose={() => setIsDeleteMenuItemModalOpen(false)}
          onSuccess={() => {
            setIsDeleteMenuItemModalOpen(false);
            fetchMenuItems();
          }}
        />
      </div>
    </>
  );
}
