'use client';

import { useState, useMemo } from 'react';
import styles from './users.module.css';

export default function UsersClient({ initialUsers }: { initialUsers: any[] }) {
    const [users, setUsers] = useState(initialUsers);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'ALL' | 'STUDENT' | 'FACULTY'>('ALL');
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Helpers to strip out _deleted_<timestamp> suffix
    const displayEmail = (email: string | null) => {
        if (!email) return 'N/A';
        return email.split('_deleted_')[0];
    };

    const displayUsername = (username: string | null) => {
        if (!username) return '';
        return username.split('_deleted_')[0];
    };

    const handleDeleteUser = async (id: string) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this user's account? This action will soft-delete their profile while keeping all historical orders.");
        if (!confirmDelete) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/admin/users?id=${id}`, {
                method: 'DELETE'
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to delete user');
            }

            // Update user in local state
            const timestamp = Date.now();
            setUsers(prevUsers => prevUsers.map(u => {
                if (u.id === id) {
                    return {
                        ...u,
                        isDeleted: true,
                        email: u.email ? `${u.email}_deleted_${timestamp}` : null,
                        username: u.username ? `${u.username}_deleted_${timestamp}` : null
                    };
                }
                return u;
            }));

            alert("User account has been successfully deleted.");
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            const matchesType = filterType === 'ALL' || u.userType === filterType;
            if (!matchesType) return false;

            if (!searchTerm) return true;
            const searchLower = searchTerm.toLowerCase();
            return (
                (u.name && u.name.toLowerCase().includes(searchLower)) ||
                (u.username && u.username.toLowerCase().includes(searchLower)) ||
                (u.email && u.email.toLowerCase().includes(searchLower)) ||
                (u.rollNumber && u.rollNumber.toLowerCase().includes(searchLower)) ||
                (u.department && u.department.toLowerCase().includes(searchLower))
            );
        });
    }, [users, filterType, searchTerm]);

    const selectedUser = useMemo(() => {
        return users.find(u => u.id === selectedUserId);
    }, [users, selectedUserId]);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className="text-gradient">Users Directory</h1>
                <p className="text-secondary">Manage and view order histories for registered campus students and faculty.</p>
            </header>

            <div className={styles.mainLayout}>
                {/* Left Side: Users List */}
                <div className={`${styles.listPane} glass-panel`}>
                    <div className={styles.searchBar}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.searchIcon}>
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>

                    <div className={styles.filterTabs}>
                        <button
                            className={`${styles.filterTab} ${filterType === 'ALL' ? styles.activeTab : ''}`}
                            onClick={() => setFilterType('ALL')}
                        >
                            All ({users.length})
                        </button>
                        <button
                            className={`${styles.filterTab} ${filterType === 'STUDENT' ? styles.activeTab : ''}`}
                            onClick={() => setFilterType('STUDENT')}
                        >
                            Students ({users.filter(u => u.userType === 'STUDENT').length})
                        </button>
                        <button
                            className={`${styles.filterTab} ${filterType === 'FACULTY' ? styles.activeTab : ''}`}
                            onClick={() => setFilterType('FACULTY')}
                        >
                            Faculty ({users.filter(u => u.userType === 'FACULTY').length})
                        </button>
                    </div>

                    <div className={styles.userList}>
                        {filteredUsers.length === 0 ? (
                            <div className={styles.emptyState}>No users found.</div>
                        ) : (
                            filteredUsers.map(user => {
                                const isSelected = user.id === selectedUserId;
                                return (
                                    <div
                                        key={user.id}
                                        onClick={() => setSelectedUserId(user.id)}
                                        className={`${styles.userCard} ${isSelected ? styles.selectedCard : ''}`}
                                    >
                                        <div className={styles.userAvatar}>
                                            {user.name ? user.name[0].toUpperCase() : displayUsername(user.username)[0]?.toUpperCase() || '?'}
                                        </div>
                                        <div className={styles.userInfo}>
                                            <div className={styles.userNameRow}>
                                                <span className={styles.userName}>{user.name || displayUsername(user.username)}</span>
                                                <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                                                    {user.isDeleted && (
                                                        <span className={styles.deletedTag}>DELETED</span>
                                                    )}
                                                    <span className={user.userType === 'FACULTY' ? styles.facultyBadge : styles.studentBadge}>
                                                        {user.userType}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className={styles.userDetailsSub}>
                                                <span>{user.rollNumber || 'No ID'}</span>
                                                <span>•</span>
                                                <span style={{ color: '#a78bfa' }}>{user.department || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Right Side: Details & Order History */}
                <div className={`${styles.detailsPane} glass-panel`}>
                    {selectedUser ? (
                        <div className={styles.detailsContent}>
                            {/* Profile Overview */}
                            <div className={styles.profileSection} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                                <div className={styles.profileHeader}>
                                    <div className={styles.largeAvatar}>
                                        {selectedUser.name ? selectedUser.name[0].toUpperCase() : displayUsername(selectedUser.username)[0]?.toUpperCase() || '?'}
                                    </div>
                                    <div style={{ flexGrow: 1 }}>
                                        <h2 style={{ margin: 0, color: 'white', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {selectedUser.name || displayUsername(selectedUser.username)}
                                        </h2>
                                        <p style={{ margin: '0.2rem 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>@{displayUsername(selectedUser.username)}</p>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                                        <span className={selectedUser.userType === 'FACULTY' ? styles.facultyBadgeLarge : styles.studentBadgeLarge}>
                                            {selectedUser.userType}
                                        </span>
                                        {!selectedUser.isDeleted ? (
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteUser(selectedUser.id)}
                                                className={styles.deleteUserBtn}
                                                disabled={isDeleting}
                                            >
                                                Delete Account
                                            </button>
                                        ) : (
                                            <span className={styles.deletedBadgeLarge}>Account Deleted</span>
                                        )}
                                    </div>
                                </div>

                                {selectedUser.isDeleted && (
                                    <div className={styles.deletedWarningBox}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px', marginRight: '0.5rem', flexShrink: 0 }}>
                                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                            <line x1="12" y1="9" x2="12" y2="13" />
                                            <line x1="12" y1="17" x2="12.01" y2="17" />
                                        </svg>
                                        <span>This user account has been deleted. Past order history is preserved for administrative audits.</span>
                                    </div>
                                )}

                                <div className={styles.infoGrid}>
                                    <div>
                                        <span className={styles.infoLabel}>Email Address</span>
                                        <p className={styles.infoValue}>{displayEmail(selectedUser.email)}</p>
                                    </div>
                                    <div>
                                        <span className={styles.infoLabel}>{selectedUser.userType === 'FACULTY' ? 'Faculty ID' : 'Roll Number'}</span>
                                        <p className={styles.infoValue}>{selectedUser.rollNumber || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <span className={styles.infoLabel}>Department</span>
                                        <p className={styles.infoValue}>{selectedUser.department || 'N/A'}</p>
                                    </div>
                                    {selectedUser.userType !== 'FACULTY' && (
                                        <div>
                                            <span className={styles.infoLabel}>Semester</span>
                                            <p className={styles.infoValue}>Semester {selectedUser.semester || 'N/A'}</p>
                                        </div>
                                    )}
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <span className={styles.infoLabel}>Registered On</span>
                                        <p className={styles.infoValue}>
                                            {new Date(selectedUser.createdAt).toLocaleDateString('en-IN', {
                                                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Order History */}
                            <div className={styles.ordersSection}>
                                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>Order History</span>
                                    <span className={styles.orderCountBadge}>{selectedUser.orders.length}</span>
                                </h3>

                                <div className={styles.ordersList}>
                                    {selectedUser.orders.length === 0 ? (
                                        <div className={styles.emptyOrdersState}>No orders placed by this user yet.</div>
                                    ) : (
                                        selectedUser.orders.map((order: any) => (
                                            <div key={order.id} className={styles.orderItemCard}>
                                                <div className={styles.orderItemHeader}>
                                                    <span style={{ fontWeight: 700, color: '#60a5fa', fontFamily: 'monospace', fontSize: '0.95rem' }}>
                                                        #{order.id.slice(-6).toUpperCase()}
                                                    </span>
                                                    <span className={`${styles.statusBadge} ${styles[order.status.toLowerCase()]}`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.2rem 0' }}>
                                                    {new Date(order.createdAt).toLocaleString('en-IN', {
                                                        dateStyle: 'medium', timeStyle: 'short'
                                                    })}
                                                </div>
                                                <div className={styles.orderItemsList}>
                                                    {order.orderItems.map((item: any, i: number) => (
                                                        <div key={i} className={styles.orderItemRow}>
                                                            <span>{item.quantity}x {item.menuItem.name}</span>
                                                            <span style={{ color: 'var(--text-secondary)' }}>₹{(item.quantity * item.priceAtTime).toFixed(2)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                {order.notes && (
                                                    <div className={styles.orderNote}>
                                                        <strong>Note:</strong> "{order.notes}"
                                                    </div>
                                                )}
                                                <div className={styles.orderTotalRow}>
                                                    <span>Total Paid</span>
                                                    <span className={styles.orderTotalAmount}>₹{order.totalAmount.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.selectUserPrompt}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '64px', height: '64px', color: 'rgba(255,255,255,0.08)', marginBottom: '1.5rem' }}>
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                            <h3>Select a User</h3>
                            <p>Click on any user from the list to view their full profile details and complete purchase history.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
