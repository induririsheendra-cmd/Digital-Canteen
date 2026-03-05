'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './settings.module.css';
import { User } from '@prisma/client';

export default function SettingsClient({ user }: { user: User }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: user.name || '',
        username: user.username || '',
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
                    Account Info
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
                </div>

                <div className={styles.row}>
                    <div className={styles.inputGroup}>
                        <label>Roll Number</label>
                        <input
                            type="text"
                            name="rollNumber"
                            placeholder="e.g. 21BCE0001"
                            value={formData.rollNumber}
                            onChange={handleChange}
                            className={styles.input}
                        />
                    </div>

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
        </div>
    );
}
