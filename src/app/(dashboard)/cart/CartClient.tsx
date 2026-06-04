"use client";

import { useCart } from "@/context/CartContext";
import styles from "./cart.module.css";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Script from "next/script";

interface CartClientProps {
    mealTimings?: any[];
}
export default function CartClient({ mealTimings = [] }: CartClientProps) {
    const { data: session, status } = useSession();
    const { cartItems, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);

    // Phase 6 Custom Notes
    const [orderNotes, setOrderNotes] = useState("");

    // Razorpay Integration State
    const [isRazorpayLoading, setIsRazorpayLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

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
        if (status !== 'authenticated') {
            alert("please sign in to continue");
            router.push('/?login=true');
            return;
        }

        if (openItems.length === 0) {
            alert("There are no available items in your cart to checkout.");
            return;
        }

        setIsProcessing(true);
        setErrorMessage("");

        try {
            // 1. Create order on server to get Razorpay orderId
            const res = await fetch('/api/payment/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: grandTotal })
            });

            if (!res.ok) throw new Error("Failed to initialize payment");
            const { orderId, amount, currency } = await res.json();

            // 2. Open Razorpay Checktout
            const options = {
                key: "rzp_test_RzPiEJMztI2gKp", // Public key from user
                amount: amount,
                currency: currency,
                name: "Digital Canteen",
                description: "Campus Food Ordering",
                image: "https://cdn-icons-png.flaticon.com/512/3655/3655682.png", // Generic food icon
                order_id: orderId,
                handler: async function (response: any) {
                    // 3. Verify payment on server
                    const verifyRes = await fetch('/api/payment/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        })
                    });

                    const verifyData = await verifyRes.json();
                    if (verifyData.verified) {
                        // 4. Create final canteen order
                        const orderRes = await fetch('/api/orders', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                cartItems: openItems,
                                totalAmount: grandTotal,
                                notes: orderNotes.trim() || null,
                                paymentId: response.razorpay_payment_id,
                            })
                        });

                        if (orderRes.ok) {
                            openItems.forEach(item => removeFromCart(item.id));
                            router.push('/orders');
                        } else {
                            const err = await orderRes.json();
                            alert("Payment successful, but order creation failed: " + (err.error || "Unknown error"));
                        }
                    } else {
                        alert("Payment verification failed. Please contact support.");
                    }
                },
                prefill: {
                    name: "", // Could be filled from session
                    email: "",
                },
                theme: {
                    color: "#6366f1",
                },
                modal: {
                    ondismiss: function() {
                        setIsProcessing(false);
                    }
                }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.open();

        } catch (err: any) {
            console.error(err);
            alert(err.message || "Something went wrong. Please try again.");
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
                        {isProcessing ? 'Processing...' : hasClosedItems ? 'Pay for Available Items Only' : (
                            <>
                                Pay ₹{grandTotal.toFixed(2)}
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px', marginLeft: '0.5rem' }}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                            </>
                        )}
                    </button>

                    {/* Payment Methods Preview */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginTop: '1rem' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Pay via</span>
                        <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>📱 UPI</span>
                        <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>💳 Card</span>
                        <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>🏦 Bank</span>
                    </div>
                </section>
            </div>

            <Script
                src="https://checkout.razorpay.com/v1/checkout.js"
                onLoad={() => console.log("Razorpay SDK loaded")}
            />
        </div>
    );
}
