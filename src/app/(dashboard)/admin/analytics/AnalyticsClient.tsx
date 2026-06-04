"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./analytics.module.css";

export default function AnalyticsClient() {
    const [selectedDate, setSelectedDate] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    });

    const [calendarMonth, setCalendarMonth] = useState(() => new Date());
    const [metrics, setMetrics] = useState({ dailyRevenue: 0, totalOrders: 0, popularItem: 'N/A' });
    const [orders, setOrders] = useState<any[]>([]);
    const [orderDates, setOrderDates] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

    const fetchData = useCallback(async (date: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/analytics?date=${date}`);
            const data = await res.json();
            setMetrics(data.metrics);
            setOrders(data.orders || []);
            setOrderDates(data.orderDates || []);
        } catch (err) {
            console.error("Failed to fetch analytics:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData(selectedDate);
    }, [selectedDate, fetchData]);

    const handleDateClick = (dateStr: string) => {
        setSelectedDate(dateStr);
    };

    // Calendar rendering
    const renderCalendar = () => {
        const year = calendarMonth.getFullYear();
        const month = calendarMonth.getMonth();

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        const cells: React.ReactNode[] = [];

        // Empty cells for days before the 1st
        for (let i = 0; i < firstDay; i++) {
            cells.push(<div key={`empty-${i}`} className={styles.calendarDay} />);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isSelected = dateStr === selectedDate;
            const isToday = dateStr === todayStr;
            const hasOrders = orderDates.includes(dateStr);

            cells.push(
                <button
                    key={day}
                    onClick={() => handleDateClick(dateStr)}
                    className={`${styles.calendarDay} ${isSelected ? styles.calendarDaySelected : ''} ${isToday ? styles.calendarDayToday : ''}`}
                    style={{ position: 'relative' }}
                >
                    {day}
                    {hasOrders && !isSelected && (
                        <span style={{
                            position: 'absolute', bottom: '4px', left: '50%', transform: 'translateX(-50%)',
                            width: '5px', height: '5px', borderRadius: '50%',
                            background: '#10b981'
                        }} />
                    )}
                </button>
            );
        }

        return (
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                {/* Calendar Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <button
                        onClick={() => setCalendarMonth(new Date(year, month - 1, 1))}
                        style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.5rem 0.75rem', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem' }}
                    >
                        ‹
                    </button>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'white', fontWeight: 600 }}>
                        {monthNames[month]} {year}
                    </h3>
                    <button
                        onClick={() => setCalendarMonth(new Date(year, month + 1, 1))}
                        style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.5rem 0.75rem', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem' }}
                    >
                        ›
                    </button>
                </div>

                {/* Day Names */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '0.5rem'
                }}>
                    {dayNames.map(d => (
                        <div key={d} style={{
                            textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)',
                            padding: '0.4rem 0', fontWeight: 600, textTransform: 'uppercase'
                        }}>
                            {d}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px'
                }}>
                    {cells}
                </div>

                {/* Quick Jump */}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                    <button
                        onClick={() => {
                            setCalendarMonth(new Date());
                            handleDateClick(todayStr);
                        }}
                        style={{
                            background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)',
                            color: '#818cf8', padding: '0.4rem 1rem', borderRadius: '8px', cursor: 'pointer',
                            fontSize: '0.8rem', fontWeight: 600
                        }}
                    >
                        Jump to Today
                    </button>
                </div>
            </div>
        );
    };

    const displayDate = new Date(selectedDate + "T00:00:00");

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className="text-gradient">Order Analytics</h1>
                <p className="text-secondary">
                    Select a date on the calendar to view orders and revenue.
                </p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '2rem', alignItems: 'start' }}>

                {/* Left: Calendar */}
                {renderCalendar()}

                {/* Right: Metrics */}
                <div>
                    <h2 style={{ fontSize: '1.25rem', color: 'white', marginBottom: '1.5rem' }}>
                        📅 {displayDate.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </h2>

                    {loading ? (
                        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            Loading analytics...
                        </div>
                    ) : (
                        <div className={styles.metricsGrid} style={{ marginBottom: '0' }}>
                            <div className={styles.metricCard}>
                                <div className={styles.metricIconWrap}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                                </div>
                                <div className={styles.metricDetails}>
                                    <h3>Revenue</h3>
                                    <p className={styles.metricValue}>₹{metrics.dailyRevenue.toFixed(2)}</p>
                                </div>
                            </div>

                            <div className={styles.metricCard}>
                                <div className={styles.metricIconWrap}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                                </div>
                                <div className={styles.metricDetails}>
                                    <h3>Orders</h3>
                                    <p className={styles.metricValue}>{metrics.totalOrders}</p>
                                </div>
                            </div>

                            <div className={styles.metricCard}>
                                <div className={styles.metricIconWrap}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
                                </div>
                                <div className={styles.metricDetails}>
                                    <h3>Top Item</h3>
                                    <p className={styles.metricValue}>{metrics.popularItem}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Full-width Order Ledger below */}
            {!loading && (
                <div className={styles.ledgerSection} style={{ marginTop: '2rem' }}>
                    <h2>Order Ledger</h2>
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Time</th>
                                    <th>Customer</th>
                                    <th>Items</th>
                                    <th>Value</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className={styles.emptyState}>No orders on this date.</td>
                                    </tr>
                                ) : (
                                    orders.map((order: any) => (
                                        <tr key={order.id} onClick={() => setSelectedOrder(order)} style={{ cursor: 'pointer' }}>
                                            <td className={styles.orderId} style={{ color: '#3b82f6', textDecoration: 'underline' }}>
                                                #{order.id.slice(-6).toUpperCase()}
                                            </td>
                                            <td>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                            <td style={{ fontSize: '0.85rem' }}>{order.user?.name || order.user?.username || 'N/A'}</td>
                                            <td className={styles.itemList}>
                                                {order.orderItems.map((item: any, i: number) => (
                                                    <span key={i}>{item.quantity}x {item.menuItem.name}{i < order.orderItems.length - 1 ? ', ' : ''}</span>
                                                ))}
                                            </td>
                                            <td className={styles.value}>₹{order.totalAmount.toFixed(2)}</td>
                                            <td>
                                                <span className={`${styles.statusBadge} ${styles[order.status.toLowerCase()]}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Order Detail Popup Modal */}
            {selectedOrder && (
                <div
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 1000
                    }}
                    onClick={() => setSelectedOrder(null)}
                >
                    <div
                        className="glass-panel animate-fade-in"
                        onClick={e => e.stopPropagation()}
                        style={{
                            width: '90%', maxWidth: '500px', borderRadius: '16px',
                            padding: '2rem', background: 'rgba(15, 23, 42, 0.97)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
                            maxHeight: '85vh', overflowY: 'auto'
                        }}
                    >
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0, fontSize: '1.3rem', color: 'white' }}>
                                Order #{selectedOrder.id.slice(-6).toUpperCase()}
                            </h2>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                style={{
                                    background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white',
                                    width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer',
                                    fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >✕</button>
                        </div>

                        {/* User Details */}
                        <div style={{
                            background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)',
                            borderRadius: '12px', padding: '1rem', marginBottom: '1rem'
                        }}>
                            <h3 style={{ fontSize: '0.8rem', color: '#818cf8', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                👤 Student Details
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                <div>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Name</span>
                                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: 'white' }}>
                                        {selectedOrder.user.name || selectedOrder.user.username || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Roll Number</span>
                                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: 'white' }}>
                                        {selectedOrder.user.rollNumber || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Department</span>
                                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: 'white' }}>
                                        {selectedOrder.user.department || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Semester</span>
                                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: 'white' }}>
                                        {selectedOrder.user.semester || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Order Info */}
                        <div style={{
                            background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)',
                            borderRadius: '12px', padding: '1rem', marginBottom: '1rem'
                        }}>
                            <h3 style={{ fontSize: '0.8rem', color: '#4ade80', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                🍽 Order Details
                            </h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Time</span>
                                <span style={{ color: 'white', fontSize: '0.85rem', fontWeight: 600 }}>
                                    {new Date(selectedOrder.createdAt).toLocaleString([], {
                                        dateStyle: 'medium', timeStyle: 'short'
                                    })}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Status</span>
                                <span className={`${styles.statusBadge} ${styles[selectedOrder.status.toLowerCase()]}`}>
                                    {selectedOrder.status}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Total</span>
                                <span style={{ color: '#22c55e', fontSize: '1.1rem', fontWeight: 700 }}>₹{selectedOrder.totalAmount.toFixed(2)}</span>
                            </div>
                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.5rem' }}>
                                {selectedOrder.orderItems.map((item: any, i: number) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0' }}>
                                        <span style={{ color: 'white', fontSize: '0.85rem' }}>{item.quantity}x {item.menuItem.name}</span>
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>₹{item.priceAtTime.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Payment Information */}
                        <div style={{
                            background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)',
                            borderRadius: '12px', padding: '1rem', marginBottom: '1rem'
                        }}>
                            <h3 style={{ fontSize: '0.8rem', color: '#38bdf8', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                💳 Payment Information
                            </h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Payment Method</span>
                                <span style={{ color: 'white', fontSize: '0.85rem', fontWeight: 600 }}>
                                    {selectedOrder.paymentId ? 'Razorpay' : 'N/A'}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Transaction ID</span>
                                {selectedOrder.paymentId ? (
                                    <span style={{
                                        color: '#38bdf8', fontSize: '0.8rem', fontWeight: 600,
                                        fontFamily: 'monospace', background: 'rgba(56, 189, 248, 0.1)',
                                        padding: '0.2rem 0.5rem', borderRadius: '6px',
                                        maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                                    }}>
                                        {selectedOrder.paymentId}
                                    </span>
                                ) : (
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                                        No payment recorded
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Review Section */}
                        <div style={{
                            background: 'rgba(250, 204, 21, 0.1)', border: '1px solid rgba(250, 204, 21, 0.2)',
                            borderRadius: '12px', padding: '1rem'
                        }}>
                            <h3 style={{ fontSize: '0.8rem', color: '#facc15', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                ⭐ Customer Review
                            </h3>
                            {selectedOrder.rating ? (
                                <>
                                    <div style={{ display: 'flex', gap: '2px', marginBottom: '0.5rem' }}>
                                        {[1, 2, 3, 4, 5].map((s: number) => (
                                            <span key={s} style={{ fontSize: '1.3rem', color: s <= selectedOrder.rating ? '#facc15' : 'rgba(255,255,255,0.15)' }}>★</span>
                                        ))}
                                        <span style={{ marginLeft: '0.5rem', color: 'white', fontWeight: 600 }}>{selectedOrder.rating}/5</span>
                                    </div>
                                    {selectedOrder.review ? (
                                        <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontStyle: 'italic', margin: 0, lineHeight: 1.5 }}>
                                            &ldquo;{selectedOrder.review}&rdquo;
                                        </p>
                                    ) : (
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>Rating given, no written review.</p>
                                    )}
                                </>
                            ) : (
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>No review submitted yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
