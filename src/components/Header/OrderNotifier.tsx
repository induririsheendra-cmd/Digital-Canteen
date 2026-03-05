'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OrderNotifier() {
    const [notification, setNotification] = useState<{ id: string, message: string } | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Poll every 15 seconds for newly completed orders
        const interval = setInterval(async () => {
            try {
                const res = await fetch('/api/orders/polling');
                if (res.ok) {
                    const data = await res.json();
                    if (data.newOrders && data.newOrders.length > 0) {
                        // Just show the first one
                        setNotification({
                            id: data.newOrders[0].id,
                            message: `Order #${data.newOrders[0].id.slice(-6).toUpperCase()} is ready for pickup!`
                        });
                    }
                }
            } catch (error) {
                console.error("Polling error", error);
            }
        }, 15000);

        return () => clearInterval(interval);
    }, []);

    const dismissNotification = async () => {
        if (!notification) return;

        try {
            // Acknowledge so it doesn't pop up again
            await fetch('/api/orders/polling', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: notification.id })
            });
        } catch (error) {
            console.error(error);
        }

        setNotification(null);
        router.refresh();
    };

    if (!notification) return null;

    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'rgba(16, 185, 129, 0.95)',
            border: '1px solid #10b981',
            backdropFilter: 'blur(10px)',
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            animation: 'slideIn 0.3s ease-out'
        }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '24px', height: '24px' }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
            <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Food is Ready!</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>{notification.message}</p>
            </div>
            <button
                onClick={dismissNotification}
                style={{
                    background: 'transparent', border: 'none', color: 'white', opacity: 0.8,
                    cursor: 'pointer', padding: '0.5rem', marginLeft: 'auto'
                }}
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
            <style jsx>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
