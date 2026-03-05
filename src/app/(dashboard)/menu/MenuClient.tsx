"use client";

import { useState } from "react";
import { MenuItem } from "@prisma/client";
import MenuCard from "@/components/Menu/MenuCard";
import styles from "./menu.module.css";

export type MenuItemWithStats = MenuItem & { popularity: number; userOrderCount: number; avgRating: number; reviewCount: number; };

interface MenuClientProps {
    initialItems: MenuItemWithStats[];
    userSubscriptions: string[];
    mealTimings: any[];
}

export default function MenuClient({ initialItems, userSubscriptions, mealTimings }: MenuClientProps) {
    const [activeCategory, setActiveCategory] = useState<string>("BREAKFAST");
    const [dietFilter, setDietFilter] = useState<"ALL" | "VEG" | "NON_VEG">("ALL");
    const [sortBy, setSortBy] = useState<string>("DEFAULT");

    const categories = [
        { id: "BREAKFAST", name: "Breakfast", desc: "Start your morning right" },
        { id: "LUNCH", name: "Lunch", desc: "Hearty mid-day meals" },
        { id: "SNACKS", name: "Snacks", desc: "Quick bites & deep fried" },
        { id: "DINNER", name: "Dinner", desc: "Comforting evening dinner" },
    ];

    const isCategoryOpen = (catId: string) => {
        const timing = mealTimings?.find(t => t.category === catId);
        if (!timing) return true;
        if (timing.isManualOpen) return true;

        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();

        const [startH, startM] = timing.startTime.split(':').map(Number);
        const [endH, endM] = timing.endTime.split(':').map(Number);
        const startMins = startH * 60 + startM;
        const endMins = endH * 60 + endM;

        return currentTime >= startMins && currentTime <= endMins;
    };

    const isCurrentCategoryOpen = isCategoryOpen(activeCategory);

    const filteredItems = initialItems.filter((item) => {
        // 1. Filter by category
        if (item.category !== activeCategory) return false;

        // 2. Filter by dietary preference
        if (dietFilter === "VEG" && !item.isVeg) return false;
        if (dietFilter === "NON_VEG" && item.isVeg) return false;

        return true;
    });

    let sortedItems = [...filteredItems];
    if (sortBy === "PRICE_HL") {
        sortedItems.sort((a, b) => b.price - a.price);
    } else if (sortBy === "PRICE_LH") {
        sortedItems.sort((a, b) => a.price - b.price);
    } else if (sortBy === "POPULAR") {
        sortedItems.sort((a, b) => b.popularity - a.popularity);
    } else if (sortBy === "TOP_RATED") {
        sortedItems.sort((a, b) => b.avgRating - a.avgRating || b.reviewCount - a.reviewCount);
    } else if (sortBy === "FAVORITES") {
        sortedItems.sort((a, b) => b.userOrderCount - a.userOrderCount);
    } else {
        sortedItems.sort((a, b) => a.name.localeCompare(b.name));
    }

    return (
        <div className={styles.menuContainer}>
            <header className={styles.header}>
                <div>
                    <h1 className="text-gradient">Explore Menu</h1>
                    <p className="text-secondary">Filter by category and dietary preferences.</p>
                </div>
            </header>

            {/* Category Navigation Cards */}
            <section className={styles.categoryCards}>
                {categories.map((cat) => (
                    <div
                        key={cat.id}
                        className={`${styles.categoryCard} ${activeCategory === cat.id ? styles.active : ""
                            }`}
                        onClick={() => setActiveCategory(cat.id)}
                    >
                        <h3>{cat.name}</h3>
                        <p>{cat.desc}</p>
                    </div>
                ))}
            </section>

            {/* Dietary Toggle */}
            <section className={styles.filterSection}>
                <div className={styles.toggleContainer}>
                    <button
                        className={`${styles.toggleBtn} ${styles.all} ${dietFilter === "ALL" ? styles.active : ""
                            }`}
                        onClick={() => setDietFilter("ALL")}
                    >
                        All Items
                    </button>
                    <button
                        className={`${styles.toggleBtn} ${styles.veg} ${dietFilter === "VEG" ? styles.active : ""
                            }`}
                        onClick={() => setDietFilter("VEG")}
                    >
                        Pure Veg
                    </button>
                    <button
                        className={`${styles.toggleBtn} ${styles.nonVeg} ${dietFilter === "NON_VEG" ? styles.active : ""
                            }`}
                        onClick={() => setDietFilter("NON_VEG")}
                    >
                        Non-Veg
                    </button>
                </div>

                <div className={styles.sortContainer}>
                    <select
                        className={styles.sortDropdown}
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="DEFAULT">Sort By: Name (A-Z)</option>
                        <option value="POPULAR">Most Popular Items</option>
                        <option value="TOP_RATED">Top Rated ⭐</option>
                        <option value="FAVORITES">Your Most Ordered</option>
                        <option value="PRICE_LH">Price (Low to High)</option>
                        <option value="PRICE_HL">Price (High to Low)</option>
                    </select>
                </div>
            </section>

            {/* Closed Banner */}
            {!isCurrentCategoryOpen && (
                <div style={{
                    background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '12px', padding: '1.5rem', textAlign: 'center', marginBottom: '2rem'
                }}>
                    <h2 style={{ color: '#ef4444', margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>
                        Closed for Orders
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
                        This meal category is currently outside of its operating hours or has been temporarily paused.
                    </p>
                </div>
            )}

            {/* Food Grid */}
            <section className={styles.menuGrid}>
                {sortedItems.length > 0 ? (
                    sortedItems.map((item) => (
                        <MenuCard
                            key={item.id}
                            item={item}
                            isSubscribed={userSubscriptions.includes(item.id)}
                        />
                    ))
                ) : (
                    <div className="text-secondary" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "4rem 0" }}>
                        {isCurrentCategoryOpen ? "No items found for this category and filter." : ""}
                    </div>
                )}
            </section>
        </div>
    );
}
