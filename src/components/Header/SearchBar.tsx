"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SearchBar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState("");

    // Keep local search input synced with URL search query param
    useEffect(() => {
        const search = searchParams.get("search");
        if (search) {
            setQuery(search);
        } else {
            setQuery("");
        }
    }, [searchParams]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/menu?search=${encodeURIComponent(query.trim())}`);
        } else {
            router.push("/menu");
        }
    };

    return (
        <form onSubmit={handleSearch} style={{ display: "flex", alignItems: "center", position: "relative" }}>
            <input
                type="text"
                placeholder="Search food items..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                    padding: "0.5rem 1rem 0.5rem 2.5rem",
                    borderRadius: "20px",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    background: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(10px)",
                    color: "#fff",
                    fontSize: "0.875rem",
                    outline: "none",
                    width: "180px",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
                onFocus={(e) => {
                    e.target.style.width = "250px";
                    e.target.style.borderColor = "var(--primary)";
                    e.target.style.background = "rgba(255, 255, 255, 0.08)";
                    e.target.style.boxShadow = "0 0 10px rgba(99, 102, 241, 0.2)";
                }}
                onBlur={(e) => {
                    if (!query) {
                        e.target.style.width = "180px";
                    }
                    e.target.style.borderColor = "rgba(255, 255, 255, 0.15)";
                    e.target.style.background = "rgba(255, 255, 255, 0.05)";
                    e.target.style.boxShadow = "none";
                }}
            />
            <span style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "rgba(255, 255, 255, 0.5)", pointerEvents: "none" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
            </span>
        </form>
    );
}
