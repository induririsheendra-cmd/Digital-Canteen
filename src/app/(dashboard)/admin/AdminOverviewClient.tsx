'use client';

import styles from './overview.module.css';
import Link from 'next/link';

interface OverviewProps {
    stats: {
        pendingOrders: number;
        cookingOrders: number;
        readyOrders: number;
        lowStockItems: number;
        pendingComplaints: number;
        averageRating: number;
        todaySales: number;
    }
}

export default function AdminOverviewClient({ stats }: OverviewProps) {
    const cards = [
        {
            label: "Active Orders",
            value: stats.pendingOrders + stats.cookingOrders,
            sub: `${stats.pendingOrders} Incoming, ${stats.cookingOrders} In Kitchen`,
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
            color: "#3b82f6",
            link: "/admin/dashboard"
        },
        {
            label: "Inventory Alert",
            value: stats.lowStockItems,
            sub: stats.lowStockItems > 0 ? "Items need restocking" : "All stock levels healthy",
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
            color: "#f59e0b",
            link: "/admin/menu"
        },
        {
            label: "Inbox Tickets",
            value: stats.pendingComplaints,
            sub: "Unresolved customer complaints",
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>,
            color: "#ef4444",
            link: "/admin/complaints"
        },
        {
            label: "Daily Sales",
            value: `₹${stats.todaySales.toFixed(0)}`,
            sub: "Total revenue generated today",
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
            color: "#10b981",
            link: "/admin/analytics"
        }
    ];

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={`${styles.title} text-gradient`}>Admin Overview</h1>
                <p className={styles.subtitle}>Welcome back! Here's what's happening in your canteen today.</p>
            </header>

            <div className={styles.statsGrid}>
                {cards.map((card, i) => (
                    <Link key={i} href={card.link} className={styles.statCard} style={{ '--accent-color': card.color } as any}>
                        <div className={styles.iconWrapper} style={{ background: `${card.color}20`, color: card.color }}>
                            {card.icon}
                        </div>
                        <span className={styles.statLabel}>{card.label}</span>
                        <span className={styles.statValue}>{card.value}</span>
                        <span className={styles.statSub}>{card.sub}</span>
                    </Link>
                ))}
            </div>

            <section className={styles.quickActions}>
                <h2 className={styles.sectionTitle}>
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                    Quick Actions
                </h2>
                <div className={styles.actionGrid}>
                    <Link href="/admin/timing" className={styles.actionCard}>
                        <div className={styles.actionIcon}><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
                        <div className={styles.actionText}>
                            <h4>Manage Timings</h4>
                            <p>Update meal availability slots</p>
                        </div>
                    </Link>
                    <Link href="/admin/banner" className={styles.actionCard}>
                        <div className={styles.actionIcon} style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' }}><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg></div>
                        <div className={styles.actionText}>
                            <h4>Update Banners</h4>
                            <p>Change hero images and deals</p>
                        </div>
                    </Link>
                    <Link href="/admin/notifications" className={styles.actionCard}>
                        <div className={styles.actionIcon} style={{ color: '#06b6d4', background: 'rgba(6, 182, 212, 0.1)' }}><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg></div>
                        <div className={styles.actionText}>
                            <h4>Send Broadcast</h4>
                            <p>Notify all students instantly</p>
                        </div>
                    </Link>
                </div>
            </section>
        </div>
    );
}
