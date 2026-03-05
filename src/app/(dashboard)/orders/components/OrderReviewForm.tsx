'use client';

import { useState } from 'react';
import styles from './orderList.module.css';

export default function OrderReviewForm({ orderId, existingRating, existingReview }: { orderId: string, existingRating?: number | null, existingReview?: string | null }) {
    const [rating, setRating] = useState<number>(existingRating || 0);
    const [hover, setHover] = useState<number>(0);
    const [review, setReview] = useState(existingReview || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
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
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess || (existingRating && !isSubmitting && !error && rating === existingRating && review === existingReview && existingRating > 0)) {
        return (
            <div className={styles.reviewSuccessCard}>
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
                {review && <p className={styles.reviewTextDisplay}>"{review}"</p>}
                <p className={styles.thanksText}>Thanks for your feedback!</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className={styles.reviewForm}>
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
