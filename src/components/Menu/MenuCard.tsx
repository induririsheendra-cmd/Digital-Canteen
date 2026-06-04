"use client";

import { useState } from "react";
import { MenuItem } from "@prisma/client";
import { useCart } from "@/context/CartContext";
import styles from "@/app/(dashboard)/home/home.module.css";

interface MenuCardProps {
    item: MenuItem & { avgRating?: number; reviewCount?: number };
    isSubscribed?: boolean;
}

interface ReviewItem {
    id: string;
    rating: number;
    review: string | null;
    createdAt: string;
    user: { name: string | null; username: string | null };
    likes: number;
    dislikes: number;
}

export default function MenuCard({ item }: MenuCardProps) {
    const { addToCart, cartItems } = useCart();
    const [showReviews, setShowReviews] = useState(false);
    const [reviews, setReviews] = useState<ReviewItem[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [votingId, setVotingId] = useState<string | null>(null);

    const handleAdd = () => {
        addToCart(item);
    };

    const cartItem = cartItems.find((i) => i.menuItem.id === item.id);
    const qty = cartItem ? cartItem.quantity : 0;

    const avgRating = (item as any).avgRating || 0;
    const reviewCount = (item as any).reviewCount || 0;

    const toggleReviews = async () => {
        if (showReviews) {
            setShowReviews(false);
            return;
        }
        setShowReviews(true);
        if (reviews.length === 0) {
            setLoadingReviews(true);
            try {
                const res = await fetch(`/api/reviews/menu?menuItemId=${item.id}`);
                const data = await res.json();
                setReviews(data.reviews || []);
            } catch (err) {
                console.error("Failed to load reviews", err);
            } finally {
                setLoadingReviews(false);
            }
        }
    };

    const handleVote = async (orderId: string, vote: string) => {
        setVotingId(orderId);
        try {
            const res = await fetch('/api/reviews/vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, vote })
            });
            const data = await res.json();

            // Update local state
            setReviews(prev => prev.map(r => {
                if (r.id !== orderId) return r;
                if (data.action === 'removed') {
                    return { ...r, likes: r.likes - (vote === 'LIKE' ? 1 : 0), dislikes: r.dislikes - (vote === 'DISLIKE' ? 1 : 0) };
                } else if (data.action === 'created') {
                    return { ...r, likes: r.likes + (vote === 'LIKE' ? 1 : 0), dislikes: r.dislikes + (vote === 'DISLIKE' ? 1 : 0) };
                } else if (data.action === 'switched') {
                    return {
                        ...r,
                        likes: r.likes + (vote === 'LIKE' ? 1 : -1),
                        dislikes: r.dislikes + (vote === 'DISLIKE' ? 1 : -1)
                    };
                }
                return r;
            }));
        } catch (err) {
            console.error("Vote failed", err);
        } finally {
            setVotingId(null);
        }
    };

    return (
        <div className={`glass-panel ${styles.menuCard}`} style={{ position: 'relative' }}>
            <div
                className={styles.cardImage}
                style={{ backgroundImage: `url(${item.imageUrl})` }}
            >
                <div className={styles.categoryBadge}>
                    {item.category} {item.isVeg ? "(Veg)" : "(Non-Veg)"}
                </div>
            </div>
            <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                    <h4>{item.name}</h4>
                </div>

                {/* Star Rating Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <div style={{ display: 'flex', gap: '1px' }}>
                        {[1, 2, 3, 4, 5].map(s => (
                            <span key={s} style={{
                                fontSize: '0.85rem',
                                color: s <= Math.round(avgRating) ? '#facc15' : 'rgba(255,255,255,0.15)'
                            }}>★</span>
                        ))}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {avgRating > 0 ? avgRating.toFixed(1) : '—'}
                    </span>
                    {reviewCount > 0 && (
                        <button
                            onClick={toggleReviews}
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                fontSize: '0.7rem', color: '#3b82f6',
                                padding: '0 0.25rem', textDecoration: 'underline'
                            }}
                        >
                            {showReviews ? 'Hide' : `${reviewCount} review${reviewCount > 1 ? 's' : ''}`}
                        </button>
                    )}
                </div>

                {item.description && <p className={styles.description}>{item.description}</p>}

                <div className={styles.cardFooter}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span className={styles.price}>₹{item.price}</span>
                      {item.stock <= 10 && item.stock > 0 && (
                        <span style={{ fontSize: '0.65rem', color: '#f97316', fontWeight: 600 }}>
                          Only {item.stock} left!
                        </span>
                      )}
                      {item.stock > 10 && (
                         <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                           Stock: {item.stock}
                         </span>
                      )}
                    </div>
                    <button
                        className={`glass-button ${styles.addBtn} ${qty > 0 ? styles.activeAdd : ""}`}
                        onClick={handleAdd}
                        disabled={item.stock === 0 || !item.available || (qty >= item.stock)}
                        style={{ 
                          opacity: (item.stock === 0 || !item.available || (qty >= item.stock)) ? 0.5 : 1, 
                          cursor: (item.stock === 0 || !item.available || (qty >= item.stock)) ? 'not-allowed' : 'pointer' 
                        }}
                    >
                        {item.stock === 0 || !item.available ? 'Out of Stock' : (qty >= item.stock) ? 'Max Limit' : qty > 0 ? `Added (${qty})` : (
                            <>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                                Add
                            </>
                        )}
                    </button>
                </div>

                {/* Review Popup */}
                {showReviews && (
                    <div style={{
                        marginTop: '0.75rem', paddingTop: '0.75rem',
                        borderTop: '1px solid rgba(255,255,255,0.08)',
                        maxHeight: '200px', overflowY: 'auto'
                    }}>
                        {loadingReviews ? (
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Loading...</p>
                        ) : reviews.length === 0 ? (
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>No written reviews yet.</p>
                        ) : (
                            reviews.map(r => (
                                <div key={r.id} style={{
                                    marginBottom: '0.6rem', padding: '0.5rem',
                                    background: 'rgba(0,0,0,0.2)', borderRadius: '8px'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                            {r.user.name || r.user.username || 'User'}
                                        </span>
                                        <div style={{ display: 'flex', gap: '1px' }}>
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <span key={s} style={{ fontSize: '0.65rem', color: s <= r.rating ? '#facc15' : 'rgba(255,255,255,0.15)' }}>★</span>
                                            ))}
                                        </div>
                                    </div>
                                    {r.review && (
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.25rem 0', fontStyle: 'italic', lineHeight: 1.4 }}>
                                            "{r.review}"
                                        </p>
                                    )}
                                    {/* Like / Dislike */}
                                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.3rem' }}>
                                        <button
                                            onClick={() => handleVote(r.id, 'LIKE')}
                                            disabled={votingId === r.id}
                                            style={{
                                                background: 'none', border: 'none', cursor: 'pointer',
                                                fontSize: '0.75rem', color: '#22c55e',
                                                display: 'flex', alignItems: 'center', gap: '0.2rem', padding: 0
                                            }}
                                        >
                                            👍 <span>{r.likes}</span>
                                        </button>
                                        <button
                                            onClick={() => handleVote(r.id, 'DISLIKE')}
                                            disabled={votingId === r.id}
                                            style={{
                                                background: 'none', border: 'none', cursor: 'pointer',
                                                fontSize: '0.75rem', color: '#ef4444',
                                                display: 'flex', alignItems: 'center', gap: '0.2rem', padding: 0
                                            }}
                                        >
                                            👎 <span>{r.dislikes}</span>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
