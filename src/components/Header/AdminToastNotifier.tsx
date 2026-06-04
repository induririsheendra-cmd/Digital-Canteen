'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminToastNotifier() {
    const [activeToast, setActiveToast] = useState<{ id: string, message: string, type: string, link?: string } | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchAndToast = async () => {
            try {
                const res = await fetch('/api/notifications');
                if (res.ok) {
                    const data = await res.json();
                    const newNotifications = data.notifications || [];
                    
                    // Get already "toasted" IDs from localStorage
                    const toastedIds = JSON.parse(localStorage.getItem('admin_toasted_ids') || '[]');
                    
                    // Find the most recent notification that hasn't been toasted yet
                    // and is of type ORDER or STOCK
                    const eligible = newNotifications.find((n: any) => 
                        !toastedIds.includes(n.id) && 
                        (n.type === 'ORDER' || n.type === 'STOCK' || n.type === 'COMPLAINT')
                    );

                    if (eligible) {
                        setActiveToast({
                            id: eligible.id,
                            message: eligible.message,
                            type: eligible.type,
                            link: eligible.link
                        });

                        // Mark as toasted
                        const updatedToasted = [eligible.id, ...toastedIds].slice(0, 50); // Keep last 50
                        localStorage.setItem('admin_toasted_ids', JSON.stringify(updatedToasted));
                    }
                }
            } catch (err) {
                console.error("Silent fail pulling admin toasts", err);
            }
        };

        // Poll every 8 seconds for snappiness
        fetchAndToast();
        const intervalId = setInterval(fetchAndToast, 8000);
        return () => clearInterval(intervalId);
    }, []);

    const dismiss = () => setActiveToast(null);

    const handleAction = () => {
        if (activeToast?.link) {
            router.push(activeToast.link);
        }
        dismiss();
    };

    if (!activeToast) return null;

    const getToastStyles = () => {
        switch (activeToast.type) {
            case 'ORDER': return { bg: 'rgba(59, 130, 246, 0.95)', border: '#3b82f6', title: 'New Order Received!' };
            case 'STOCK': return { bg: 'rgba(245, 158, 11, 0.95)', border: '#f59e0b', title: 'Inventory Alert' };
            case 'COMPLAINT': return { bg: 'rgba(239, 68, 68, 0.95)', border: '#ef4444', title: 'New Complaint' };
            default: return { bg: 'rgba(30, 41, 59, 0.95)', border: '#475569', title: 'System Notice' };
        }
    };

    const styles = getToastStyles();

    return (
        <div style={{
            position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
            background: styles.bg, border: `1px solid ${styles.border}`, backdropFilter: 'blur(10px)',
            color: 'white', padding: '1rem 1.5rem', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            zIndex: 9999, display: 'flex', alignItems: 'center', gap: '1rem', animation: 'slideDown 0.4s ease-out',
            minWidth: '320px'
        }}>
            <div style={{
                width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
                {activeToast.type === 'ORDER' ? (
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                ) : activeToast.type === 'STOCK' ? (
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                ) : (
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                )}
            </div>

            <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>{styles.title}</h4>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', opacity: 0.9 }}>{activeToast.message}</p>
            </div>

            <button 
                onClick={handleAction}
                style={{
                    background: 'white', color: styles.border, border: 'none', padding: '0.4rem 0.8rem',
                    borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap'
                }}
            >
                View Details
            </button>

            <button onClick={dismiss} style={{ background: 'none', border: 'none', color: 'white', opacity: 0.6, cursor: 'pointer', padding: '4px' }}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>

            <style jsx>{`
                @keyframes slideDown {
                    from { transform: translate(-50%, -100%); opacity: 0; }
                    to { transform: translate(-50%, 0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
