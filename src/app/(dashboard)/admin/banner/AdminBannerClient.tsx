'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BannerSettings } from '@prisma/client';
import styles from '../menu/adminMenu.module.css'; // Reusing existing beautiful Admin tables/inputs

export default function AdminBannerClient({ banners, menuItems }: { banners: BannerSettings[], menuItems: any[] }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Default to the first banner in the array
    const [activeTabId, setActiveTabId] = useState(banners[0]?.id || '1');

    // Keep all banner state in an object mapped by ID
    const initialForms = banners.reduce((acc: any, b) => {
        acc[b.id] = {
            id: b.id,
            title: b.title,
            description: b.description,
            price: b.price?.toString() || '',
            imageUrl: b.imageUrl,
            menuItemId: b.menuItemId || ''
        };
        return acc;
    }, {});

    const [forms, setForms] = useState(initialForms);

    const activeForm = forms[activeTabId];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForms({
            ...forms,
            [activeTabId]: {
                ...activeForm,
                [e.target.name]: e.target.value
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await fetch('/api/admin/banner', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...activeForm,
                    price: activeForm.price ? parseFloat(activeForm.price) : null
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to update banner');
            }

            setMessage({ type: 'success', text: `Banner ${activeTabId} updated successfully! Changes are live on the User Portal.` });
            router.refresh();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`glass-panel ${styles.adminContainer}`} style={{ maxWidth: '800px', margin: '0' }}>
            {message.text && (
                <div style={{
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '2rem',
                    fontWeight: 500,
                    background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: message.type === 'success' ? '#10b981' : '#ef4444',
                    border: message.type === 'success' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)'
                }}>
                    {message.text}
                </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                {banners.map((b, idx) => (
                    <button
                        key={b.id}
                        onClick={() => setActiveTabId(b.id)}
                        style={{
                            background: activeTabId === b.id ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                            color: 'white', border: '1px solid rgba(255,255,255,0.1)',
                            padding: '0.8rem 1.5rem', borderRadius: '8px', cursor: 'pointer',
                            fontWeight: activeTabId === b.id ? 700 : 500,
                            transition: 'all 0.2s ease'
                        }}
                    >
                        Banner Slot {idx + 1}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Headline Title</label>
                    <input
                        type="text"
                        name="title"
                        value={activeForm.title}
                        onChange={handleChange}
                        style={{
                            padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white', fontSize: '1rem'
                        }}
                        required
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Description Subtext</label>
                    <textarea
                        name="description"
                        value={activeForm.description}
                        onChange={handleChange}
                        style={{
                            padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white', fontSize: '1rem', minHeight: '100px'
                        }}
                        required
                    />
                </div>

                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                        <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Display Price (Optional)</label>
                        <input
                            type="number"
                            name="price"
                            value={activeForm.price}
                            onChange={handleChange}
                            step="0.01"
                            style={{
                                padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white', fontSize: '1rem'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 2 }}>
                        <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Hero Image URL</label>
                        <input
                            type="url"
                            name="imageUrl"
                            value={activeForm.imageUrl}
                            onChange={handleChange}
                            style={{
                                padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white', fontSize: '1rem'
                            }}
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 2 }}>
                        <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Connected Menu Item (1-Click Cart)</label>
                        <select
                            name="menuItemId"
                            value={activeForm.menuItemId}
                            onChange={handleChange}
                            style={{
                                padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white', fontSize: '1rem'
                            }}
                        >
                            <option value="" style={{ background: '#0a0a0a' }}>--- No Item Linked ---</option>
                            {menuItems.map(item => (
                                <option key={item.id} value={item.id} style={{ background: '#0a0a0a' }}>
                                    {item.name} - ₹{item.price} ({item.category})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Live Preview Pane */}
                <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px dashed rgba(255,255,255,0.2)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Live Image Preview</span>
                    <div style={{ marginTop: '1rem', width: '100%', height: '200px', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={activeForm.imageUrl || 'https://via.placeholder.com/800x400?text=Invalid+URL'}
                            alt="Banner Preview"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=Invalid+Image+URL'; }}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                        marginTop: '1rem', padding: '1rem', background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '1rem',
                        cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.5 : 1, transition: 'opacity 0.2s ease',
                        alignSelf: 'flex-start', minWidth: '200px'
                    }}
                >
                    {isLoading ? 'Pushing CMS Update...' : 'Update Landing Banner'}
                </button>
            </form>
        </div>
    );
}
