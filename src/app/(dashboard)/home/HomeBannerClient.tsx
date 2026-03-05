'use client';

import { useState, useEffect } from 'react';
import { MenuItem } from '@prisma/client';
import { useCart } from '@/context/CartContext';
import styles from './home.module.css';

interface BannerType {
    id: string;
    title: string;
    description: string;
    price: number | null;
    imageUrl: string;
    menuItemId: string | null;
}

interface BannerData {
    banner: BannerType;
    linkedMenuItem: MenuItem | null;
}

interface HomeBannerClientProps {
    bannersData: BannerData[];
}

export default function HomeBannerClient({ bannersData }: HomeBannerClientProps) {
    const { addToCart } = useCart();
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-rotate the carousel
    useEffect(() => {
        if (!bannersData || bannersData.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % bannersData.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [bannersData]);

    if (!bannersData || bannersData.length === 0) return null;

    const currentData = bannersData[currentIndex];
    if (!currentData) return null;

    const { banner, linkedMenuItem } = currentData;

    const handleOrderNow = () => {
        if (linkedMenuItem) {
            addToCart(linkedMenuItem);
            alert(`Added ${linkedMenuItem.name} to cart!`);
        } else {
            console.log('Routing to general menu...');
            window.location.href = '/menu';
        }
    };

    return (
        <section
            className={`glass-panel ${styles.heroBanner}`}
            style={{
                backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.4) 100%), url('${banner.imageUrl}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transition: 'background-image 0.5s ease-in-out'
            }}
        >
            <div className={styles.heroContent}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                    {banner.title}
                </h2>
                <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.9)', maxWidth: '600px', marginBottom: '1.5rem', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                    {banner.description}
                </p>

                {banner.price && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                            ₹{banner.price.toFixed(2)}
                        </span>
                        {linkedMenuItem && (
                            <span style={{ background: 'rgba(99, 102, 241, 0.8)', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.9rem', color: 'white', fontWeight: 600 }}>
                                Banner Special
                            </span>
                        )}
                    </div>
                )}

                <button
                    className="glass-button"
                    style={{ width: 'auto', padding: '0.8rem 1.5rem', fontSize: '1.1rem', fontWeight: 'bold' }}
                    onClick={handleOrderNow}
                >
                    {linkedMenuItem ? `Order ${linkedMenuItem.name.split(' ')[0]} Now` : 'View Menu'}
                </button>
            </div>

            {/* Carousel Indicators */}
            {bannersData.length > 1 && (
                <div style={{ position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.5rem' }}>
                    {bannersData.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            style={{
                                width: '10px', height: '10px', borderRadius: '50%',
                                background: currentIndex === idx ? 'var(--accent-primary)' : 'rgba(255,255,255,0.5)',
                                border: 'none', cursor: 'pointer', transition: 'all 0.3s ease'
                            }}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
