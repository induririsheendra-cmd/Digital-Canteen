'use client';

import { useState, useEffect } from 'react';

type MealTiming = {
    id: string;
    category: string;
    startTime: string; // e.g., "08:00"
    endTime: string;   // e.g., "11:00"
    isManualOpen: boolean;
};

export default function AdminTimingClient() {
    const [timings, setTimings] = useState<MealTiming[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);

    useEffect(() => {
        fetchTimings();
    }, []);

    const fetchTimings = async () => {
        try {
            const res = await fetch('/api/admin/timing');
            if (res.ok) {
                const data = await res.json();
                setTimings(data);
            }
        } catch (error) {
            console.error('Failed to fetch timings', error);
        } finally {
            setLoading(false);
        }
    };

    const updateTiming = async (id: string, startTime: string, endTime: string, isManualOpen?: boolean) => {
        setSaving(id);
        try {
            const bodyData: any = { id, startTime, endTime };
            if (isManualOpen !== undefined) bodyData.isManualOpen = isManualOpen;

            const res = await fetch('/api/admin/timing', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyData),
            });

            if (!res.ok) throw new Error('Failed to update');

            // Update local state
            setTimings(prev => prev.map(t => {
                if (t.id === id) {
                    return { ...t, startTime, endTime, ...(isManualOpen !== undefined && { isManualOpen }) };
                }
                return t;
            }));
        } catch (error) {
            console.error(error);
            alert('Failed to save timings.');
        } finally {
            setSaving(null);
        }
    };

    if (loading) return <div className="loading">Loading timings...</div>;

    return (
        <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {timings.map((timing) => (
                <div key={timing.id} className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0, color: 'var(--primary)' }}>{timing.category}</h3>
                        {saving === timing.id && <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Saving...</span>}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Opens At</label>
                            <input
                                type="time"
                                value={timing.startTime}
                                onChange={(e) => updateTiming(timing.id, e.target.value, timing.endTime)}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '8px',
                                    padding: '0.75rem',
                                    color: 'var(--text-primary)',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Closes At</label>
                            <input
                                type="time"
                                value={timing.endTime}
                                onChange={(e) => updateTiming(timing.id, timing.startTime, e.target.value, timing.isManualOpen)}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '8px',
                                    padding: '0.75rem',
                                    color: 'var(--text-primary)',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Manual Override (Broadcasts to Users)</label>
                            <label style={{
                                display: 'inline-flex', alignItems: 'center', cursor: 'pointer',
                                padding: '0.5rem 0', gap: '0.75rem'
                            }}>
                                <input
                                    type="checkbox"
                                    checked={timing.isManualOpen}
                                    onChange={(e) => updateTiming(timing.id, timing.startTime, timing.endTime, e.target.checked)}
                                    style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }}
                                />
                                <span style={{ color: timing.isManualOpen ? '#4ade80' : '#ef4444', fontWeight: 600 }}>
                                    {timing.isManualOpen ? 'Manually OPENED' : 'Manually CLOSED'}
                                </span>
                            </label>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
