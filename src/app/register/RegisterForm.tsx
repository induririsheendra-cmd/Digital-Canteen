'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './register.module.css';

export default function RegisterForm() {
    const router = useRouter();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        rollNumber: '',
        department: '',
        semester: '',
        userType: 'STUDENT',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const isFaculty = formData.userType === 'FACULTY';
        const hasMissingFields = !formData.name || !formData.username || !formData.email || !formData.password || !formData.confirmPassword || !formData.rollNumber || !formData.department || (!isFaculty && !formData.semester);

        if (hasMissingFields) {
            setError('Please fill in all mandatory fields.');
            setLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters.');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    username: formData.username,
                    email: formData.email || null,
                    password: formData.password,
                    rollNumber: formData.rollNumber || null,
                    department: formData.department || null,
                    semester: isFaculty ? null : (formData.semester || null),
                    userType: formData.userType,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Registration failed.');
            }

            // Success — redirect to home page with login modal open
            router.push('/?login=true&registered=true');

        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.loginContainer}>
            <div className={`glass-panel animate-fade-in ${styles.loginCard}`} style={{ maxWidth: '500px' }}>
                <div className={styles.header}>
                    <h1 className="text-gradient">Create Account</h1>
                    <p className="text-secondary">Join Digital Canteen today!</p>
                </div>

                {error && <div className={styles.errorBanner}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    {/* User Type Toggle */}
                    <div className={styles.toggleContainer}>
                        <button
                            type="button"
                            className={`${styles.toggleBtn} ${formData.userType === 'STUDENT' ? styles.toggleBtnActiveStudent : ''}`}
                            onClick={() => setFormData({ ...formData, userType: 'STUDENT' })}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '17px', height: '17px' }}>
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            Student
                        </button>
                        <button
                            type="button"
                            className={`${styles.toggleBtn} ${formData.userType === 'FACULTY' ? styles.toggleBtnActiveFaculty : ''}`}
                            onClick={() => setFormData({ ...formData, userType: 'FACULTY' })}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '17px', height: '17px' }}>
                                <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                                <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"></path>
                            </svg>
                            Faculty
                        </button>
                    </div>

                    {/* Full Name */}
                    <div className={styles.inputGroup}>
                        <label htmlFor="name">Full Name <span style={{ color: '#ef4444' }}>*</span></label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            className="glass-input"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Username */}
                    <div className={styles.inputGroup}>
                        <label htmlFor="username">Username <span style={{ color: '#ef4444' }}>*</span></label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            className="glass-input"
                            placeholder="Choose a unique username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Email */}
                    <div className={styles.inputGroup}>
                        <label htmlFor="email">Email <span style={{ color: '#ef4444' }}>*</span></label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            className="glass-input"
                            placeholder="your.email@university.edu"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Password */}
                    <div className={styles.inputGroup}>
                        <label htmlFor="reg-password">Password <span style={{ color: '#ef4444' }}>*</span></label>
                        <div className={styles.passwordWrapper}>
                            <input
                                id="reg-password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                className="glass-input"
                                placeholder="Min 6 characters"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <button
                                type="button"
                                className={styles.eyeIcon}
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
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

                    {/* Confirm Password */}
                    <div className={styles.inputGroup}>
                        <label htmlFor="confirmPassword">Confirm Password <span style={{ color: '#ef4444' }}>*</span></label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            className="glass-input"
                            placeholder="Re-enter your password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Divider */}
                    <div className={styles.divider}>
                        <span>Profile Details</span>
                    </div>

                    {/* Roll Number / Faculty ID */}
                    <div className={styles.inputGroup}>
                        <label htmlFor="rollNumber">
                            {formData.userType === 'FACULTY' ? 'Faculty ID' : 'Roll Number'} <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                            id="rollNumber"
                            name="rollNumber"
                            type="text"
                            className="glass-input"
                            placeholder={formData.userType === 'FACULTY' ? 'e.g., FAC12345' : 'e.g., 22B01A0567'}
                            value={formData.rollNumber}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Department */}
                    <div className={styles.inputGroup}>
                        <label htmlFor="department">Department <span style={{ color: '#ef4444' }}>*</span></label>
                        <select
                            id="department"
                            name="department"
                            className="glass-input"
                            value={formData.department}
                            onChange={handleChange}
                            style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}
                            required
                        >
                            <option value="" style={{ background: '#0f172a' }}>-- Select Department --</option>
                            <option value="CSE" style={{ background: '#0f172a' }}>Computer Science & Engineering</option>
                            <option value="ECE" style={{ background: '#0f172a' }}>Electronics & Communication</option>
                            <option value="EEE" style={{ background: '#0f172a' }}>Electrical & Electronics</option>
                            <option value="ME" style={{ background: '#0f172a' }}>Mechanical Engineering</option>
                            <option value="CE" style={{ background: '#0f172a' }}>Civil Engineering</option>
                            <option value="IT" style={{ background: '#0f172a' }}>Information Technology</option>
                            <option value="AIDS" style={{ background: '#0f172a' }}>AI & Data Science</option>
                            <option value="AIML" style={{ background: '#0f172a' }}>AI & Machine Learning</option>
                            <option value="MBA" style={{ background: '#0f172a' }}>MBA</option>
                            <option value="OTHER" style={{ background: '#0f172a' }}>Other</option>
                        </select>
                    </div>

                    {/* Semester */}
                    {formData.userType !== 'FACULTY' && (
                        <div className={styles.inputGroup}>
                            <label htmlFor="semester">Semester <span style={{ color: '#ef4444' }}>*</span></label>
                            <select
                                id="semester"
                                name="semester"
                                className="glass-input"
                                value={formData.semester}
                                onChange={handleChange}
                                style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}
                                required
                            >
                                <option value="" style={{ background: '#0f172a' }}>-- Select Semester --</option>
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                                    <option key={sem} value={String(sem)} style={{ background: '#0f172a' }}>Semester {sem}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="glass-button"
                        disabled={loading}
                        style={{ marginTop: '0.5rem' }}
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Already have an account?{' '}
                    <Link href="/?login=true" style={{ color: 'var(--accent-primary)', fontWeight: 600, textDecoration: 'none' }}>
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}
