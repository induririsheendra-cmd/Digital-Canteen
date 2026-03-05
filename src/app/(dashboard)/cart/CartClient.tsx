"use client";

import { useCart } from "@/context/CartContext";
import styles from "./cart.module.css";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface CartClientProps {
    mealTimings?: any[];
}

export default function CartClient({ mealTimings = [] }: CartClientProps) {
    const { cartItems, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);

    // Phase 6 Custom Notes
    const [orderNotes, setOrderNotes] = useState("");

    const isCategoryOpen = (catId: string) => {
        const timing = mealTimings.find(t => t.category === catId);
        if (!timing) return true; // Default open if no limits found
        if (timing.isManualOpen) return true;

        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();

        const [startH, startM] = timing.startTime.split(':').map(Number);
        const [endH, endM] = timing.endTime.split(':').map(Number);
        const startMins = startH * 60 + startM;
        const endMins = endH * 60 + endM;

        return currentTime >= startMins && currentTime <= endMins;
    };

    const openItems = cartItems.filter(item => isCategoryOpen(item.menuItem.category));
    const closedItems = cartItems.filter(item => !isCategoryOpen(item.menuItem.category));
    const hasClosedItems = closedItems.length > 0;

    const openSubtotal = openItems.reduce((acc, item) => acc + (item.menuItem.price * item.quantity), 0);
    const tax = openSubtotal * 0.05; // 5% GST
    const grandTotal = openSubtotal + tax;

    const handleCheckout = async () => {
        if (openItems.length === 0) {
            alert("There are no available items in your cart to checkout.");
            return;
        }

        setIsProcessing(true);

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cartItems: openItems,
                    totalAmount: grandTotal,
                    notes: orderNotes.trim() || null
                })
            });

            if (!res.ok) throw new Error('Checkout failed');

            // Remove only the items that were successfully ordered
            openItems.forEach(item => removeFromCart(item.id));

            router.push('/orders');
        } catch (error) {
            console.error(error);
            alert("Checkout failed. Please try again.");
            setIsProcessing(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className={styles.cartContainer}>
                <header className={styles.header}>
                    <h1 className="text-gradient">Your Cart</h1>
                    <p className="text-secondary">Review your items before checkout.</p>
                </header>
                <div className={styles.emptyState}>
                    <svg className={styles.emptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="9" cy="21" r="1" />
                        <circle cx="20" cy="21" r="1" />
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                    <h3>Your cart is empty</h3>
                    <p>Looks like you haven't added anything to your cart yet.</p>
                    <button className="glass-button" onClick={() => router.push('/menu')}>
                        Browse Menu
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.cartContainer}>
            <header className={styles.header}>
                <h1 className="text-gradient">Your Cart</h1>
                <p className="text-secondary">Review your items before checkout.</p>
            </header>

            <div className={styles.layout}>
                {/* Items List */}
                <section className={styles.itemsSection}>
                    {cartItems.map((item) => (
                        <div key={item.id} className={styles.cartItem}>
                            <div
                                className={styles.itemImage}
                                style={{ backgroundImage: `url(${item.menuItem.imageUrl})` }}
                            />
                            <div className={styles.itemInfo}>
                                <h4 className={styles.itemName}>{item.menuItem.name}</h4>
                                <p className={styles.itemCategory}>{item.menuItem.category}</p>
                                <span className={styles.itemPrice}>₹{item.menuItem.price}</span>
                                {!isCategoryOpen(item.menuItem.category) && (
                                    <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem', fontWeight: 500 }}>
                                        ⚠️ Currently Closed
                                    </p>
                                )}
                            </div>

                            <div className={styles.controls}>
                                <button
                                    className={styles.controlBtn}
                                    onClick={() => updateQuantity(item.id, -1)}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>
                                </button>
                                <span className={styles.quantity}>{item.quantity}</span>
                                <button
                                    className={styles.controlBtn}
                                    onClick={() => updateQuantity(item.id, 1)}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                                </button>
                            </div>

                            <button
                                className={styles.removeBtn}
                                onClick={() => removeFromCart(item.id)}
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </section>

                {/* Order Summary */}
                <section className={styles.summarySection}>
                    <h3 className={styles.summaryHeader}>Order Summary</h3>
                    <div className={styles.summaryRow}>
                        <span>Subtotal</span>
                        <span>₹{cartTotal.toFixed(2)}</span>
                    </div>
                    <div className={styles.summaryRow}>
                        <span>Taxes (GST 5%)</span>
                        <span>₹{tax.toFixed(2)}</span>
                    </div>

                    <div className={`${styles.summaryRow} ${styles.total}`}>
                        <span>Grand Total</span>
                        <span>₹{grandTotal.toFixed(2)}</span>
                    </div>

                    <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                            Order Notes (Optional)
                        </label>
                        <textarea
                            value={orderNotes}
                            onChange={(e) => setOrderNotes(e.target.value)}
                            placeholder="Allergies? Extra spicy? Describe here..."
                            style={{
                                width: '100%', minHeight: '80px', padding: '0.75rem', borderRadius: '8px',
                                background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)',
                                fontSize: '0.9rem', resize: 'vertical'
                            }}
                        />
                    </div>

                    <button
                        className={`glass-button ${styles.checkoutBtn}`}
                        onClick={handleCheckout}
                        disabled={isProcessing || openItems.length === 0}
                        style={{ width: '100%' }}
                    >
                        {isProcessing ? 'Processing...' : hasClosedItems ? 'Checkout Available Items Only' : (
                            <>
                                Proceed to Checkout
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px', marginLeft: '0.5rem' }}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                            </>
                        )}
                    </button>
                </section>
            </div>
        </div>
    );
}
