'use client';

import { useState, useEffect } from 'react';

interface ReviewData {
    id: string;
    rating: number;
    review: string | null;
    totalAmount: number;
    createdAt: string;
    user: {
        id: string;
        name: string | null;
        username: string | null;
        email: string | null;
    };
    orderItems: {
        quantity: number;
        menuItem: { name: string };
    }[];
}

export default function AdminReviewsClient() {
    const [reviews, setReviews] = useState<ReviewData[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [filterRating, setFilterRating] = useState<number>(0);

    const fetchReviews = async () => {
        try {
            const res = await fetch('/api/admin/reviews');
            const data = await res.json();
            setReviews(data.reviews || []);
        } catch (err) {
            console.error('Failed to fetch reviews', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchReviews(); }, []);

    const handleDelete = async (orderId: string) => {
        if (!confirm('Delete this review? This cannot be undone.')) return;
        setDeletingId(orderId);
        try {
            await fetch('/api/admin/reviews', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId })
            });
            setReviews(prev => prev.filter(r => r.id !== orderId));
        } catch (err) {
            console.error('Failed to delete review', err);
        } finally {
            setDeletingId(null);
        }
    };

    const avgRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
        : '0';

    const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: reviews.filter(r => r.rating === star).length
    }));

    const filteredReviews = filterRating > 0
        ? reviews.filter(r => r.rating === filterRating)
        : reviews;

    if (loading) {
        return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading reviews...</div>;
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ marginBottom: '2rem' }}>
                <h1 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Customer Reviews</h1>
                <p className="text-secondary">View and moderate user feedback on orders.</p>
            </header>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {/* Average Rating Card */}
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', fontWeight: 700, color: '#facc15' }}>{avgRating}</div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginBottom: '0.5rem' }}>
                        {[1, 2, 3, 4, 5].map(s => (
                            <span key={s} style={{ fontSize: '1.2rem', color: s <= Math.round(Number(avgRating)) ? '#facc15' : 'rgba(255,255,255,0.2)' }}>★</span>
                        ))}
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{reviews.length} total reviews</p>
                </div>

                {/* Rating Distribution */}
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Distribution</h3>
                    {ratingCounts.map(({ star, count }) => {
                        const pct = reviews.length > 0 ? (count / reviews.length * 100) : 0;
                        return (
                            <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', cursor: 'pointer' }}
                                onClick={() => setFilterRating(filterRating === star ? 0 : star)}
                            >
                                <span style={{ fontSize: '0.8rem', width: '15px', color: filterRating === star ? '#facc15' : 'var(--text-secondary)' }}>{star}★</span>
                                <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ width: `${pct}%`, height: '100%', background: '#facc15', borderRadius: '4px', transition: 'width 0.3s' }} />
                                </div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', width: '25px', textAlign: 'right' }}>{count}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Quick Stats */}
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#22c55e' }}>{ratingCounts[0].count + ratingCounts[1].count}</div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Positive reviews (4-5★)</p>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#ef4444', marginTop: '0.5rem' }}>{ratingCounts[3].count + ratingCounts[4].count}</div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Negative reviews (1-2★)</p>
                </div>
            </div>

            {filterRating > 0 && (
                <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Filtering: {filterRating}★ reviews</span>
                    <button onClick={() => setFilterRating(0)} style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', borderRadius: '6px', padding: '0.2rem 0.6rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                        Clear filter ✕
                    </button>
                </div>
            )}

            {/* Reviews List */}
            {filteredReviews.length === 0 ? (
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderRadius: '16px' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>No reviews found.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {filteredReviews.map(r => (
                        <div key={r.id} className="glass-panel" style={{ padding: '1.25rem', borderRadius: '12px', transition: 'transform 0.2s' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                                {/* Left: User + Rating */}
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                        <div style={{
                                            width: '36px', height: '36px', borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: 700, fontSize: '0.9rem', color: 'white', flexShrink: 0
                                        }}>
                                            {(r.user.name || r.user.username || '?').charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                                                {r.user.name || r.user.username || 'Unknown User'}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                {r.user.email || r.user.username} • Order #{r.id.slice(-6).toUpperCase()}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stars */}
                                    <div style={{ display: 'flex', gap: '2px', marginBottom: '0.5rem' }}>
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <span key={s} style={{ fontSize: '1.1rem', color: s <= r.rating ? '#facc15' : 'rgba(255,255,255,0.15)' }}>★</span>
                                        ))}
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                                            {new Date(r.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    {/* Review text */}
                                    {r.review && (
                                        <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.5, margin: '0.5rem 0', fontStyle: 'italic' }}>
                                            "{r.review}"
                                        </p>
                                    )}

                                    {/* Order items */}
                                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                                        {r.orderItems.map((item, i) => (
                                            <span key={i} style={{
                                                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                                padding: '0.15rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', color: 'var(--text-secondary)'
                                            }}>
                                                {item.quantity}x {item.menuItem.name}
                                            </span>
                                        ))}
                                        <span style={{ fontSize: '0.8rem', color: '#22c55e', fontWeight: 600, marginLeft: '0.25rem' }}>₹{r.totalAmount.toFixed(0)}</span>
                                    </div>
                                </div>

                                {/* Right: Delete button */}
                                <button
                                    onClick={() => handleDelete(r.id)}
                                    disabled={deletingId === r.id}
                                    style={{
                                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                                        color: '#fca5a5', borderRadius: '8px', padding: '0.4rem 0.8rem',
                                        fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap',
                                        opacity: deletingId === r.id ? 0.5 : 1, transition: 'all 0.2s'
                                    }}
                                >
                                    {deletingId === r.id ? 'Deleting...' : '🗑 Delete'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
