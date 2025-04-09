"use client";

interface MenuItem {
    id: number;
    menu_id: number;
    item_name: string;
    price: number | string;
    category: string;
    description?: string;
}
