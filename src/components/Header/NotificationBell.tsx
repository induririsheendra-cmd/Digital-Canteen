'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NotificationBell() {
    const pathname = usePathname();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Polling Mechanism
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await fetch('/api/notifications');
                if (res.ok) {
                    const data = await res.json();
                    setNotifications(data.notifications || []);
                    setUnreadCount(data.unreadCount || 0);
                }
            } catch (err) {
                console.error("Silent fail pulling notifications", err);
            }
        };

        // Suppress on public/auth routes
        if (pathname === '/login' || pathname === '/register') return;

        fetchNotifications();
        const intervalId = setInterval(fetchNotifications, 30000); // Check every 30 seconds
        return () => clearInterval(intervalId);
    }, [pathname]);

    const handleMarkAsRead = async (id: string, currentReadState: boolean) => {
        if (currentReadState) return; // Already read

        try {
            // Optimistically update UI
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));

            // Sync with DB
            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notificationId: id })
            });
        } catch (err) {
            console.error("Failed to mark as read", err);
        }
    };

    if (pathname === '/login' || pathname === '/register') return null;

    return (
        <div ref={dropdownRef} style={{ position: 'relative', display: 'flex', alignItems: 'center', zIndex: 1000 }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem',
                    color: 'var(--text-primary)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '50%', transition: 'background 0.2s'
                }}
                className="hover:bg-white/10"
                aria-label="Notifications"
            >
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>

                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute', top: '0px', right: '0px', background: '#ef4444', color: 'white',
                        fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', borderRadius: '10px',
                        minWidth: '20px', textAlign: 'center', border: '2px solid var(--background-dark)'
                    }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="glass-panel animate-fade-in" style={{
                    position: 'absolute', top: '120%', right: '0', width: '350px',
                    background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)', borderRadius: '12px', overflow: 'hidden',
                    backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)'
                }}>
                    <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'white' }}>Notifications</h3>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            {unreadCount > 0 && (
                                <span style={{ fontSize: '0.75rem', color: '#3b82f6', cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={async () => {
                                    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                                    setUnreadCount(0);
                                    try {
                                        await fetch('/api/notifications', {
                                            method: 'PATCH',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ markAll: true })
                                        });
                                    } catch (err) { console.error("Failed to mark all read", err); }
                                }}>✓ Read all</span>
                            )}
                            {notifications.length > 0 && (
                                <span style={{ fontSize: '0.75rem', color: '#ef4444', cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={async () => {
                                    setNotifications([]);
                                    setUnreadCount(0);
                                    try {
                                        await fetch('/api/notifications', { method: 'DELETE' });
                                    } catch (err) { console.error("Failed to clear notifications", err); }
                                }}>🗑 Clear all</span>
                            )}
                        </div>
                    </div>

                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                You're all caught up!
                            </div>
                        ) : (
                            notifications.map((notif: any) => (
                                <div
                                    key={notif.id}
                                    onClick={() => handleMarkAsRead(notif.id, notif.read)}
                                    style={{
                                        padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)',
                                        background: notif.read ? 'transparent' : 'rgba(59, 130, 246, 0.05)',
                                        cursor: 'pointer', transition: 'background 0.2s',
                                        display: 'flex', gap: '1rem', alignItems: 'flex-start'
                                    }}
                                    className="hover:bg-white/5"
                                >
                                    <div style={{
                                        width: '8px', height: '8px', borderRadius: '50%', marginTop: '6px', flexShrink: 0,
                                        background: notif.read ? 'transparent' : '#3b82f6'
                                    }} />

                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: notif.type === 'GLOBAL' ? '#f59e0b' : 'var(--primary)', marginBottom: '4px' }}>
                                            {notif.type}
                                        </div>
                                        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: notif.read ? 'var(--text-secondary)' : 'var(--text-primary)', lineHeight: 1.4 }}>
                                            {notif.message}
                                        </p>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>

                                            {notif.link && (
                                                <Link
                                                    href={notif.link}
                                                    style={{ fontSize: '0.75rem', color: '#3b82f6', textDecoration: 'none', background: 'rgba(59, 130, 246, 0.1)', padding: '2px 8px', borderRadius: '12px' }}
                                                    onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notif.id, notif.read); setIsOpen(false); }}
                                                >
                                                    View detail →
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
