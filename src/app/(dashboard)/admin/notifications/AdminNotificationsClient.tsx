'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AdminNotificationsClientProps {
    pastBroadcasts: any[];
}

export default function AdminNotificationsClient({ pastBroadcasts }: AdminNotificationsClientProps) {
    const [message, setMessage] = useState('');
    const [link, setLink] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const router = useRouter();

    const handleBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!message) {
            setStatusMessage('Error: Broadcast message cannot be empty.');
            return;
        }

        setIsSubmitting(true);
        setStatusMessage('');

        try {
            const res = await fetch('/api/admin/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, link, type: 'GLOBAL' })
            });

            if (!res.ok) throw new Error('Failed to send broadcast');

            setStatusMessage('Broadcast successfully deployed to all clients!');
            setMessage('');
            setLink('');
            router.refresh(); // Reflect the new broadcast in the history list below
        } catch (error) {
            console.error(error);
            setStatusMessage('Failed to transmit broadcast. Check server logs.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: '1fr 1fr' }}>

            {/* Left: Compose Broadcast */}
            <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path><path d="M14.05 2a9 9 0 0 1 8 7.94"></path><path d="M14.05 6A5 5 0 0 1 18 10"></path></svg>
                    New Transmission
                </h2>

                <form onSubmit={handleBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Broadcast Message *</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="e.g. The Breakfast counter is now open!"
                            style={{
                                width: '100%', padding: '1rem', borderRadius: '12px',
                                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                color: 'white', minHeight: '100px', resize: 'vertical'
                            }}
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Route Link (Optional)</label>
                        <input
                            type="text"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                            placeholder="e.g. /menu"
                            style={{
                                width: '100%', padding: '1rem', borderRadius: '12px',
                                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                color: 'white'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || !message}
                        style={{
                            padding: '1rem', borderRadius: '12px',
                            background: isSubmitting || !message ? 'rgba(255,255,255,0.1)' : '#3b82f6',
                            color: isSubmitting || !message ? 'rgba(255,255,255,0.4)' : 'white',
                            border: 'none', fontWeight: 600, cursor: isSubmitting || !message ? 'not-allowed' : 'pointer',
                            marginTop: '0.5rem', transition: 'all 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem'
                        }}
                    >
                        {isSubmitting ? 'Transmitting...' : 'FIRE BROADCAST'}
                    </button>

                    {statusMessage && (
                        <div style={{
                            padding: '1rem', borderRadius: '8px', fontSize: '0.9rem',
                            background: statusMessage.includes('Error') || statusMessage.includes('Failed') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                            color: statusMessage.includes('Error') || statusMessage.includes('Failed') ? '#ef4444' : '#10b981',
                            border: `1px solid ${statusMessage.includes('Error') || statusMessage.includes('Failed') ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`
                        }}>
                            {statusMessage}
                        </div>
                    )}
                </form>
            </div>

            {/* Right: History Log */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                    Transmission Log
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '500px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                    {pastBroadcasts.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                            No global broadcasts have been sent yet.
                        </div>
                    ) : (
                        pastBroadcasts.map((bcast: any) => (
                            <div key={bcast.id} style={{
                                padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '0.5rem'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 600, background: 'rgba(245, 158, 11, 0.1)', padding: '2px 8px', borderRadius: '12px' }}>
                                        {bcast.type}
                                    </span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                        {new Date(bcast.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>

                                <p style={{ margin: 0, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                                    {bcast.message}
                                </p>

                                {bcast.link && (
                                    <div style={{ fontSize: '0.8rem', color: '#3b82f6', marginTop: '0.25rem' }}>
                                        🔗 {bcast.link}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

        </div>
    );
}
