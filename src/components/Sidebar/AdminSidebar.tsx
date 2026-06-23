'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import styles from './sidebar.module.css';

export default function AdminSidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        document.documentElement.style.setProperty('--sidebar-width', isCollapsed ? '80px' : '250px');
    }, [isCollapsed]);

    return (
        <aside
            className={`glass-panel ${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}
            onDoubleClick={() => setIsCollapsed(!isCollapsed)}
        >
            <div className={styles.logo}>
                <span className={`text-gradient ${styles.fullLogo}`}>🍽 Digital Canteen</span>
                <span className={`text-gradient ${styles.collapsedLogo}`}>DC</span>
            </div>

            <nav className={styles.nav}>
                <Link
                    href="/admin"
                    className={`${styles.navItem} ${pathname === '/admin' ? styles.active : ''}`}
                    style={{ color: '#10b981' }}
                    data-tooltip="Overview"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                    <span>Overview</span>
                </Link>

                <Link
                    href="/admin/dashboard"
                    className={`${styles.navItem} ${pathname === '/admin/dashboard' ? styles.active : ''}`}
                    style={{ color: '#f59e0b' }}
                    data-tooltip="Order Board"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                    <span>Order Board</span>
                </Link>

                <Link
                    href="/admin/menu"
                    className={`${styles.navItem} ${pathname === '/admin/menu' ? styles.active : ''}`}
                    style={{ color: '#8b5cf6' }}
                    data-tooltip="Inventory"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    <span>Inventory</span>
                </Link>

                <Link
                    href="/admin/timing"
                    className={`${styles.navItem} ${pathname === '/admin/timing' ? styles.active : ''}`}
                    style={{ color: '#3b82f6' }}
                    data-tooltip="Meal Timings"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                    <span>Meal Timings</span>
                </Link>

                <Link
                    href="/admin/banner"
                    className={`${styles.navItem} ${pathname === '/admin/banner' ? styles.active : ''}`}
                    style={{ color: '#ef4444' }}
                    data-tooltip="Banner Settings"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                    <span>Banner settings</span>
                </Link>

                <Link
                    href="/admin/complaints"
                    className={`${styles.navItem} ${pathname === '/admin/complaints' ? styles.active : ''}`}
                    style={{ color: '#f59e0b' }}
                    data-tooltip="Inbox Tickets"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    <span>Inbox Tickets</span>
                </Link>

                <Link
                    href="/admin/reviews"
                    className={`${styles.navItem} ${pathname === '/admin/reviews' ? styles.active : ''}`}
                    style={{ color: '#facc15' }}
                    data-tooltip="Reviews"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                    <span>Reviews</span>
                </Link>

                <Link
                    href="/admin/analytics"
                    className={`${styles.navItem} ${pathname === '/admin/analytics' ? styles.active : ''}`}
                    style={{ color: '#10b981' }}
                    data-tooltip="Analytics"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
                    <span>Analytics</span>
                </Link>

                <Link
                    href="/admin/users"
                    className={`${styles.navItem} ${pathname === '/admin/users' ? styles.active : ''}`}
                    style={{ color: '#ec4899' }}
                    data-tooltip="Users Directory"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                    <span>Users Directory</span>
                </Link>

                <Link
                    href="/admin/notifications"
                    className={`${styles.navItem} ${pathname === '/admin/notifications' ? styles.active : ''}`}
                    style={{ color: '#06b6d4' }}
                    data-tooltip="Broadcasts"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
                    <span>Broadcasts</span>
                </Link>
            </nav>

            <div className={styles.bottomNav}>
                <button
                    className={styles.logoutBtn}
                    onClick={() => signOut({ callbackUrl: '/' })}
                    data-tooltip="Logout"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}
