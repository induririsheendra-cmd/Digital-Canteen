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
                <span className="text-gradient">CMS Core</span>
            </div>

            <nav className={styles.nav}>
                <Link
                    href="/admin/dashboard"
                    className={`${styles.navItem} ${pathname === '/admin/dashboard' ? styles.active : ''}`}
                    style={{ color: '#f59e0b' }}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                    <span>Order Board</span>
                </Link>

                <Link
                    href="/admin/menu"
                    className={`${styles.navItem} ${pathname === '/admin/menu' ? styles.active : ''}`}
                    style={{ color: '#8b5cf6' }}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                    <span>Inventory</span>
                </Link>

                <Link
                    href="/admin/timing"
                    className={`${styles.navItem} ${pathname === '/admin/timing' ? styles.active : ''}`}
                    style={{ color: '#3b82f6' }}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                    <span>Meal Timings</span>
                </Link>

                <Link
                    href="/admin/banner"
                    className={`${styles.navItem} ${pathname === '/admin/banner' ? styles.active : ''}`}
                    style={{ color: '#ef4444' }}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                    <span>Banner settings</span>
                </Link>

                <Link
                    href="/admin/complaints"
                    className={`${styles.navItem} ${pathname === '/admin/complaints' ? styles.active : ''}`}
                    style={{ color: '#f59e0b' }}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                    <span>Inbox Tickets</span>
                </Link>

                <Link
                    href="/admin/reviews"
                    className={`${styles.navItem} ${pathname === '/admin/reviews' ? styles.active : ''}`}
                    style={{ color: '#facc15' }}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                    <span>Reviews</span>
                </Link>

                <Link
                    href="/admin/analytics"
                    className={`${styles.navItem} ${pathname === '/admin/analytics' ? styles.active : ''}`}
                    style={{ color: '#10b981' }}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
                    <span>Analytics</span>
                </Link>

                <Link
                    href="/admin/notifications"
                    className={`${styles.navItem} ${pathname === '/admin/notifications' ? styles.active : ''}`}
                    style={{ color: '#06b6d4' }}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
                    <span>Broadcasts</span>
                </Link>
            </nav>

            <div className={styles.bottomNav}>
                <button className={styles.logoutBtn} onClick={() => signOut({ callbackUrl: '/login' })}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}
