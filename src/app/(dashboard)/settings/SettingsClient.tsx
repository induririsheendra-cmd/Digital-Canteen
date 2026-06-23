'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import styles from './settings.module.css';
import { User } from '@prisma/client';

export default function SettingsClient({ user }: { user: User }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleDeleteAccount = async () => {
        const confirmDelete = window.confirm("Are you absolutely sure you want to delete your account? This action cannot be undone.");
        if (!confirmDelete) return;

        const doubleConfirm = window.confirm("Please confirm one last time: delete this account permanently?");
        if (!doubleConfirm) return;

        setIsDeleting(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await fetch('/api/user/profile', {
                method: 'DELETE',
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to delete account');
            }

            await signOut({ callbackUrl: '/' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
            setIsDeleting(false);
        }
    };

    const [formData, setFormData] = useState({
        name: user.name || '',
        username: user.username || '',
        email: user.email || '',
        rollNumber: user.rollNumber || '',
        semester: user.semester || '',
        department: user.department || '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });

        if (formData.password && formData.password !== formData.confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match!' });
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to update profile');
            }

            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            router.refresh();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`glass-panel ${styles.settingsContainer}`}>
            {message.text && (
                <div className={`${styles.alert} ${styles[message.type]}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.sectionHeading}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    <span>Account Info</span>
                    {user.userType === 'FACULTY' ? (
                        <span className={styles.facultyBadge}>Faculty</span>
                    ) : (
                        <span className={styles.studentBadge}>Student</span>
                    )}
                </div>

                <div className={styles.row}>
                    <div className={styles.inputGroup}>
                        <label>Display Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="e.g. John Doe"
                        />
                    </div>
                </div>

                <div className={styles.row}>
                    <div className={styles.inputGroup}>
                        <label>Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className={styles.input}
                            required
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={styles.input}
                            required
                            placeholder="e.g. john@example.com"
                        />
                    </div>
                </div>

                <div className={styles.row}>
                    <div className={styles.inputGroup}>
                        <label>{user.userType === 'FACULTY' ? 'Faculty ID' : 'Roll Number'}</label>
                        <input
                            type="text"
                            name="rollNumber"
                            placeholder={user.userType === 'FACULTY' ? 'e.g. FAC12345' : 'e.g. 21BCE0001'}
                            value={formData.rollNumber}
                            onChange={handleChange}
                            className={styles.input}
                        />
                    </div>

                    {user.userType !== 'FACULTY' && (
                        <div className={styles.inputGroup}>
                            <label>Semester</label>
                            <select
                                name="semester"
                                value={formData.semester}
                                onChange={handleChange}
                                className={styles.input}
                            >
                                <option value="">Select Semester</option>
                                <option value="I">Semester I</option>
                                <option value="II">Semester II</option>
                                <option value="III">Semester III</option>
                                <option value="IV">Semester IV</option>
                                <option value="V">Semester V</option>
                                <option value="VI">Semester VI</option>
                                <option value="VII">Semester VII</option>
                                <option value="VIII">Semester VIII</option>
                            </select>
                        </div>
                    )}

                    <div className={styles.inputGroup}>
                        <label>Department</label>
                        <select
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            className={styles.input}
                        >
                            <option value="">Select Department</option>
                            <option value="CSE">CSE</option>
                            <option value="CSM">CSM</option>
                            <option value="CSE(DS)">CSE(DS)</option>
                            <option value="MECH">MECH</option>
                            <option value="CIVIL">CIVIL</option>
                            <option value="AERO">AERO</option>
                            <option value="ECE">ECE</option>
                            <option value="EEE">EEE</option>
                        </select>
                    </div>
                </div>

                <div className={styles.sectionHeading} style={{ marginTop: '2rem' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    Security
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    Leave blank to keep your current password. Note: this applies for Email/Password logins, not Google SSO.
                </p>

                <div className={styles.row}>
                    <div className={styles.inputGroup}>
                        <label>New Password</label>
                        <div className={styles.passwordWrapper}>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                className={styles.eyeIcon}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                        <line x1="1" y1="1" x2="23" y2="23"></line>
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Confirm Password</label>
                        <div className={styles.passwordWrapper}>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                className={styles.eyeIcon}
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                        <line x1="1" y1="1" x2="23" y2="23"></line>
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    className={styles.saveBtn}
                    disabled={isLoading}
                >
                    {isLoading ? 'Saving...' : 'Save Profile Settings'}
                </button>
            </form>

            <div className={styles.dangerZone}>
                <div className={styles.dangerZoneTitle}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px', color: '#f87171' }}>
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    <span>Danger Zone</span>
                </div>
                <div className={styles.dangerZoneContent}>
                    <div style={{ flexGrow: 1 }}>
                        <h4 style={{ margin: 0, color: 'white', fontSize: '0.95rem', fontWeight: 600 }}>Delete Account</h4>
                        <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.825rem', lineHeight: '1.4' }}>
                            Soft-delete your profile. All of your past completed order ledger records will be preserved for admin audits, but you will be signed out and lose access immediately.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleDeleteAccount}
                        className={styles.deleteBtn}
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete Account'}
                    </button>
                </div>
            </div>
        </div>
    );
}
