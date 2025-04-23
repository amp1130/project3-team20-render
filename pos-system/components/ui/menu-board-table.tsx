"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface FullMenuItem {
  menu_id: number;
  item_name: string;
  price: number;
  ingredients: string[];
}

interface SimpleMenuItem {
  menu_id: number;
  item_name: string;
  price: number;
}

export function MenuBoardTable() {
  const [viewSimple, setViewSimple] = useState(false);
  const [loading, setLoading] = useState(true);
  const [menuData, setMenuData] = useState<(FullMenuItem | SimpleMenuItem)[]>([]);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      const res = await fetch(`/api/menu-board${viewSimple ? "?simple=true" : ""}`);
      const data = await res.json();
      setMenuData(data);
      setLoading(false);
    };
    fetchData();
  }, [viewSimple]);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="outline"
          className="text-[#5c4f42] border-[#d4c8bc] bg-transparent"
          onClick={() => setViewSimple((prev) => !prev)}
        >
          {viewSimple ? "View Full Menu" : "View Menu"}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#5c4f42]" />
        </div>
      ) : (
        <div className="rounded-md border border-[#d4c8bc]">
          <Table>
            <TableHeader className="bg-[#f8f5f2]">
              <TableRow>
                <TableHead className="font-medium text-[#3c2f1f]">ID</TableHead>
                <TableHead className="font-medium text-[#3c2f1f]">Name</TableHead>
                <TableHead className="font-medium text-[#3c2f1f]">Price</TableHead>
                {!viewSimple && (
                  <TableHead className="font-medium text-[#3c2f1f]">Ingredients</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {menuData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={viewSimple ? 3 : 4} className="text-center py-8 text-[#8c7b6b]">
                    No menu items found.
                  </TableCell>
                </TableRow>
              ) : (
                menuData.map((item) => (
                  <TableRow key={item.menu_id}>
                    <TableCell>{item.menu_id}</TableCell>
                    <TableCell>{item.item_name}</TableCell>
                    <TableCell>${item.price.toFixed(2)}</TableCell>
                    {!viewSimple && (
                      <TableCell>
                        {(item as FullMenuItem).ingredients?.join(", ") || "N/A"}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
