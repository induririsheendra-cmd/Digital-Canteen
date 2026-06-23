"use client";

import { useState } from "react";
import styles from "./adminMenu.module.css";
import { MenuItem } from "@prisma/client";

export default function AdminMenuClient({ initialItems }: { initialItems: MenuItem[] }) {
    const [items, setItems] = useState<MenuItem[]>(initialItems);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState<string>("BEVERAGES");
    const [dietFilter, setDietFilter] = useState<"ALL" | "VEG" | "NON_VEG">("ALL");
    const [isUpdating, setIsUpdating] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    // Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [newItem, setNewItem] = useState({
        name: "",
        category: "BREAKFAST",
        isVeg: true,
        price: "",
        imageUrl: "",
        description: ""
    });

    // Image Search State
    const [imageSearchQuery, setImageSearchQuery] = useState("");
    const [searchedImages, setSearchedImages] = useState<{ url: string, title: string }[]>([]);
    const [isSearchingImage, setIsSearchingImage] = useState(false);

    const searchFoodImages = async () => {
        if (!imageSearchQuery.trim()) return;
        setIsSearchingImage(true);
        setSearchedImages([]);
        try {
            const res = await fetch(`/api/image-search?q=${encodeURIComponent(imageSearchQuery.trim())}`);
            const data = await res.json();

            if (data.images && data.images.length > 0) {
                setSearchedImages(data.images.map((img: any) => ({
                    url: img.url,
                    title: img.title
                })));
            } else {
                setSearchedImages([]);
                alert("No images found. Try a different search term.");
            }
        } catch (error) {
            console.error("Failed to search images", error);
            alert("Image search failed. Check if PEXELS_API_KEY is set in .env");
        } finally {
            setIsSearchingImage(false);
        }
    };

    const handleAddItem = async () => {
        if (!newItem.name || !newItem.price || !newItem.imageUrl) {
            showToast("Please fill in Name, Price, and Image URL.", "error");
            return;
        }

        setIsSaving(true);
        try {
            const endpoint = editingItemId ? `/api/menu/${editingItemId}` : "/api/menu";
            const method = editingItemId ? "PATCH" : "POST";

            const res = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newItem.name,
                    description: newItem.description,
                    price: parseFloat(newItem.price),
                    imageUrl: newItem.imageUrl,
                    category: newItem.category,
                    isVeg: newItem.isVeg
                }) /* Ensure proper casting */
            });

            if (!res.ok) throw new Error(`Failed to ${editingItemId ? 'update' : 'create'} item`);

            const { menuItem } = await res.json();

            if (editingItemId) {
                setItems(prev => prev.map(item => item.id === editingItemId ? { ...item, ...menuItem } : item));
                showToast("Item updated successfully!");
            } else {
                setItems([menuItem, ...items]);
                showToast("Item added successfully!");
            }

            // Reset state
            setIsAddModalOpen(false);
            setEditingItemId(null);
            setNewItem({
                name: "",
                category: "BREAKFAST",
                isVeg: true,
                price: "",
                imageUrl: "",
                description: ""
            });
            setSearchedImages([]);
            setImageSearchQuery("");
        } catch (error) {
            console.error(error);
            showToast(`Failed to ${editingItemId ? 'update' : 'add'} item.`, "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteItem = async (id: string) => {
        if (!confirm("Are you sure you want to permanently delete this item?")) return;

        setIsUpdating(id);
        try {
            const res = await fetch(`/api/menu/${id}`, {
                method: "DELETE"
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to delete item");
            }

            setItems(prev => prev.filter(item => item.id !== id));
            showToast("Item deleted successfully!");
        } catch (error: any) {
            console.error(error);
            showToast(error.message || "Failed to delete item.", "error");
        } finally {
            setIsUpdating(null);
        }
    };

    const updateField = async (id: string, field: string, value: any) => {
        setIsUpdating(id);
        try {
            const res = await fetch(`/api/menu/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ [field]: value })
            });

            if (!res.ok) throw new Error(`Failed to update ${field}`);

            const { menuItem } = await res.json();

            // Update local state instantly with returned source truth
            setItems(prev => prev.map(item =>
                item.id === id ? { ...item, ...menuItem } : item
            ));

        } catch (error) {
            console.error(error);
            showToast(`Failed to update ${field}.`, "error");
        } finally {
            setIsUpdating(null);
        }
    };

    const plateCats = ["RICE", "BREAD", "CURRY", "SWEET", "PLATE_BEVERAGE", "EXTRA", "BEVERAGE"];

    const filteredItems = items.filter(item => {
        // Search filter
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        // Category filter
        if (activeCategory === "YOUR_PLATE") {
            if (!plateCats.includes(item.category)) return false;
        } else if (activeCategory === "BEVERAGES") {
            if (item.category !== "BEVERAGES" && item.category !== "BEVERAGE") return false;
        } else {
            if (item.category !== activeCategory) return false;
        }

        // Diet filter
        if (activeCategory !== "BEVERAGES" && dietFilter !== "ALL") {
            if (dietFilter === "VEG" && !item.isVeg) return false;
            if (dietFilter === "NON_VEG" && item.isVeg) return false;
        }

        return true;
    });

    const categories = [
        { id: "BEVERAGES", name: "Beverages" },
        { id: "BREAKFAST", name: "Breakfast" },
        { id: "LUNCH", name: "Lunch" },
        { id: "SNACKS", name: "Snacks" },
        { id: "DINNER", name: "Dinner" },
        { id: "YOUR_PLATE", name: "Your Plate" },
    ];

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className="text-gradient">Menu Inventory</h1>
                    <p className="text-secondary">Toggle availability to instantly update the customer-facing menu.</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div className={styles.searchBox}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                        <input
                            type="text"
                            placeholder="Search items or categories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>
                    <button
                        onClick={() => {
                            let defaultCategory = "BREAKFAST";
                            if (activeCategory === "YOUR_PLATE") {
                                defaultCategory = "RICE";
                            } else if (activeCategory) {
                                defaultCategory = activeCategory;
                            }
                            setNewItem({
                                name: "",
                                category: defaultCategory,
                                isVeg: true,
                                price: "",
                                imageUrl: "",
                                description: ""
                            });
                            setEditingItemId(null);
                            setIsAddModalOpen(true);
                        }}
                        className={styles.addButton}
                    >
                        + Add Item
                    </button>
                </div>
            </header>

            {/* Category Navigation Cards */}
            <section className={styles.categoryCards}>
                {categories.map((cat) => (
                    <div
                        key={cat.id}
                        className={`${styles.categoryCard} ${activeCategory === cat.id ? styles.active : ""}`}
                        onClick={() => setActiveCategory(cat.id)}
                    >
                        <h3>{cat.name}</h3>
                    </div>
                ))}
            </section>

            {/* Dietary Toggle (Hidden for Beverages) */}
            {activeCategory !== "BEVERAGES" && (
                <section className={styles.filterSection}>
                    <div className={styles.toggleContainer}>
                        <button
                            className={`${styles.toggleBtn} ${styles.all} ${dietFilter === "ALL" ? styles.active : ""}`}
                            onClick={() => setDietFilter("ALL")}
                        >
                            All Items
                        </button>
                        <button
                            className={`${styles.toggleBtn} ${styles.veg} ${dietFilter === "VEG" ? styles.active : ""}`}
                            onClick={() => setDietFilter("VEG")}
                        >
                            Pure Veg
                        </button>
                        <button
                            className={`${styles.toggleBtn} ${styles.nonVeg} ${dietFilter === "NON_VEG" ? styles.active : ""}`}
                            onClick={() => setDietFilter("NON_VEG")}
                        >
                            Non-Veg
                        </button>
                    </div>
                </section>
            )}

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Price (₹)</th>
                            <th>Remaining Stock</th>
                            <th>Low Alert Threshold</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredItems.map(item => {
                            const isLowStock = item.stock <= item.lowStockThreshold;

                            return (
                                <tr key={item.id} className={!item.available ? styles.disabledRow : isLowStock ? styles.lowStockRow : ""}>
                                    <td>
                                        <div
                                            className={styles.itemImage}
                                            style={{ backgroundImage: `url(${item.imageUrl})` }}
                                        />
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                            <span className={styles.itemName}>{item.name}</span>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                {item.isVeg ? "VEG" : "NON-VEG"}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <select
                                            className={styles.dropdown}
                                            value={item.category}
                                            onChange={(e) => updateField(item.id, 'category', e.target.value)}
                                            disabled={isUpdating === item.id}
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                borderRadius: '6px',
                                                padding: '0.4rem',
                                                color: 'var(--text-primary)',
                                                outline: 'none',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <option value="BREAKFAST" style={{ background: '#0a0a0a' }}>BREAKFAST</option>
                                            <option value="LUNCH" style={{ background: '#0a0a0a' }}>LUNCH</option>
                                            <option value="SNACKS" style={{ background: '#0a0a0a' }}>SNACKS</option>
                                            <option value="DINNER" style={{ background: '#0a0a0a' }}>DINNER</option>
                                            <option value="BEVERAGES" style={{ background: '#0a0a0a' }}>BEVERAGES</option>

                                            {/* Support for Your Plate builder categories, though generally you wouldn't assign timing to them */}
                                            <option value="RICE" style={{ background: '#0a0a0a' }}>PLATE: RICE</option>
                                            <option value="BREAD" style={{ background: '#0a0a0a' }}>PLATE: BREAD</option>
                                            <option value="CURRY" style={{ background: '#0a0a0a' }}>PLATE: CURRY</option>
                                            <option value="SWEET" style={{ background: '#0a0a0a' }}>PLATE: SWEET</option>
                                            <option value="BEVERAGE" style={{ background: '#0a0a0a' }}>PLATE: BEVERAGE</option>
                                            <option value="EXTRA" style={{ background: '#0a0a0a' }}>PLATE: EXTRA</option>
                                        </select>
                                    </td>

                                    {/* Editable Price */}
                                    <td>
                                        <input
                                            type="number"
                                            defaultValue={item.price}
                                            className={styles.numberInput}
                                            onBlur={(e) => updateField(item.id, 'price', parseFloat(e.target.value))}
                                            step="0.01"
                                            disabled={isUpdating === item.id}
                                        />
                                    </td>

                                    {/* Editable Stock */}
                                    <td>
                                        <input
                                            type="number"
                                            defaultValue={item.stock}
                                            className={`${styles.numberInput} ${isLowStock ? styles.alertText : ''}`}
                                            onBlur={(e) => updateField(item.id, 'stock', parseInt(e.target.value))}
                                            disabled={isUpdating === item.id}
                                        />
                                        {isLowStock && <span className={styles.alertIcon}>⚠️ Low</span>}
                                    </td>

                                    {/* Editable Threshold */}
                                    <td>
                                        <input
                                            type="number"
                                            defaultValue={item.lowStockThreshold}
                                            className={styles.numberInput}
                                            onBlur={(e) => updateField(item.id, 'lowStockThreshold', parseInt(e.target.value))}
                                            disabled={isUpdating === item.id}
                                        />
                                    </td>

                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                                            <label className={styles.switch}>
                                                <input
                                                    type="checkbox"
                                                    checked={item.available}
                                                    onChange={() => updateField(item.id, 'available', !item.available)}
                                                    disabled={isUpdating === item.id || item.stock === 0}
                                                />
                                                <span className={styles.slider}></span>
                                            </label>
                                            {item.stock === 0 && <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>Depleted</span>}
                                        </div>
                                    </td>

                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => {
                                                    setNewItem({
                                                        name: item.name,
                                                        category: item.category,
                                                        isVeg: item.isVeg,
                                                        price: item.price.toString(),
                                                        imageUrl: item.imageUrl,
                                                        description: item.description || ""
                                                    });
                                                    setEditingItemId(item.id);
                                                    setIsAddModalOpen(true);
                                                }}
                                                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-primary)', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                                            >
                                                Edit Info
                                            </button>
                                            <button
                                                onClick={() => handleDeleteItem(item.id)}
                                                disabled={isUpdating === item.id}
                                                style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {filteredItems.length === 0 && (
                    <div className={styles.emptyState}>
                        <p>No menu items found matching your search.</p>
                    </div>
                )}
            </div>

            {/* Add / Edit Item Modal */}
            {isAddModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h2>{editingItemId ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className={styles.formGroup}>
                                <label>Food Item Name *</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Masala Dosa"
                                    value={newItem.name}
                                    onChange={e => {
                                        setNewItem({ ...newItem, name: e.target.value });
                                        if (!imageSearchQuery) setImageSearchQuery(e.target.value);
                                    }}
                                    maxLength={40}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Price (₹) *</label>
                                <input
                                    type="number"
                                    placeholder="e.g. 50"
                                    value={newItem.price}
                                    onChange={e => setNewItem({ ...newItem, price: e.target.value })}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className={styles.formGroup}>
                                <label>Category</label>
                                <select
                                    value={newItem.category}
                                    onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                                >
                                    <option value="BREAKFAST">BREAKFAST</option>
                                    <option value="LUNCH">LUNCH</option>
                                    <option value="SNACKS">SNACKS</option>
                                    <option value="DINNER">DINNER</option>
                                    <option value="BEVERAGES">BEVERAGES</option>
                                    <option value="RICE">PLATE: RICE</option>
                                    <option value="CURRY">PLATE: CURRY</option>
                                    <option value="BREAD">PLATE: BREAD</option>
                                    <option value="SWEET">PLATE: SWEET</option>
                                    <option value="BEVERAGE">PLATE: BEVERAGE</option>
                                    <option value="EXTRA">PLATE: EXTRA</option>
                                </select>
                            </div>

                            <div
                                className={styles.formGroup}
                                style={{
                                    opacity: (newItem.category === "BEVERAGES" || newItem.category === "BEVERAGE") ? 0.3 : 1,
                                    pointerEvents: (newItem.category === "BEVERAGES" || newItem.category === "BEVERAGE") ? "none" : "auto",
                                    transition: "opacity 0.3s ease"
                                }}
                            >
                                <label>Type</label>
                                <select
                                    value={newItem.isVeg ? "true" : "false"}
                                    onChange={e => setNewItem({ ...newItem, isVeg: e.target.value === "true" })}
                                >
                                    <option value="true">Veg</option>
                                    <option value="false">Non-Veg</option>
                                </select>
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Description (Optional) - Add ingredients or info</label>
                            <textarea
                                placeholder="A delicious south indian..."
                                value={newItem.description}
                                onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                                rows={2}
                            />
                        </div>

                        <div className={styles.imageSearchSection}>
                            <div className={styles.searchHeader}>
                                <label style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Image Search (Pexels)</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="text"
                                        value={imageSearchQuery}
                                        onChange={e => setImageSearchQuery(e.target.value)}
                                        placeholder="e.g. biryani, pizza..."
                                        style={{ padding: '0.3rem 0.6rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff', fontSize: '0.85rem' }}
                                        onKeyDown={(e) => { if (e.key === 'Enter') searchFoodImages(); }}
                                    />
                                    <button onClick={searchFoodImages} className={styles.searchBtn} disabled={isSearchingImage}>
                                        {isSearchingImage ? "Looking..." : "Search 🔍"}
                                    </button>
                                </div>
                            </div>

                            {searchedImages.length > 0 && (
                                <div className={styles.imageGrid}>
                                    {searchedImages.map((img, i) => (
                                        <div key={i} title={img.title}>
                                            <img
                                                src={img.url}
                                                className={`${styles.selectableImage} ${newItem.imageUrl === img.url ? styles.selectedImage : ''}`}
                                                onClick={() => setNewItem({ ...newItem, imageUrl: img.url })}
                                                alt={img.title}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {searchedImages.length === 0 && imageSearchQuery && !isSearchingImage && (
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Type a generic food name and click Search to find public domain images.</p>
                            )}

                            <div className={styles.formGroup} style={{ marginTop: '1rem', marginBottom: 0 }}>
                                <label>Or, manually paste an Image URL *</label>
                                <input
                                    type="text"
                                    placeholder="https://example.com/image.jpg"
                                    value={newItem.imageUrl}
                                    onChange={e => setNewItem({ ...newItem, imageUrl: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className={styles.modalActions}>
                            <button className={styles.cancelBtn} onClick={() => {
                                setIsAddModalOpen(false);
                                setEditingItemId(null);
                                setNewItem({ name: "", category: "BREAKFAST", isVeg: true, price: "", imageUrl: "", description: "" });
                                setSearchedImages([]);
                                setImageSearchQuery("");
                            }} disabled={isSaving}>Cancel</button>
                            <button className={styles.saveBtn} onClick={handleAddItem} disabled={isSaving}>
                                {isSaving ? "Saving..." : (editingItemId ? "Save Changes" : "Save Item")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Local Action Toast */}
            {toast && (
                <div style={{
                    position: 'fixed', bottom: '30px', right: '30px',
                    background: toast.type === 'error' ? 'rgba(239, 68, 68, 0.9)' : 'rgba(16, 185, 129, 0.9)',
                    border: `1px solid ${toast.type === 'error' ? '#ef4444' : '#10b981'}`,
                    color: 'white', padding: '1rem 1.5rem', borderRadius: '12px',
                    backdropFilter: 'blur(10px)', boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                    zIndex: 10000, display: 'flex', alignItems: 'center', gap: '0.75rem',
                    animation: 'slideInRight 0.3s ease-out'
                }}>
                    {toast.type === 'error' ? (
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    ) : (
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                    )}
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{toast.message}</span>
                </div>
            )}
            <style jsx>{`
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
