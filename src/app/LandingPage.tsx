"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import styles from "./landing.module.css";

function LandingPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [showLogin, setShowLogin] = useState(false);

    const [activeSection, setActiveSection] = useState("hero");

    useEffect(() => {
        if (searchParams.get('login') === 'true') {
            setShowLogin(true);
        }
    }, [searchParams]);

    useEffect(() => {
        const handleScroll = () => {
            const sections = ["hero", "features", "howItWorks", "contact"];
            
            // If the user reaches the bottom of the page, activate the last section
            const isBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100;
            if (isBottom) {
                setActiveSection("contact");
                return;
            }

            let currentSection = "hero";
            for (const sectionId of sections) {
                const el = document.getElementById(sectionId);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    // If the section covers the navbar area (150px from top)
                    if (rect.top <= 150 && rect.bottom >= 150) {
                        currentSection = sectionId;
                        break;
                    }
                }
            }
            setActiveSection(currentSection);
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, [searchParams]);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <div className={styles.landingWrapper}>
            {/* ========== NAVBAR ========== */}
            <nav className={styles.navbar}>
                <div className={styles.navLogo}>🍽 Digital Canteen</div>
                <ul className={styles.navLinks}>
                    <li className={`${styles.navLink} ${activeSection === 'hero' ? styles.activeLink : ''}`} onClick={() => scrollTo("hero")}>Home</li>
                    <li className={`${styles.navLink} ${activeSection === 'features' ? styles.activeLink : ''}`} onClick={() => scrollTo("features")}>About</li>
                    <li className={`${styles.navLink} ${activeSection === 'howItWorks' ? styles.activeLink : ''}`} onClick={() => scrollTo("howItWorks")}>How it Works</li>
                    <li className={`${styles.navLink} ${activeSection === 'contact' ? styles.activeLink : ''}`} onClick={() => scrollTo("contact")}>Contact</li>
                    <li>
                        <button className={styles.navLoginBtn} onClick={() => setShowLogin(true)}>
                            Login
                        </button>
                    </li>
                </ul>
                <button className={styles.mobileMenuBtn} onClick={() => setShowLogin(true)}>
                    ☰
                </button>
            </nav>

            {/* ========== HERO ========== */}
            <section className={styles.hero} id="hero">
                <div className={styles.heroBgOverlay} />

                {/* Floating Food Icons */}
                <span className={`${styles.floatingIcon} ${styles.float1}`}>☕</span>
                <span className={`${styles.floatingIcon} ${styles.float2}`}>🍔</span>
                <span className={`${styles.floatingIcon} ${styles.float3}`}>🍕</span>
                <span className={`${styles.floatingIcon} ${styles.float4}`}>🍵</span>
                <span className={`${styles.floatingIcon} ${styles.float5}`}>🧁</span>
                <span className={`${styles.floatingIcon} ${styles.float6}`}>🥪</span>
                <span className={`${styles.floatingIcon} ${styles.float7}`}>🍩</span>
                <span className={`${styles.floatingIcon} ${styles.float8}`}>🍟</span>

                <div className={styles.heroContent}>
                    <div className={styles.heroTag}>
                        ⚡ Smart Campus Food Ordering
                    </div>

                    <h1 className={styles.heroTitle}>
                        Skip the Queue.<br />
                        <span className={styles.heroTitleAccent}>Order Your Food Online.</span>
                    </h1>

                    <p className={styles.heroSub}>
                        Smart digital canteen system for faster food ordering in colleges.
                        Browse the menu, pay online, and pick up your order — no waiting!
                    </p>

                    <div className={styles.heroBtns}>
                        <button className={styles.heroPrimary} onClick={() => router.push("/menu")}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}>
                                <path d="M3 3h18v18H3z" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M3 9h18M9 21V9" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            View Menu
                        </button>
                        <button className={styles.heroSecondary} onClick={() => setShowLogin(true)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}>
                                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" strokeLinecap="round" strokeLinejoin="round" />
                                <polyline points="10 17 15 12 10 7" strokeLinecap="round" strokeLinejoin="round" />
                                <line x1="15" y1="12" x2="3" y2="12" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Login
                        </button>
                    </div>
                </div>
            </section>

            {/* ========== FEATURES ========== */}
            <section className={styles.features} id="features">
                <h2 className={styles.featuresTitle}>
                    Why <span className={styles.heroTitleAccent}>Digital Canteen</span>?
                </h2>
                <p className={styles.featuresSub}>
                    Everything you need for a seamless campus dining experience.
                </p>

                <div className={styles.featuresGrid}>
                    {[
                        {
                            icon: "📱",
                            bg: "rgba(99,102,241,0.12)",
                            title: "Order from Anywhere",
                            desc: "Browse the full menu and place orders from your phone or laptop — no need to stand in line."
                        },
                        {
                            icon: "⚡",
                            bg: "rgba(250,204,21,0.12)",
                            title: "Real-time Tracking",
                            desc: "Track your order status live — from preparation to ready for pickup. Never miss your food!"
                        },
                        {
                            icon: "💳",
                            bg: "rgba(34,197,94,0.12)",
                            title: "Secure Payments",
                            desc: "Pay online through UPI, cards, or net banking with our secure and fast payment gateway."
                        },
                        {
                            icon: "🗓",
                            bg: "rgba(139,92,246,0.12)",
                            title: "Meal Scheduling",
                            desc: "Meals are organized by timing — Breakfast, Lunch, Snacks, and Dinner — so you always know what's available."
                        },
                        {
                            icon: "⭐",
                            bg: "rgba(251,146,60,0.12)",
                            title: "Rate & Review",
                            desc: "Share feedback on every order. Help the canteen improve with your honest ratings and reviews."
                        },
                        {
                            icon: "🔔",
                            bg: "rgba(236,72,153,0.12)",
                            title: "Instant Notifications",
                            desc: "Get notified when your order is ready, when new items are added, or when deals are live."
                        },
                    ].map((f, i) => (
                        <div key={i} className={styles.featureCard}>
                            <div className={styles.featureIcon} style={{ background: f.bg }}>
                                {f.icon}
                            </div>
                            <h3 className={styles.featureTitle}>{f.title}</h3>
                            <p className={styles.featureDesc}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ========== HOW IT WORKS ========== */}
            <section className={styles.howItWorks} id="howItWorks">
                <h2 className={styles.featuresTitle}>
                    How It <span className={styles.heroTitleAccent}>Works</span>
                </h2>
                <p className={styles.featuresSub}>
                    Three simple steps to get your food — fast.
                </p>

                <div className={styles.stepsContainer}>
                    {[
                        { num: "1", title: "Browse Menu", desc: "Explore breakfast, lunch, snacks & dinner options with images and prices." },
                        { num: "2", title: "Place Order & Pay", desc: "Add items to your cart, choose payment method, and pay securely online." },
                        { num: "3", title: "Pick Up & Enjoy", desc: "Get a notification when your food is ready. Skip the queue and enjoy!" },
                    ].map((s, i) => (
                        <div key={i} className={styles.step}>
                            <div className={styles.stepNum}>{s.num}</div>
                            <h3 className={styles.stepTitle}>{s.title}</h3>
                            <p className={styles.stepDesc}>{s.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ========== FOOTER ========== */}
            <footer className={styles.footer} id="contact">
                <div className={styles.footerLogo}>🍽 Digital Canteen</div>
                <p className={styles.footerText}>
                    Smart digital food ordering system for modern college canteens.
                </p>

                <div className={styles.contactInfo}>
                    <a href="tel:9553565355" className={styles.contactItem}>
                        <span className={styles.contactIcon}>📞</span>
                        <span>9553565355</span>
                    </a>
                    <a href="mailto:induririshi12@gmail.com" className={styles.contactItem}>
                        <span className={styles.contactIcon}>✉️</span>
                        <span>induririshi12@gmail.com</span>
                    </a>
                </div>

                <div className={styles.footerLinks}>
                    <span className={styles.footerLink} onClick={() => scrollTo("hero")}>Home</span>
                    <span className={styles.footerLink} onClick={() => scrollTo("features")}>About</span>
                    <span className={styles.footerLink} onClick={() => scrollTo("howItWorks")}>How it Works</span>
                    <span className={styles.footerLink} onClick={() => setShowLogin(true)}>Login</span>
                    <span className={styles.footerLink} onClick={() => router.push("/register")}>Register</span>
                </div>
                <p className={styles.footerCopyright}>
                    © {new Date().getFullYear()} Digital Canteen. All rights reserved.
                </p>
            </footer>

            {/* ========== LOGIN MODAL ========== */}
            {showLogin && (
                <div className={styles.modalOverlay} onClick={() => setShowLogin(false)}>
                    <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
                        <button className={styles.modalClose} onClick={() => setShowLogin(false)}>✕</button>

                        <div className={styles.modalLogo}>
                            <div className={styles.modalLogoIcon}>🍽</div>
                        </div>

                        <h2 className={styles.modalTitle}>Welcome to Digital Canteen</h2>
                        <p className={styles.modalSub}>Sign in to your account to order food</p>

                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            if (email && password) {
                                const result = await signIn('credentials', {
                                    username: email,
                                    password: password,
                                    redirect: false,
                                });
                                if (result?.ok) {
                                    // Fetch session to check role
                                    const sessionRes = await fetch('/api/auth/session');
                                    const session = await sessionRes.json();
                                    if (session?.user?.role === 'ADMIN') {
                                        router.push('/admin');
                                    } else {
                                        router.push('/home');
                                    }
                                } else {
                                    alert('Invalid credentials. Please try again.');
                                }
                            } else {
                                router.push('/login');
                            }
                        }}>
                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>Email or Username</label>
                                <input
                                    type="text"
                                    className={styles.inputField}
                                    placeholder="you@college.edu"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>Password</label>
                                <div className={styles.passwordWrapper}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className={styles.inputField}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className={styles.eyeBtn}
                                        onClick={() => setShowPassword(!showPassword)}
                                        tabIndex={-1}
                                    >
                                        {showPassword ? (
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                                        ) : (
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className={styles.rememberRow}>
                                <label className={styles.checkbox}>
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={() => setRememberMe(!rememberMe)}
                                    />
                                    Remember me
                                </label>
                                <span className={styles.forgotLink}>Forgot password?</span>
                            </div>

                            <button type="submit" className={styles.signInBtn}>
                                Sign In
                            </button>
                        </form>

                        <div className={styles.divider}>or continue with</div>

                        <button className={styles.googleBtn} onClick={() => signIn('google', { callbackUrl: '/home' }, { prompt: 'select_account' })}>
                            <svg viewBox="0 0 24 24" width="20" height="20">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Sign in with Google
                        </button>

                        <p className={styles.signupText}>
                            New user?{" "}
                            <span className={styles.signupLink} onClick={() => router.push("/register")}>
                                Create an Account
                            </span>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function LandingPage() {
    return (
        <Suspense fallback={<div className={styles.landingWrapper} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>Loading...</div>}>
            <LandingPageContent />
        </Suspense>
    );
}
