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

    // ── Order detail modal ──────────────────────────────────────────────
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
    const [loadingOrder, setLoadingOrder] = useState(false);

    const openOrderDetail = async (orderId: string) => {
        setLoadingOrder(true);
        try {
            const res = await fetch(`/api/admin/order/${orderId}`);
            if (!res.ok) throw new Error('Order not found');
            const data = await res.json();
            setSelectedOrder(data);
        } catch (err) {
            console.error(err);
            alert('Could not load order details.');
        } finally {
            setLoadingOrder(false);
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
                                <button
                                    onClick={() => openOrderDetail(complaint.orderId)}
                                    disabled={loadingOrder}
                                    style={{
                                        all: 'unset',
                                        display: 'block',
                                        fontSize: '0.85rem',
                                        color: 'var(--primary)',
                                        fontWeight: 500,
                                        background: 'rgba(99, 102, 241, 0.1)',
                                        padding: '0.5rem 0.75rem',
                                        borderRadius: '6px',
                                        borderLeft: '3px solid var(--primary)',
                                        cursor: loadingOrder ? 'wait' : 'pointer',
                                        transition: 'background 0.2s',
                                        textAlign: 'left',
                                        width: '100%',
                                        boxSizing: 'border-box',
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)')}
                                    title="Click to view order details"
                                >
                                    🔗 Linked Order (Total: ₹{complaint.order?.totalAmount}): #{complaint.orderId.slice(-6).toUpperCase()}
                                    <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', opacity: 0.7 }}>↗ View details</span>
                                </button>
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

            {/* ── Order Detail Modal ── */}
            {selectedOrder && (
                <div
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 1000
                    }}
                    onClick={() => setSelectedOrder(null)}
                >
                    <div
                        className="glass-panel animate-fade-in"
                        onClick={e => e.stopPropagation()}
                        style={{
                            width: '90%', maxWidth: '500px', borderRadius: '16px',
                            padding: '2rem', background: 'rgba(15, 23, 42, 0.97)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
                            maxHeight: '85vh', overflowY: 'auto'
                        }}
                    >
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0, fontSize: '1.3rem', color: 'white' }}>
                                Order #{selectedOrder.id.slice(-6).toUpperCase()}
                            </h2>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                style={{
                                    background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white',
                                    width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer',
                                    fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >✕</button>
                        </div>

                        {/* User Details */}
                        {(() => {
                            const isFaculty = selectedOrder.user?.userType === 'FACULTY';
                            return (
                                <div style={{
                                    background: isFaculty ? 'rgba(236, 72, 153, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                                    border: isFaculty ? '1px solid rgba(236, 72, 153, 0.2)' : '1px solid rgba(99, 102, 241, 0.2)',
                                    borderRadius: '12px', padding: '1rem', marginBottom: '1rem'
                                }}>
                                    <h3 style={{ fontSize: '0.8rem', color: isFaculty ? '#f472b6' : '#818cf8', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        👤 {isFaculty ? 'Faculty Details' : 'Student Details'}
                                    </h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                        <div>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Name</span>
                                            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: 'white' }}>
                                                {(selectedOrder.user?.name || selectedOrder.user?.username)?.split('_deleted_')[0] || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{isFaculty ? 'Faculty ID' : 'Roll Number'}</span>
                                            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: 'white' }}>
                                                {selectedOrder.user?.rollNumber || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Department</span>
                                            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: 'white' }}>
                                                {selectedOrder.user?.department || 'N/A'}
                                            </p>
                                        </div>
                                        {!isFaculty && (
                                            <div>
                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Semester</span>
                                                <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: 'white' }}>
                                                    {selectedOrder.user?.semester || 'N/A'}
                                                </p>
                                            </div>
                                        )}
                                        {selectedOrder.user?.isDeleted && (
                                            <div style={{
                                                gridColumn: 'span 2', marginTop: '0.5rem',
                                                padding: '0.4rem 0.6rem', background: 'rgba(239, 68, 68, 0.08)',
                                                border: '1px solid rgba(239, 68, 68, 0.18)', borderRadius: '6px',
                                                color: '#f87171', fontSize: '0.8rem', fontWeight: 600, textAlign: 'center'
                                            }}>
                                                ⚠️ Account Deleted
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Order Items */}
                        <div style={{
                            background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)',
                            borderRadius: '12px', padding: '1rem', marginBottom: '1rem'
                        }}>
                            <h3 style={{ fontSize: '0.8rem', color: '#4ade80', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                🍽 Order Details
                            </h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Time</span>
                                <span style={{ color: 'white', fontSize: '0.85rem', fontWeight: 600 }}>
                                    {new Date(selectedOrder.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Status</span>
                                <span style={{
                                    padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700,
                                    background: selectedOrder.status === 'COMPLETED' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)',
                                    color: selectedOrder.status === 'COMPLETED' ? '#10b981' : '#f59e0b',
                                }}>
                                    {selectedOrder.status}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Total</span>
                                <span style={{ color: '#22c55e', fontSize: '1.1rem', fontWeight: 700 }}>₹{selectedOrder.totalAmount.toFixed(2)}</span>
                            </div>
                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.5rem' }}>
                                {selectedOrder.orderItems.map((item: any, i: number) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0' }}>
                                        <span style={{ color: 'white', fontSize: '0.85rem' }}>{item.quantity}x {item.menuItem.name}</span>
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>₹{item.priceAtTime.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Payment */}
                        <div style={{
                            background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)',
                            borderRadius: '12px', padding: '1rem', marginBottom: '1rem'
                        }}>
                            <h3 style={{ fontSize: '0.8rem', color: '#38bdf8', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                💳 Payment Information
                            </h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Payment Method</span>
                                <span style={{ color: 'white', fontSize: '0.85rem', fontWeight: 600 }}>
                                    {selectedOrder.paymentId ? 'Razorpay' : 'N/A'}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Transaction ID</span>
                                {selectedOrder.paymentId ? (
                                    <span style={{
                                        color: '#38bdf8', fontSize: '0.85rem', fontWeight: 600,
                                        fontFamily: 'monospace', background: 'rgba(56, 189, 248, 0.1)',
                                        padding: '0.2rem 0.5rem', borderRadius: '6px',
                                        maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                                    }}>
                                        {selectedOrder.paymentId}
                                    </span>
                                ) : (
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                                        No payment recorded
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Review */}
                        <div style={{
                            background: 'rgba(250, 204, 21, 0.1)', border: '1px solid rgba(250, 204, 21, 0.2)',
                            borderRadius: '12px', padding: '1rem'
                        }}>
                            <h3 style={{ fontSize: '0.8rem', color: '#facc15', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                ⭐ Customer Review
                            </h3>
                            {selectedOrder.rating ? (
                                <>
                                    <div style={{ display: 'flex', gap: '2px', marginBottom: '0.5rem' }}>
                                        {[1, 2, 3, 4, 5].map((s: number) => (
                                            <span key={s} style={{ fontSize: '1.3rem', color: s <= selectedOrder.rating ? '#facc15' : 'rgba(255,255,255,0.15)' }}>★</span>
                                        ))}
                                        <span style={{ marginLeft: '0.5rem', color: 'white', fontWeight: 600 }}>{selectedOrder.rating}/5</span>
                                    </div>
                                    {selectedOrder.review ? (
                                        <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontStyle: 'italic', margin: 0, lineHeight: 1.5 }}>
                                            &ldquo;{selectedOrder.review}&rdquo;
                                        </p>
                                    ) : (
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>Rating given, no written review.</p>
                                    )}
                                </>
                            ) : (
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>No review submitted yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
