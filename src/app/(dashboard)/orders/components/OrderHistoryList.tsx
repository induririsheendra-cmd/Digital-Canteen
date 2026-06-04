'use client';

import { useState, useMemo } from "react";
import styles from "./orderList.module.css";
import dashboardStyles from "../orders.module.css";
import OrderReviewForm from "./OrderReviewForm";

type OrderStatus = 'ALL' | 'ACTIVE' | 'COMPLETED';

export default function OrderHistoryList({ orders }: { orders: any[] }) {
    const [filter, setFilter] = useState<OrderStatus>('ALL');

    // Stats calculation
    const stats = useMemo(() => {
        const totalAmount = orders.reduce((acc, order) => acc + order.totalAmount, 0);
        const activeCount = orders.filter(o => ['PENDING', 'COOKING', 'READY'].includes(o.status)).length;
        return {
            totalOrders: orders.length,
            totalSpent: totalAmount,
            activeOrders: activeCount
        };
    }, [orders]);

    const filteredOrders = useMemo(() => {
        if (filter === 'ALL') return orders;
        if (filter === 'ACTIVE') return orders.filter(o => ['PENDING', 'COOKING', 'READY'].includes(o.status));
        return orders.filter(o => o.status === 'COMPLETED');
    }, [orders, filter]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING": return styles.statusPending;
            case "COOKING": return styles.statusCooking;
            case "READY": return styles.statusReady;
            case "COMPLETED": return styles.statusCompleted;
            default: return styles.statusDefault;
        }
    };

    return (
        <div className={styles.wrapper}>
            {/* Stats Section */}
            <div className={dashboardStyles.statsGrid}>
                <div className={dashboardStyles.statCard}>
                    <span className={dashboardStyles.statLabel}>Total Orders</span>
                    <span className={dashboardStyles.statValue}>{stats.totalOrders}</span>
                    <span className={`${dashboardStyles.statTrending} text-accent`}>Lifetime orders</span>
                </div>
                <div className={dashboardStyles.statCard}>
                    <span className={dashboardStyles.statLabel}>Total Spent</span>
                    <span className={dashboardStyles.statValue}>₹{stats.totalSpent.toFixed(0)}</span>
                    <span className={`${dashboardStyles.statTrending} text-accent`}>Wallet impact</span>
                </div>
                <div className={dashboardStyles.statCard}>
                    <span className={dashboardStyles.statLabel}>Active Orders</span>
                    <span className={dashboardStyles.statValue}>{stats.activeOrders}</span>
                    <span className={`${dashboardStyles.statTrending} text-accent`}>In the kitchen</span>
                </div>
            </div>

            <div className={styles.listContainer}>
                <div className={styles.listHeader}>
                    <h2 className="text-gradient">Your Order Feed</h2>
                    
                    <div className={styles.tabs}>
                        <button 
                            className={`${styles.tab} ${filter === 'ALL' ? styles.activeTab : ''}`}
                            onClick={() => setFilter('ALL')}
                        >
                            All
                        </button>
                        <button 
                            className={`${styles.tab} ${filter === 'ACTIVE' ? styles.activeTab : ''}`}
                            onClick={() => setFilter('ACTIVE')}
                        >
                            Active {stats.activeOrders > 0 && <span className={styles.tabBadge}>{stats.activeOrders}</span>}
                        </button>
                        <button 
                            className={`${styles.tab} ${filter === 'COMPLETED' ? styles.activeTab : ''}`}
                            onClick={() => setFilter('COMPLETED')}
                        >
                            Completed
                        </button>
                    </div>
                </div>

                {filteredOrders.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>📦</div>
                        <h3>No orders found</h3>
                        <p>Try switching tabs or start ordering your favorite meals!</p>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {filteredOrders.map((order, index) => (
                            <div 
                                key={order.id} 
                                className={`${styles.orderCard} animate-scale-in`}
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <div className={styles.cardHeader}>
                                    <div className={styles.headerLeft}>
                                        <span className={styles.orderId}>#{order.id.slice(-6).toUpperCase()}</span>
                                        <span className={styles.date}>
                                            {new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                    <span className={`${styles.badge} ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </div>

                                <div className={styles.itemsList}>
                                    {order.orderItems.map((item: any, i: number) => (
                                        <div key={i} className={styles.itemRow}>
                                            <div className={styles.itemImageMini}>
                                                {item.menuItem.image ? (
                                                    <img src={item.menuItem.image} alt={item.menuItem.name} />
                                                ) : (
                                                    <div className={styles.itemPlaceholder}>🍽️</div>
                                                )}
                                            </div>
                                            <span className={styles.itemName}>{item.quantity}x {item.menuItem.name}</span>
                                            <span className={styles.itemPrice}>₹{item.menuItem.price}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className={styles.cardFooter}>
                                    <div className={styles.paymentInfo}>
                                        <span className={styles.methodLabel}>Total Paid</span>
                                        <span className={styles.total}>₹{order.totalAmount.toFixed(2)}</span>
                                    </div>
                                    
                                    {order.status === 'COMPLETED' ? (
                                        <OrderReviewForm
                                            orderId={order.id}
                                            existingRating={order.rating}
                                            existingReview={order.review}
                                        />
                                    ) : (
                                        <div className={styles.activeStatusIndicator}>
                                            <div className={styles.pulseDot}></div>
                                            <span>Tracking Live</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
