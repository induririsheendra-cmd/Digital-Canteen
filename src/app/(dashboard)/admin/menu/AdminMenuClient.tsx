"use client";

import { useState, useEffect } from "react";
import styles from "./adminMenu.module.css";
import { MenuItem } from "@prisma/client";

export default function AdminMenuClient({ initialItems }: { initialItems: MenuItem[] }) {
    const [items, setItems] = useState<MenuItem[]>(initialItems);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState<string>("BEVERAGES");
    const [activePlateSection, setActivePlateSection] = useState<string>("ALL");
    const [dietFilter, setDietFilter] = useState<"ALL" | "VEG" | "NON_VEG">("ALL");
    const [isUpdating, setIsUpdating] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);
    
    // Dynamic Plate Categories State
    const [plateCategories, setPlateCategories] = useState<{ id: string, name: string, label: string, limit: number }[]>([]);
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategoryData, setNewCategoryData] = useState({ name: "", label: "", limit: "1" });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('/api/admin/plate-categories');
                if (res.ok) {
                    const data = await res.json();
                    setPlateCategories(data);
                }
            } catch (err) {
                console.error("Failed to load plate categories:", err);
            }
        };
        fetchCategories();
    }, []);

    const isPlateCategory = (cat: string) => plateCategories.some(c => c.name === cat);

    const handleAddCategory = async () => {
        const { name, label, limit } = newCategoryData;
        if (!name.trim() || !label.trim()) {
            showToast("Category Code and Label are required.", "error");
            return;
        }

        try {
            const res = await fetch('/api/admin/plate-categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name.trim().toUpperCase(),
                    label: label.trim(),
                    limit: parseInt(limit) || 1
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to create category");
            }

            const newCat = await res.json();
            setPlateCategories(prev => [...prev, newCat]);
            setNewItem(prev => ({ ...prev, category: newCat.name }));
            setNewCategoryData({ name: "", label: "", limit: "1" });
            setIsAddingCategory(false);
            showToast("Plate section added successfully!");
        } catch (err: any) {
            console.error(err);
            showToast(err.message || "Failed to add category", "error");
        }
    };

    const handleDeleteCategory = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete the plate section "${name}"? Existing items in this section will no longer be visible in the Plate Builder.`)) return;

        try {
            const res = await fetch(`/api/admin/plate-categories?id=${id}`, {
                method: 'DELETE'
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to delete category");
            }

            setPlateCategories(prev => prev.filter(c => c.id !== id));
            if (newItem.category === name) {
                setNewItem(prev => ({ ...prev, category: plateCategories[0]?.name || "RICE" }));
            }
            // Reset sub-section filter if the deleted section was active
            if (activePlateSection === name) {
                setActivePlateSection("ALL");
            }
            showToast("Plate section deleted successfully!");
        } catch (err: any) {
            console.error(err);
            showToast(err.message || "Failed to delete category", "error");
        }
    };

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

    const filteredItems = items.filter(item => {
        // Search filter
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        // Category filter
        if (activeCategory === "YOUR_PLATE") {
            if (!isPlateCategory(item.category)) return false;
            // Sub-section filter within Your Plate
            if (activePlateSection !== "ALL" && item.category !== activePlateSection) return false;
        } else if (activeCategory === "BEVERAGES") {
            if (item.category !== "BEVERAGES" && item.category !== "BEVERAGE") return false;
        } else {
            if (item.category !== activeCategory) return false;
        }

        // Diet filter only applies when not in Beverages or Your Plate mode
        if (activeCategory !== "BEVERAGES" && activeCategory !== "YOUR_PLATE" && dietFilter !== "ALL") {
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
                                // Pre-select the active plate sub-section if one is picked
                                defaultCategory = activePlateSection !== "ALL" ? activePlateSection : (plateCategories[0]?.name || "RICE");
                            } else if (activeCategory === "BEVERAGES") {
                                defaultCategory = "BEVERAGES";
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
                        onClick={() => {
                            setActiveCategory(cat.id);
                            // Reset sub-section filter when switching tabs
                            setActivePlateSection("ALL");
                        }}
                    >
                        <h3>{cat.name}</h3>
                    </div>
                ))}
            </section>

            {/* When in Your Plate mode: show plate sub-section buttons */}
            {activeCategory === "YOUR_PLATE" ? (
                <section className={styles.filterSection}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <button
                            onClick={() => setActivePlateSection("ALL")}
                            style={{
                                padding: '0.4rem 1rem',
                                borderRadius: '999px',
                                border: activePlateSection === "ALL" ? '1px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.15)',
                                background: activePlateSection === "ALL" ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                                color: activePlateSection === "ALL" ? 'white' : 'var(--text-secondary)',
                                fontWeight: '600',
                                fontSize: '0.82rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            All Sections
                        </button>
                        {plateCategories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActivePlateSection(cat.name)}
                                style={{
                                    padding: '0.4rem 1rem',
                                    borderRadius: '999px',
                                    border: activePlateSection === cat.name ? '1px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.15)',
                                    background: activePlateSection === cat.name ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                                    color: activePlateSection === cat.name ? 'white' : 'var(--text-secondary)',
                                    fontWeight: '600',
                                    fontSize: '0.82rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </section>
            ) : activeCategory !== "BEVERAGES" ? (
                /* Dietary Toggle (Hidden for Beverages and Your Plate) */
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
            ) : null}

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

                                            {/* Support for Your Plate builder categories */}
                                            {plateCategories.map(cat => (
                                                <option key={cat.id} value={cat.name} style={{ background: '#0a0a0a' }}>
                                                    PLATE: {cat.name}
                                                </option>
                                            ))}
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
                                    value={isPlateCategory(newItem.category) ? "PLATE" : newItem.category}
                                    onChange={e => {
                                        const val = e.target.value;
                                        if (val === "PLATE") {
                                            setNewItem({ ...newItem, category: "RICE" });
                                        } else {
                                            setNewItem({ ...newItem, category: val });
                                        }
                                    }}
                                >
                                    <option value="BREAKFAST">BREAKFAST</option>
                                    <option value="LUNCH">LUNCH</option>
                                    <option value="SNACKS">SNACKS</option>
                                    <option value="DINNER">DINNER</option>
                                    <option value="BEVERAGES">BEVERAGES</option>
                                    <option value="PLATE">PLATE (Your Plate)</option>
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
                                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => setNewItem({ ...newItem, isVeg: true })}
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem',
                                            borderRadius: '8px',
                                            border: newItem.isVeg ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                                            background: newItem.isVeg ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                            color: newItem.isVeg ? '#4ade80' : 'var(--text-secondary)',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            textAlign: 'center',
                                            outline: 'none'
                                        }}
                                    >
                                        🟢 Veg
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNewItem({ ...newItem, isVeg: false })}
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem',
                                            borderRadius: '8px',
                                            border: !newItem.isVeg ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.1)',
                                            background: !newItem.isVeg ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                            color: !newItem.isVeg ? '#f87171' : 'var(--text-secondary)',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            textAlign: 'center',
                                            outline: 'none'
                                        }}
                                    >
                                        🔴 Non-Veg
                                    </button>
                                </div>
                            </div>
                        </div>

                        {isPlateCategory(newItem.category) && (
                            <div className={styles.formGroup} style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <label style={{ margin: 0 }}>Plate Section *</label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsAddingCategory(!isAddingCategory);
                                                setIsDeleteMode(false);
                                            }}
                                            className={styles.miniBtnSuccess}
                                        >
                                            {isAddingCategory ? "Cancel" : "+ Add"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsDeleteMode(!isDeleteMode);
                                                setIsAddingCategory(false);
                                            }}
                                            className={isDeleteMode ? styles.miniBtnDangerActive : styles.miniBtnDanger}
                                        >
                                            {isDeleteMode ? "Done" : "- Delete"}
                                        </button>
                                    </div>
                                </div>

                                {isAddingCategory && (
                                    <div style={{
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        border: '1px solid rgba(255, 255, 255, 0.08)',
                                        borderRadius: '8px',
                                        padding: '0.75rem',
                                        marginBottom: '0.75rem',
                                        display: 'grid',
                                        gridTemplateColumns: '1.5fr 1.5fr 1fr auto',
                                        gap: '0.5rem',
                                        alignItems: 'end'
                                    }}>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Code (e.g. EXTRA)</label>
                                            <input
                                                type="text"
                                                placeholder="EXTRA"
                                                value={newCategoryData.name}
                                                onChange={e => setNewCategoryData({ ...newCategoryData, name: e.target.value })}
                                                style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#fff', width: '100%' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Label (e.g. 🍳 Extra)</label>
                                            <input
                                                type="text"
                                                placeholder="🍳 Extra"
                                                value={newCategoryData.label}
                                                onChange={e => setNewCategoryData({ ...newCategoryData, label: e.target.value })}
                                                style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#fff', width: '100%' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Limit</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={newCategoryData.limit}
                                                onChange={e => setNewCategoryData({ ...newCategoryData, limit: e.target.value })}
                                                style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#fff', width: '100%' }}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleAddCategory}
                                            style={{
                                                background: 'var(--accent-primary)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                padding: '0.4rem 0.8rem',
                                                fontSize: '0.8rem',
                                                cursor: 'pointer',
                                                fontWeight: '600',
                                                height: 'fit-content',
                                                marginBottom: '2px'
                                            }}
                                        >
                                            Save
                                        </button>
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                                    {plateCategories.map(sub => {
                                        const isActive = newItem.category === sub.name;
                                        return (
                                            <div key={sub.id} style={{ position: 'relative' }}>
                                                <button
                                                    type="button"
                                                    disabled={isDeleteMode}
                                                    onClick={() => setNewItem({ ...newItem, category: sub.name })}
                                                    style={{
                                                        padding: '0.5rem 0.9rem',
                                                        borderRadius: '6px',
                                                        border: isActive ? '1px solid var(--accent-primary)' : '1px solid rgba(255, 255, 255, 0.1)',
                                                        background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                                        color: isActive ? 'white' : 'var(--text-secondary)',
                                                        fontWeight: '600',
                                                        cursor: isDeleteMode ? 'not-allowed' : 'pointer',
                                                        transition: 'all 0.2s ease',
                                                        outline: 'none',
                                                        fontSize: '0.85rem'
                                                    }}
                                                >
                                                    {sub.label}
                                                </button>
                                                {isDeleteMode && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteCategory(sub.id, sub.name)}
                                                        style={{
                                                            position: 'absolute',
                                                            top: '-8px',
                                                            right: '-8px',
                                                            background: '#ef4444',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '50%',
                                                            width: '18px',
                                                            height: '18px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '10px',
                                                            cursor: 'pointer',
                                                            boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                                                            fontWeight: 'bold',
                                                            zIndex: 10
                                                        }}
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

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
