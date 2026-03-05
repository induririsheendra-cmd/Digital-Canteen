'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../menu/adminMenu.module.css';

export default function AdminComplaintsClient({ initialComplaints }: { initialComplaints: any[] }) {
    const router = useRouter();
    const [complaints, setComplaints] = useState(initialComplaints);
    const [filter, setFilter] = useState('ALL'); // ALL, PENDING, RESOLVED
    const [resolvingId, setResolvingId] = useState<string | null>(null);

    // State for the inline reply box
    const [replyText, setReplyText] = useState<{ [key: string]: string }>({});

    const filteredComplaints = complaints.filter(c => {
        if (filter === 'ALL') return true;
        return c.status === filter;
    });

    const handleResolve = async (id: string) => {
        setResolvingId(id);
        const textToSubmit = replyText[id] || '';

        try {
            const res = await fetch('/api/admin/complaints', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    complaintId: id,
                    status: 'RESOLVED',
                    adminReply: textToSubmit
                })
            });

            if (!res.ok) throw new Error('Failed to update complaint');

            const updatedData = await res.json();

            // Update local state instantly
            setComplaints(prev => prev.map(c => c.id === id ? { ...c, ...updatedData } : c));

        } catch (error) {
            console.error(error);
            alert('Failed to resolve complaint.');
        } finally {
            setResolvingId(null);
        }
    };

    return (
        <div className={styles.container}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    onClick={() => setFilter('ALL')}
                    className={`glass-button ${filter === 'ALL' ? styles.active : ''}`}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                >
                    All Tickets
                </button>
                <button
                    onClick={() => setFilter('PENDING')}
                    className={`glass-button ${filter === 'PENDING' ? styles.active : ''}`}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', color: filter === 'PENDING' ? '#f59e0b' : '' }}
                >
                    Pending
                </button>
                <button
                    onClick={() => setFilter('RESOLVED')}
                    className={`glass-button ${filter === 'RESOLVED' ? styles.active : ''}`}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', color: filter === 'RESOLVED' ? '#10b981' : '' }}
                >
                    Resolved
                </button>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))' }}>
                {filteredComplaints.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }} className="glass-panel">
                        No complaints found in this category.
                    </div>
                ) : (
                    filteredComplaints.map(complaint => (
                        <div key={complaint.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                                        From: {complaint.user.name || complaint.user.username}
                                    </h3>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        {complaint.user.department} - {complaint.user.rollNumber}
                                    </span>
                                </div>

                                <span style={{
                                    padding: '0.3rem 0.8rem',
                                    borderRadius: '20px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    background: complaint.status === 'RESOLVED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                                    color: complaint.status === 'RESOLVED' ? '#10b981' : '#f59e0b',
                                    border: complaint.status === 'RESOLVED' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)'
                                }}>
                                    {complaint.status}
                                </span>
                            </div>

                            {complaint.orderId && (
                                <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 500, background: 'rgba(99, 102, 241, 0.1)', padding: '0.5rem', borderRadius: '6px', borderLeft: '3px solid var(--primary)' }}>
                                    Linked Order (Total: ₹{complaint.order?.totalAmount}): #{complaint.orderId.slice(-6).toUpperCase()}
                                </div>
                            )}

                            <p style={{ margin: 0, padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                                "{complaint.text}"
                            </p>

                            {complaint.image && (
                                <div>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>User Uploaded Evidence:</span>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={complaint.image} alt="User Evidence" style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '8px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }} />
                                </div>
                            )}

                            {complaint.status === 'PENDING' ? (
                                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Management Reply (Optional)</label>
                                    <textarea
                                        value={replyText[complaint.id] || ''}
                                        onChange={(e) => setReplyText({ ...replyText, [complaint.id]: e.target.value })}
                                        placeholder="Type a resolution message to the user..."
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(99, 102, 241, 0.5)', color: 'white', fontSize: '0.9rem', minHeight: '80px' }}
                                    />
                                    <button
                                        onClick={() => handleResolve(complaint.id)}
                                        disabled={resolvingId === complaint.id}
                                        style={{
                                            background: '#10b981', color: 'white', padding: '0.6rem', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer',
                                            opacity: resolvingId === complaint.id ? 0.7 : 1
                                        }}
                                    >
                                        {resolvingId === complaint.id ? 'Processing...' : 'Mark as Resolved Contextually'}
                                    </button>
                                </div>
                            ) : (
                                <div style={{ marginTop: 'auto', borderTop: '1px dashed rgba(16, 185, 129, 0.3)', paddingTop: '1rem' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600, textTransform: 'uppercase' }}>Management Reply:</span>
                                    <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                                        {complaint.adminReply || "No message provided."}
                                    </p>
                                </div>
                            )}

                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
