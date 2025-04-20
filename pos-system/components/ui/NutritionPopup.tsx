import { Dialog } from "@headlessui/react";
import { useTheme } from "@/context/theme-context";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface NutritionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  calories: number;
  sugar: number;
  allergens: string[];
  menuId?: number;
  toppings?: string[]; // Add toppings prop
}

interface MenuBoardItem {
  menu_id: number;
  item_name: string;
  price: number;
  ingredients: string[];
}

interface IngredientData {
  ingredient_id: number;
  ingredient: string;
}

export function NutritionPopup({
  isOpen,
  onClose,
  onContinue,
  calories,
  sugar,
  allergens,
  menuId,
  toppings = [] // Default to empty array if not provided
}: NutritionModalProps) {
  const { theme } = useTheme();
  const bgClass = theme === "dark" ? "bg-[#1e1e1e]" : "bg-white";
  const textClass = theme === "dark" ? "text-white" : "text-[#3c2f1f]";
  const subTextClass = theme === "dark" ? "text-gray-300" : "text-[#5c4f42]";
  const overlayBg = "bg-black opacity-40";
  const tableBgClass = theme === "dark" ? "bg-[#2a2a2a]" : "bg-[#f8f5f2]";
  const tableBorderClass = theme === "dark" ? "border-gray-700" : "border-[#e6ded5]";
  const allergenClass = "text-red-500 text-sm font-medium mt-2";
  
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasDairy, setHasDairy] = useState(false);
  const [hasSoy, setHasSoy] = useState(false);

  useEffect(() => {
    if (isOpen && menuId) {
      fetchMenuDetails(menuId);
    }
  }, [isOpen, menuId]);

  const fetchMenuDetails = async (menuId: number) => {
    try {
      setLoading(true);
      
      // Fetch menu items with raw ingredient data
      const response = await fetch(`/api/menu-board`);
      const menuData: MenuBoardItem[] = await response.json();
      
      // Find our specific menu item
      const menuItem = menuData.find(item => item.menu_id === menuId);
      
      if (menuItem) {
        // Get the ingredients from the menu item
        let ingredientsList = [...menuItem.ingredients];
        
        // Add toppings to the ingredients list if they're not already there
        toppings.forEach(topping => {
          if (!ingredientsList.includes(topping)) {
            ingredientsList.push(topping);
          }
        });
        
        setIngredients(ingredientsList);
        
        // Also fetch raw ingredient IDs to check for allergens
        const ingredientDataResponse = await fetch(`/api/menu-ingredients?menuId=${menuId}`);
        const ingredientData: IngredientData[] = await ingredientDataResponse.json();
        
        // Check for specific ingredient IDs for allergens
        setHasDairy(ingredientData.some(ing => ing.ingredient_id === 3));
        setHasSoy(ingredientData.some(ing => ing.ingredient_id === 13));
      } else {
        setIngredients([]);
      }
    } catch (error) {
      console.error("Error fetching menu details:", error);
      setIngredients([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Overlay */}
      <div className={`fixed inset-0 ${overlayBg}`} aria-hidden="true" />
      
      {/* Centered Modal Panel */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className={`relative rounded-lg shadow-xl w-96 p-6 text-center ${bgClass}`}>
          <Dialog.Title className={`text-xl font-bold mb-4 ${subTextClass}`}>Nutrition Info</Dialog.Title>
          
          <p className={`${textClass} mb-2`}>
            Calories: <strong>{calories}</strong>
          </p>
          <p className={`${textClass} mb-4`}>
            Sugar: <strong>{sugar}g</strong>
          </p>
          
          {loading ? (
            <p className={`${textClass} text-sm italic`}>Loading ingredients...</p>
          ) : (
            <>
              <div className="mb-4">
              <h3 className={`text-lg font-bold mb-2 ${theme === "dark" ? "text-white" : "text-[#5c4f42]"}`}>Ingredients</h3>
                <div className={`rounded-md overflow-hidden border ${tableBorderClass}`}>
                  <table className="w-full text-sm">
                    <thead className={`${tableBgClass}`}>
                      <tr>
                        <th className={`py-2 px-3 text-center ${textClass} border-b ${tableBorderClass}`}>List</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ingredients.length > 0 ? (
                        ingredients.map((ing, index) => (
                          <tr key={index} className={index % 2 === 0 ? bgClass : tableBgClass}>
                            <td className={`py-2 px-3 ${textClass}`}>{ing}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className={`py-2 px-3 ${textClass} italic`}>No ingredients data available</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Specific allergen warnings */}
              {hasDairy && (
                <p className={allergenClass}>CONTAINS DAIRY!</p>
              )}
              {hasSoy && (
                <p className={allergenClass}>CONTAINS SOY!</p>
              )}
              {allergens.length > 0 && allergens.map((a, i) => (
                <p key={i} className={allergenClass}>{a}</p>
              ))}
            </>
          )}
          
          <div className="mt-6 flex justify-center gap-3">
            <Button
              onClick={onClose}
              className={`${theme === "dark" ? "bg-gray-600 hover:bg-gray-500 text-white" : "bg-[#d4c8bc] text-[#3c2f1f] hover:bg-[#cbbcae]"}`}
            >
              Cancel
            </Button>

            <Button
                onClick={onContinue}
                className={`${theme === "dark" ? "bg-white text-[#3c2f1f] hover:bg-gray-200" : "bg-[#5c4f42] text-white hover:bg-[#3c2f1f]"}`}
            >
                Continue
            </Button>

          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
