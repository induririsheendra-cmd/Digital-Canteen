'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OrderNotifier() {
    const [notification, setNotification] = useState<{ id: string, message: string, status: string } | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Poll every 10 seconds for newly updated, unnotified orders
        const interval = setInterval(async () => {
            try {
                const res = await fetch('/api/orders/polling');
                if (res.ok) {
                    const data = await res.json();
                    if (data.newOrders && data.newOrders.length > 0) {
                        const order = data.newOrders[0];
                        let message = '';
                        let displayStatus = order.status;

                        if (order.status === 'COOKING') message = `Order #${order.id.slice(-6).toUpperCase()} is now being prepared!`;
                        if (order.status === 'READY') message = `Order #${order.id.slice(-6).toUpperCase()} is ready for pickup!`;
                        if (order.status === 'COMPLETED') message = `Order #${order.id.slice(-6).toUpperCase()} is finished. Enjoy your meal!`;

                        if (message) {
                            setNotification({
                                id: order.id,
                                message,
                                status: order.status
                            });
                        }
                    }
                }
            } catch (error) {
                console.error("Polling error", error);
            }
        }, 10000);

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

    const getStatusStyles = () => {
        switch (notification.status) {
            case 'COOKING': return { bg: 'rgba(59, 130, 246, 0.95)', border: '#3b82f6', title: 'Processing Order' };
            case 'READY': return { bg: 'rgba(16, 185, 129, 0.95)', border: '#10b981', title: 'Food is Ready!' };
            case 'COMPLETED': return { bg: 'rgba(139, 92, 246, 0.95)', border: '#8b5cf6', title: 'Order Finished' };
            default: return { bg: 'rgba(16, 185, 129, 0.95)', border: '#10b981', title: 'Notice' };
        }
    };

    const styles = getStatusStyles();

    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: styles.bg,
            border: `1px solid ${styles.border}`,
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
            {notification.status === 'COOKING' ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '24px', height: '24px' }}><path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" /></svg>
            ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '24px', height: '24px' }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
            )}
            <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{styles.title}</h4>
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
