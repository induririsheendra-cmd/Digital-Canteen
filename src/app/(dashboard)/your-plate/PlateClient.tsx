"use client";

import { useState } from "react";
import { MenuItem } from "@prisma/client";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import styles from "./plate.module.css";

interface PlateClientProps {
    items: MenuItem[];
    categories: { id: string; name: string; label: string; limit: number }[];
}

export default function PlateClient({ items, categories = [] }: PlateClientProps) {
    const { addToCart } = useCart();
    const router = useRouter();

    // State to track selected item IDs
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const handleToggle = (item: MenuItem, currentCategoryCount: number, limit: number) => {
        const isSelected = selectedIds.has(item.id);

        if (isSelected) {
            // Remove it
            const newSet = new Set(selectedIds);
            newSet.delete(item.id);
            setSelectedIds(newSet);
        } else {
            // Add it, but check limit first
            if (currentCategoryCount >= limit) {
                // Limit reached, don't allow selection
                alert(`You can only select up to ${limit} items in this category.`);
                return;
            }
            const newSet = new Set(selectedIds);
            newSet.add(item.id);
            setSelectedIds(newSet);
        }
    };

    const handlePlaceOrder = () => {
        // Convert selected IDs back to MenuItems and add each to the global cart.
        const selectedItems = items.filter(i => selectedIds.has(i.id));
        selectedItems.forEach(item => {
            addToCart(item);
        });

        // Redirect to cart or give feedback
        alert("Combo Plate added to cart successfully!");
        router.push('/cart'); // We will build /cart next
    };

    const renderSection = (title: string, categoryKeys: string[], limit: number) => {
        // Filter items that match the given categories (e.g. RICE and BREAD are grouped)
        const sectionItems = items.filter(i => categoryKeys.includes(i.category));

        // How many items are currently selected in this section?
        const currentCount = sectionItems.filter(i => selectedIds.has(i.id)).length;
        const isLimitReached = currentCount >= limit;

        return (
            <div className={styles.section} key={title}>
                <div className={styles.sectionHeader}>
                    <h3>{title}</h3>
                    <span className={`${styles.limitBadge} ${isLimitReached ? styles.error : ''}`}>
                        {currentCount} / {limit} Selected
                    </span>
                </div>
                <div className={styles.grid}>
                    {sectionItems.map(item => {
                        const isSelected = selectedIds.has(item.id);
                        // Disable card if limit reached AND this item isn't already selected
                        const isDisabled = isLimitReached && !isSelected;

                        return (
                            <div
                                key={item.id}
                                className={`${styles.itemCard} ${isSelected ? styles.selected : ''} ${isDisabled ? styles.disabled : ''}`}
                                onClick={() => {
                                    if (!isDisabled || isSelected) {
                                        handleToggle(item, currentCount, limit);
                                    }
                                }}
                            >
                                <div className={styles.checkbox}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                                <div className={styles.itemInfo}>
                                    <span className={styles.itemName}>
                                        {item.name}
                                        <span className={`${styles.vegIndicator} ${item.isVeg ? styles.veg : styles.nonVeg}`}>
                                            {item.isVeg ? 'V' : 'NV'}
                                        </span>
                                    </span>
                                    <span className={styles.itemPrice}>₹{item.price}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // Calculate dynamic total price
    const totalPrice = items
        .filter(i => selectedIds.has(i.id))
        .reduce((sum, item) => sum + item.price, 0);

    return (
        <div className={styles.plateContainer}>
            <header className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="text-gradient">Build Your Plate</h1>
                    <p className="text-secondary">Select your favorites to create a custom combo meal.</p>
                </div>
            </header>

            {categories.map(cat => (
                renderSection(cat.label, [cat.name], cat.limit)
            ))}

            {/* Sticky Bottom Estimate Bar */}
            <div className={styles.bottomBar}>
                <div className={styles.estimate}>
                    <span className={styles.estimateLabel}>Estimated Total</span>
                    <span className={styles.totalPrice}>₹{totalPrice}</span>
                </div>
                <button
                    className={`glass-button ${styles.orderBtn} ${selectedIds.size === 0 ? styles.disabled : ''}`}
                    disabled={selectedIds.size === 0}
                    onClick={handlePlaceOrder}
                >
                    Add Plate to Cart
                </button>
            </div>
        </div>
    );
}
