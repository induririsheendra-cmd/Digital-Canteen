"use client";

import { useState } from "react";
import styles from "./admin.module.css";
import { useRouter } from "next/navigation";

export default function AdminDashboardClient({
    initialOrders
}: {
    initialOrders: any[]
}) {
    const router = useRouter();
    const [orders, setOrders] = useState(initialOrders);
    const [isUpdating, setIsUpdating] = useState(false);

    // Filter logic
    const pendingOrders = orders.filter(o => o.status === "PENDING");
    const cookingOrders = orders.filter(o => o.status === "COOKING");
    const readyOrders = orders.filter(o => o.status === "READY");

    const handleUpdateStatus = async (orderId: string, newStatus: string) => {
        setIsUpdating(true);
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) throw new Error('Update failed');

            // Optimistically update UI
            setOrders(prev => prev.map(o =>
                o.id === orderId ? { ...o, status: newStatus } : o
            ));

            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Failed to update status");
        } finally {
            setIsUpdating(false);
        }
    };

    const renderOrderCard = (order: any, nextStatus: string, btnStyle: string, actionText: string) => (
        <div key={order.id} className={styles.orderCard}>
            <div className={styles.cardHeader}>
                <span className={styles.orderId}>#{order.id.slice(-6).toUpperCase()}</span>
                <span className={styles.orderTime}>
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>

            {/* Phase 6 User Profile Details */}
            {order.user && (
                <div style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                        {order.user.username}
                    </div>
                    {(order.user.rollNumber || order.user.department || order.user.semester) && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
                            {order.user.rollNumber && <span>{order.user.rollNumber}</span>}
                            {order.user.department && <span style={{ color: 'var(--primary)' }}>{order.user.department}</span>}
                            {order.user.semester && <span>Sem {order.user.semester}</span>}
                        </div>
                    )}
                </div>
            )}

            <div className={styles.orderItems}>
                {order.orderItems.map((item: any, i: number) => (
                    <div key={i} className={styles.itemRow}>
                        <span>
                            <span className={styles.itemQuantity}>{item.quantity}x</span>
                            {item.menuItem.name}
                        </span>
                        <span>₹{(item.quantity * item.priceAtTime).toFixed(2)}</span>
                    </div>
                ))}
            </div>

            {/* Phase 6 Custom Order Notes */}
            {order.notes && (
                <div style={{
                    marginTop: '1rem', padding: '0.75rem',
                    background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.2)',
                    borderRadius: '6px', fontSize: '0.85rem'
                }}>
                    <strong style={{ color: '#eab308', display: 'block', marginBottom: '0.2rem' }}>⚠️ Customer Note:</strong>
                    <span style={{ color: 'rgba(255,255,255,0.9)', fontStyle: 'italic' }}>"{order.notes}"</span>
                </div>
            )}

            <div className={styles.totalRow}>
                <span>Total</span>
                <span>₹{order.totalAmount.toFixed(2)}</span>
            </div>

            {nextStatus && (
                <button
                    className={`${styles.actionBtn} ${btnStyle}`}
                    onClick={() => handleUpdateStatus(order.id, nextStatus)}
                    disabled={isUpdating}
                >
                    {actionText}
                </button>
            )}
        </div>
    );

    return (
        <div className={styles.dashboardContainer}>
            <header className={styles.header}>
                <h1 className="text-gradient">Live Order Tracking</h1>
                <p className="text-secondary">Manage incoming digital canteen orders in real-time.</p>
            </header>

            <div className={styles.kanbanBoard}>
                {/* Pending Column */}
                <div className={styles.column}>
                    <div className={styles.columnHeader}>
                        <span className={`${styles.columnTitle} ${styles.pendingTitle}`}>Incoming</span>
                        <span className={styles.columnBadge}>{pendingOrders.length}</span>
                    </div>
                    {pendingOrders.map(order =>
                        renderOrderCard(order, "COOKING", styles.btnAccept, "Start Cooking")
                    )}
                </div>

                {/* Cooking Column */}
                <div className={styles.column}>
                    <div className={styles.columnHeader}>
                        <span className={`${styles.columnTitle} ${styles.cookingTitle}`}>In Kitchen</span>
                        <span className={styles.columnBadge}>{cookingOrders.length}</span>
                    </div>
                    {cookingOrders.map(order =>
                        renderOrderCard(order, "READY", styles.btnReady, "Mark Ready")
                    )}
                </div>

                {/* Ready Column */}
                <div className={styles.column}>
                    <div className={styles.columnHeader}>
                        <span className={`${styles.columnTitle} ${styles.readyTitle}`}>Ready For Pickup</span>
                        <span className={styles.columnBadge}>{readyOrders.length}</span>
                    </div>
                    {readyOrders.map(order =>
                        renderOrderCard(order, "COMPLETED", styles.btnComplete, "Complete Order")
                    )}
                </div>
            </div>
        </div>
    );
}
