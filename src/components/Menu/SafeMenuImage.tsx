"use client";

import { useState } from "react";

interface SafeMenuImageProps {
    src: string;
    alt: string;
    category: string;
    name: string;
    className?: string;
    style?: React.CSSProperties;
    fill?: boolean;
}

export default function SafeMenuImage({ src, alt, category, name, className, style, fill }: SafeMenuImageProps) {
    const [hasError, setHasError] = useState(false);

    const getFallbackEmoji = (cat: string, itemName: string) => {
        const lowercaseName = itemName.toLowerCase();
        if (lowercaseName.includes("tea") || lowercaseName.includes("coffee") || lowercaseName.includes("chai")) return "☕";
        if (lowercaseName.includes("juice") || lowercaseName.includes("drink") || lowercaseName.includes("soda") || lowercaseName.includes("cola")) return "🥤";
        if (lowercaseName.includes("idly") || lowercaseName.includes("dosa") || lowercaseName.includes("upma") || lowercaseName.includes("breakfast")) return "🥞";
        if (lowercaseName.includes("biryani") || lowercaseName.includes("rice") || lowercaseName.includes("pulao")) return "🍛";
        if (lowercaseName.includes("burger") || lowercaseName.includes("sandwich")) return "🍔";
        if (lowercaseName.includes("pizza")) return "🍕";
        if (lowercaseName.includes("noodle") || lowercaseName.includes("pasta") || lowercaseName.includes("maggi")) return "🍜";
        if (lowercaseName.includes("samosa") || lowercaseName.includes("puff") || lowercaseName.includes("fritter")) return "🥟";
        if (lowercaseName.includes("cake") || lowercaseName.includes("pastry") || lowercaseName.includes("donut") || lowercaseName.includes("cookie")) return "🧁";
        
        // Category fallbacks
        if (cat === "BREAKFAST") return "🍳";
        if (cat === "LUNCH") return "🍛";
        if (cat === "SNACKS") return "🍩";
        if (cat === "DINNER") return "🍜";
        return "🍽️";
    };

    if (hasError || !src) {
        return (
            <div 
                className={className} 
                style={{
                    ...style,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15))',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    position: fill ? 'absolute' : 'relative',
                    top: fill ? 0 : undefined,
                    left: fill ? 0 : undefined,
                    right: fill ? 0 : undefined,
                    bottom: fill ? 0 : undefined,
                    width: fill ? '100%' : style?.width || '100%',
                    height: fill ? '100%' : style?.height || '100%',
                }}
            >
                <span style={{ fontSize: fill ? '1.8rem' : '3rem', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>
                    {getFallbackEmoji(category, name)}
                </span>
                {!fill && (
                    <span style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.4)', marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {category}
                    </span>
                )}
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className={className}
            onError={() => setHasError(true)}
            style={{
                ...style,
                width: fill ? '100%' : style?.width || '100%',
                height: fill ? '100%' : style?.height || '100%',
                objectFit: 'cover'
            }}
        />
    );
}
