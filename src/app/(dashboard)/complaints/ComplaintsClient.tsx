'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ComplaintsClient({ recentOrders, pastComplaints }: { recentOrders: any[], pastComplaints: any[] }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        orderId: '',
        text: '',
    });

    // Base64 Image string
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Optional: Check file size (e.g. max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError("Image is too large. Max size is 5MB.");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
                setError('');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');
        setError('');

        if (!formData.text) {
            setError('Please describe your issue.');
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/complaints', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: formData.orderId || null,
                    text: formData.text,
                    image: imagePreview
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to submit complaint');
            }

            setMessage('Your complaint has been submitted successfully. Management will review it shortly.');
            setFormData({ orderId: '', text: '' });
            setImagePreview(null);
            router.refresh();

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1fr)', gap: '2rem' }}>

            {/* Left Column: Form */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', color: 'var(--text-primary)' }}>New Complaint</h2>

                {message && <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(16,185,129,0.2)' }}>{message}</div>}
                {error && <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Relating to specific order? (Optional)</label>
                        <select
                            value={formData.orderId}
                            onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                            style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                        >
                            <option value="" style={{ background: '#0f172a' }}>-- General Feedback --</option>
                            {recentOrders.map(order => (
                                <option key={order.id} value={order.id} style={{ background: '#0f172a' }}>
                                    Order #{order.id.slice(-6).toUpperCase()} - {new Date(order.createdAt).toLocaleDateString()}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Describe the issue <span style={{ color: '#ef4444' }}>*</span></label>
                        <textarea
                            required
                            value={formData.text}
                            onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                            rows={4}
                            placeholder="I found an issue with my recent food delivery..."
                            style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', resize: 'vertical' }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Attach Evidence (Camera / Photo)</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <label style={{
                                padding: '0.75rem 1.5rem',
                                background: 'rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                border: '1px solid rgba(255,255,255,0.2)',
                                transition: 'all 0.2s'
                            }} className="hover:bg-white/20">
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                                <span>Take Photo</span>
                                {/* The capture attribute natively opens the camera on iOS/Android devices */}
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    style={{ display: 'none' }}
                                    onChange={handleImageChange}
                                />
                            </label>

                            {imagePreview && (
                                <button type="button" onClick={() => setImagePreview(null)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline' }}>
                                    Remove Image
                                </button>
                            )}
                        </div>

                        {imagePreview && (
                            <div style={{ marginTop: '1rem', width: '100%', maxWidth: '200px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={imagePreview} alt="Evidence preview" style={{ width: '100%', height: 'auto', display: 'block' }} />
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="glass-button"
                        style={{ marginTop: '1rem', opacity: isLoading ? 0.7 : 1 }}
                    >
                        {isLoading ? 'Submitting...' : 'Submit to Management'}
                    </button>

                </form>
            </div>

            {/* Right Column: History */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>Your Ticket History</h2>

                {pastComplaints.length === 0 ? (
                    <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        You have not submitted any complaints yet.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {pastComplaints.map(complaint => (
                            <div key={complaint.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{
                                        padding: '0.2rem 0.6rem',
                                        borderRadius: '12px',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        background: complaint.status === 'RESOLVED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                                        color: complaint.status === 'RESOLVED' ? '#10b981' : '#f59e0b'
                                    }}>
                                        {complaint.status}
                                    </span>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        {new Date(complaint.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                {complaint.orderId && (
                                    <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 500 }}>
                                        Linked Order: #{complaint.orderId.slice(-6).toUpperCase()}
                                    </div>
                                )}

                                <p style={{ color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>
                                    "{complaint.text}"
                                </p>

                                {complaint.adminReply && (
                                    <div style={{
                                        marginTop: '0.5rem',
                                        padding: '1rem',
                                        background: 'rgba(99, 102, 241, 0.1)',
                                        borderLeft: '3px solid var(--primary)',
                                        borderRadius: '0 8px 8px 0',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.5rem'
                                    }}>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase' }}>Management Reply</span>
                                        <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{complaint.adminReply}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}
