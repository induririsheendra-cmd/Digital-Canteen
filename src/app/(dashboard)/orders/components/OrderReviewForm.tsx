'use client';

import { useState } from 'react';
import styles from './orderList.module.css';

export default function OrderReviewForm({ orderId, existingRating, existingReview }: { orderId: string, existingRating?: number | null, existingReview?: string | null }) {
    const [rating, setRating] = useState<number>(existingRating || 0);
    const [hover, setHover] = useState<number>(0);
    const [review, setReview] = useState(existingReview || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const res = await fetch(`/api/orders/${orderId}/review`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating, review }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to submit review');
            }

            setIsSuccess(true);
            setIsDeleted(false);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Delete your review? You can write a new one after.')) return;
        setIsDeleting(true);
        setError('');

        try {
            const res = await fetch(`/api/orders/${orderId}/review`, { method: 'DELETE' });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete review');
            }
            // Reset all state — show blank form again
            setRating(0);
            setReview('');
            setIsSuccess(false);
            setIsDeleted(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsDeleting(false);
        }
    };

    // Show the existing review card (submitted or already had one from DB)
    const showReviewCard =
        !isDeleted &&
        (isSuccess || (existingRating && existingRating > 0 && rating === existingRating && review === existingReview));

    if (showReviewCard) {
        return (
            <div className={styles.reviewSuccessCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div className={styles.starsDisplay}>
                        {[...Array(5)].map((_, index) => {
                            index += 1;
                            return (
                                <span key={index} className={index <= (rating || 0) ? styles.starFilled : styles.starEmpty}>
                                    ★
                                </span>
                            );
                        })}
                    </div>
                    {/* Delete review button */}
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        title="Delete your review"
                        style={{
                            background: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.2)',
                            borderRadius: '8px',
                            color: '#fca5a5',
                            padding: '0.3rem 0.6rem',
                            fontSize: '0.75rem',
                            cursor: isDeleting ? 'wait' : 'pointer',
                            fontWeight: 600,
                            transition: 'all 0.2s',
                            flexShrink: 0,
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(239,68,68,0.2)';
                            e.currentTarget.style.color = '#ef4444';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
                            e.currentTarget.style.color = '#fca5a5';
                        }}
                    >
                        {isDeleting ? '...' : '🗑 Delete'}
                    </button>
                </div>
                {review && <p className={styles.reviewTextDisplay}>"{review}"</p>}
                <p className={styles.thanksText}>Thanks for your feedback!</p>
                {error && <p className={styles.reviewError}>{error}</p>}
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className={styles.reviewForm}>
            {isDeleted && (
                <p style={{ fontSize: '0.8rem', color: '#10b981', margin: '0 0 0.5rem', fontWeight: 600 }}>
                    ✓ Review deleted — write a new one below!
                </p>
            )}
            <div className={styles.starRating}>
                {[...Array(5)].map((_, index) => {
                    index += 1;
                    return (
                        <button
                            type="button"
                            key={index}
                            className={index <= (hover || rating) ? styles.starFilled : styles.starEmpty}
                            onClick={() => setRating(index)}
                            onMouseEnter={() => setHover(index)}
                            onMouseLeave={() => setHover(rating)}
                        >
                            <span className="star">★</span>
                        </button>
                    );
                })}
            </div>

            <textarea
                placeholder="Leave a review..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className={styles.reviewTextarea}
                rows={2}
            />

            {error && <p className={styles.reviewError}>{error}</p>}

            <button
                type="submit"
                className={styles.submitReviewBtn}
                disabled={isSubmitting || rating === 0}
            >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
        </form>
    );
}
