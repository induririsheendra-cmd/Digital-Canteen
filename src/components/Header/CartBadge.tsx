"use client";

import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

export default function CartBadge() {
    const { cartItems } = useCart();
    const router = useRouter();
    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <button
            onClick={() => router.push('/cart')}
            style={{
                position: 'relative',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                transition: 'background 0.2s',
            }}
            aria-label="Cart"
        >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {totalItems > 0 && (
                <span style={{
                    position: 'absolute',
                    top: '0px',
                    right: '0px',
                    background: '#22c55e',
                    color: 'white',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '10px',
                    minWidth: '20px',
                    textAlign: 'center',
                    border: '2px solid var(--background-dark)',
                }}>
                    {totalItems > 9 ? '9+' : totalItems}
                </span>
            )}
        </button>
    );
}
