'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import styles from './sidebar.module.css';

export default function Sidebar() {
    const pathname = usePathname();
    const { cartItems } = useCart();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [unreadOrders, setUnreadOrders] = useState(0);

    useEffect(() => {
        document.documentElement.style.setProperty('--sidebar-width', isCollapsed ? '80px' : '250px');
    }, [isCollapsed]);

    // Poll for new completed orders
    useEffect(() => {
        const checkUnreadOrders = async () => {
            try {
                const res = await fetch('/api/orders/user/badge');
                if (res.ok) {
                    const data = await res.json();
                    setUnreadOrders(data.count || 0);
                }
            } catch (err) {
                // Silently fail polling
            }
        };

        checkUnreadOrders(); // initial fetch
        const interval = setInterval(checkUnreadOrders, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    // Calculate total items (sum of quantities)
    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <aside
            className={`glass-panel ${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}
            onDoubleClick={() => setIsCollapsed(!isCollapsed)}
        >
            <div className={styles.logo}>
                <span className="text-gradient">Food Lite</span>
            </div>

            <nav className={styles.nav}>
                <Link
                    href="/home"
                    className={`${styles.navItem} ${pathname === '/home' ? styles.active : ''}`}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                    <span>Home</span>
                </Link>
                <Link
                    href="/menu"
                    className={`${styles.navItem} ${pathname === '/menu' ? styles.active : ''}`}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" /></svg>
                    <span>Menu</span>
                </Link>
                <Link
                    href="/your-plate"
                    className={`${styles.navItem} ${pathname === '/your-plate' ? styles.active : ''}`}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20" /><path d="M2 12h20" /><circle cx="12" cy="12" r="10" /></svg>
                    <span>Your Plate</span>
                </Link>
                <Link
                    href="/cart"
                    className={`${styles.navItem} ${pathname === '/cart' ? styles.active : ''}`}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
                    <span>Cart</span>
                    {totalItems > 0 && <span className={styles.badge}>{totalItems}</span>}
                </Link>
                <Link
                    href="/orders"
                    className={`${styles.navItem} ${pathname === '/orders' ? styles.active : ''}`}
                    onClick={() => setUnreadOrders(0)} // Clear badge on view
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                    <span>Order History</span>
                    {unreadOrders > 0 && <span className={styles.badge} style={{ background: '#ef4444' }}>{unreadOrders}</span>}
                </Link>

                <Link
                    href="/complaints"
                    className={`${styles.navItem} ${pathname === '/complaints' ? styles.active : ''}`}
                    style={{ color: '#f59e0b' }}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                    <span>Help & Support</span>
                </Link>

            </nav>

            <div className={styles.bottomNav}>
                <Link
                    href="/settings"
                    className={`${styles.navItem} ${pathname === '/settings' ? styles.active : ''}`}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                    <span>User Settings</span>
                </Link>
                <button className={styles.logoutBtn} onClick={() => signOut({ callbackUrl: '/login' })}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}
