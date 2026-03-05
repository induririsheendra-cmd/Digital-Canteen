"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { MenuItem, MealTiming } from "@prisma/client";

export interface CartItem {
    id: string; // The specific CartItem UUID
    menuItem: MenuItem;
    quantity: number;
}

interface CartContextProps {
    cartItems: CartItem[];
    addToCart: (menuItem: MenuItem) => void;
    removeFromCart: (cartItemId: string) => void;
    updateQuantity: (cartItemId: string, change: number) => void;
    clearCart: () => void;
    cartTotal: number;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    const [timings, setTimings] = useState<MealTiming[]>([]);

    useEffect(() => {
        const fetchTimings = async () => {
            try {
                const res = await fetch('/api/admin/timing');
                if (res.ok) {
                    const data = await res.json();
                    setTimings(data);
                }
            } catch (err) {
                console.error("Failed to load meal timings", err);
            }
        };
        fetchTimings();
    }, []);

    const isWithinTiming = (category: string) => {
        // If it's a general item, plate item, or no timing is set, allow it.
        const timing = timings.find(t => t.category === category);
        if (!timing) return true;

        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();

        const [startHour, startMin] = timing.startTime.split(':').map(Number);
        const [endHour, endMin] = timing.endTime.split(':').map(Number);

        const startTime = startHour * 60 + startMin;
        const endTime = endHour * 60 + endMin;

        return currentTime >= startTime && currentTime <= endTime;
    };

    const addToCart = (menuItem: MenuItem) => {
        // Validation check for meal timings
        if (!isWithinTiming(menuItem.category)) {
            alert(`Sorry, ${menuItem.name} (${menuItem.category}) is outside of its serving hours.`);
            return;
        }

        setCartItems((prev) => {
            // Check if item already exists in cart, if so, increment quantity
            const existingItemIndex = prev.findIndex((item) => item.menuItem.id === menuItem.id);
            if (existingItemIndex > -1) {
                const updatedCart = [...prev];
                updatedCart[existingItemIndex].quantity += 1;
                return updatedCart;
            }

            // Add new item
            return [
                ...prev,
                {
                    id: crypto.randomUUID(),
                    menuItem,
                    quantity: 1,
                },
            ];
        });
    };

    const removeFromCart = (cartItemId: string) => {
        setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
    };

    const updateQuantity = (cartItemId: string, change: number) => {
        setCartItems((prev) =>
            prev.map((item) => {
                if (item.id === cartItemId) {
                    const newQuantity = item.quantity + change;
                    return { ...item, quantity: newQuantity > 0 ? newQuantity : 1 }; // Prevent <= 0
                }
                return item;
            })
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const cartTotal = cartItems.reduce(
        (total, item) => total + item.menuItem.price * item.quantity,
        0
    );

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                cartTotal,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
