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
    const [searchTerm, setSearchTerm] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);

    // Filter logic
    const pendingOrders = orders.filter(o => o.status === "PENDING");
    const cookingOrders = orders.filter(o => o.status === "COOKING");
    
    // Filter ready orders by order ID or username
    const readyOrders = orders.filter(o => {
        if (o.status !== "READY") return false;
        if (!searchTerm) return true;
        
        const searchUpper = searchTerm.toUpperCase();
        const orderIdMatch = o.id.toUpperCase().includes(searchUpper);
        const usernameMatch = o.user?.username?.toUpperCase().includes(searchUpper);
        const nameMatch = o.user?.name?.toUpperCase().includes(searchUpper);
        
        return orderIdMatch || usernameMatch || nameMatch;
    });

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
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <span>{order.user.username?.split('_deleted_')[0]}</span>
                        {order.user.userType === 'FACULTY' ? (
                            <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'rgba(236,72,153,0.15)', color: '#f472b6', border: '1px solid rgba(236,72,153,0.2)', fontWeight: 700, textTransform: 'uppercase' }}>Faculty</span>
                        ) : (
                            <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)', fontWeight: 700, textTransform: 'uppercase' }}>Student</span>
                        )}
                    </div>
                    {order.user.isDeleted && (
                        <div style={{
                            marginTop: '0.4rem',
                            padding: '0.3rem 0.5rem',
                            background: 'rgba(239, 68, 68, 0.08)',
                            border: '1px solid rgba(239, 68, 68, 0.18)',
                            borderRadius: '6px',
                            color: '#f87171',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            textAlign: 'center'
                        }}>
                            ⚠️ Account Deleted
                        </div>
                    )}
                    {(order.user.rollNumber || order.user.department || (order.user.userType !== 'FACULTY' && order.user.semester)) && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                            {order.user.rollNumber && (
                                <span>{order.user.userType === 'FACULTY' ? 'ID: ' : 'Roll: '}{order.user.rollNumber}</span>
                            )}
                            {order.user.department && <span style={{ color: 'var(--primary)' }}>{order.user.department}</span>}
                            {order.user.userType !== 'FACULTY' && order.user.semester && <span>Sem {order.user.semester}</span>}
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

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                {nextStatus && (
                    <button
                        className={`${styles.actionBtn} ${btnStyle}`}
                        onClick={() => handleUpdateStatus(order.id, nextStatus)}
                        disabled={isUpdating}
                        style={{ flex: 1, padding: '0.65rem 0.5rem', fontSize: '0.85rem' }}
                    >
                        {actionText}
                    </button>
                )}
                <button
                    className={styles.actionBtn}
                    onClick={() => {
                        const confirmMsg = `Are you sure you want to cancel this order?${order.paymentId ? ' (This will trigger a refund)' : ''}`;
                        if (confirm(confirmMsg)) {
                            handleUpdateStatus(order.id, 'CANCELLED');
                        }
                    }}
                    disabled={isUpdating}
                    style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#fca5a5',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        flex: nextStatus ? '0 0 auto' : '1',
                        width: nextStatus ? 'auto' : '100%',
                        padding: '0.65rem 1rem',
                        fontSize: '0.85rem'
                    }}
                >
                    Cancel
                </button>
            </div>
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

                    <div className={styles.searchWrapper}>
                        <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search by ID or Name..."
                            className={styles.searchInput}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {readyOrders.length === 0 && searchTerm && (
                        <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            No orders matching "{searchTerm}"
                        </div>
                    )}

                    {readyOrders.map(order =>
                        renderOrderCard(order, "COMPLETED", styles.btnComplete, "Complete Order")
                    )}
                </div>
            </div>
        </div>
    );
}
