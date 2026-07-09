"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { usePathname } from "next/navigation";

interface UserSyncContextProps {
    notifications: any[];
    unreadCount: number;
    newOrders: any[];
    unreadOrdersCount: number;
    dismissOrderNotification: (orderId: string) => Promise<void>;
    refreshSync: () => Promise<void>;
}

const UserSyncContext = createContext<UserSyncContextProps | undefined>(undefined);

export function UserSyncProvider({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [newOrders, setNewOrders] = useState<any[]>([]);
    const [unreadOrdersCount, setUnreadOrdersCount] = useState(0);

    const fetchSync = async () => {
        try {
            const res = await fetch("/api/user/sync");
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.unreadNotificationsCount || 0);
                setNewOrders(data.newOrders || []);
                setUnreadOrdersCount(data.badgeCount || 0);
            }
        } catch (err) {
            // Silently swallow fetch errors during polling
        }
    };

    useEffect(() => {
        if (pathname === "/login" || pathname === "/register" || pathname === "/") return;
        
        fetchSync();
        const interval = setInterval(fetchSync, 15000); // Consolidated polling every 15 seconds
        return () => clearInterval(interval);
    }, [pathname]);

    const dismissOrderNotification = async (orderId: string) => {
        try {
            // Optimistically update
            setNewOrders(prev => prev.filter(o => o.id !== orderId));
            
            await fetch("/api/orders/polling", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId })
            });
        } catch (err) {
            console.error("Failed to dismiss order notification", err);
        }
    };

    return (
        <UserSyncContext.Provider value={{
            notifications,
            unreadCount,
            newOrders,
            unreadOrdersCount,
            dismissOrderNotification,
            refreshSync: fetchSync
        }}>
            {children}
        </UserSyncContext.Provider>
    );
}

export function useUserSync() {
    const context = useContext(UserSyncContext);
    if (!context) {
        return {
            notifications: [],
            unreadCount: 0,
            newOrders: [],
            unreadOrdersCount: 0,
            dismissOrderNotification: async () => {},
            refreshSync: async () => {}
        };
    }
    return context;
}
