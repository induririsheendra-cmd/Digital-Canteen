import styles from "./orderList.module.css";
import OrderReviewForm from "./OrderReviewForm";

export default function OrderHistoryList({ orders }: { orders: any[] }) {
    if (!orders || orders.length === 0) {
        return (
            <div className={styles.emptyState}>
                <p>You haven't placed any orders yet.</p>
            </div>
        );
    }

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
        <div className={styles.listContainer}>
            <h2 className="text-secondary">Recent Orders</h2>
            <div className={styles.grid}>
                {orders.map((order) => (
                    <div key={order.id} className={styles.orderCard}>
                        <div className={styles.cardHeader}>
                            <span className={styles.orderId}>#{order.id.slice(-6).toUpperCase()}</span>
                            <span className={`${styles.badge} ${getStatusColor(order.status)}`}>
                                {order.status}
                            </span>
                        </div>

                        <div className={styles.itemsList}>
                            {order.orderItems.map((item: any, i: number) => (
                                <div key={i} className={styles.itemRow}>
                                    <span>{item.quantity}x {item.menuItem.name}</span>
                                </div>
                            ))}
                        </div>

                        <div className={styles.cardFooter}>
                            <span className={styles.date}>
                                {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className={styles.total}>₹{order.totalAmount.toFixed(2)}</span>
                        </div>

                        {order.status === 'COMPLETED' && (
                            <OrderReviewForm
                                orderId={order.id}
                                existingRating={order.rating}
                                existingReview={order.review}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
