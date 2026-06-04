"use client";

import { useState } from 'react';
import MenuCard from '@/components/Menu/MenuCard';
import styles from './home.module.css';

interface HomeMenuClientProps {
    items: any[];
}

export default function HomeMenuClient({ items }: HomeMenuClientProps) {
    const [filter, setFilter] = useState("All");

    const getFilteredItems = () => {
        if (filter === "All") return items;
        if (filter === "Main Course") {
            return items.filter(item => ['BREAKFAST', 'LUNCH', 'DINNER', 'RICE', 'BREAD', 'CURRY'].includes(item.category));
        }
        if (filter === "Snacks") {
            return items.filter(item => ['SNACKS', 'SWEET', 'EXTRA'].includes(item.category));
        }
        if (filter === "Beverages") {
            return items.filter(item => ['BEVERAGE', 'BEVERAGES'].includes(item.category));
        }
        return items;
    };

    const filteredItems = getFilteredItems();

    return (
        <section className={styles.menuSection}>
            <div className={styles.sectionHeader}>
                <h3>Canteen Menu</h3>
                <div className={styles.filters}>
                    <button
                        className={`${styles.filterBtn} ${filter === 'All' ? styles.active : ''}`}
                        onClick={() => setFilter('All')}
                    >
                        All
                    </button>
                    <button
                        className={`${styles.filterBtn} ${filter === 'Main Course' ? styles.active : ''}`}
                        onClick={() => setFilter('Main Course')}
                    >
                        Main Course
                    </button>
                    <button
                        className={`${styles.filterBtn} ${filter === 'Snacks' ? styles.active : ''}`}
                        onClick={() => setFilter('Snacks')}
                    >
                        Snacks
                    </button>
                    <button
                        className={`${styles.filterBtn} ${filter === 'Beverages' ? styles.active : ''}`}
                        onClick={() => setFilter('Beverages')}
                    >
                        Beverages
                    </button>
                </div>
            </div>

            <div className={styles.menuGrid}>
                {filteredItems.map(item => (
                    <MenuCard key={item.id} item={item} />
                ))}
            </div>
        </section>
    );
}
