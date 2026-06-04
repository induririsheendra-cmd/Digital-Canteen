import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import MenuCard from '@/components/Menu/MenuCard';
import HomeBannerClient from './HomeBannerClient';
import HomeMenuClient from './HomeMenuClient';
import styles from './home.module.css';

export default async function HomePage() {
    const session = await auth();
    let userName = "Student";

    if (session?.user?.id) {
        const dbUser = await prisma.user.findUnique({
            where: { id: session.user.id }
        });
        if (dbUser) {
            userName = dbUser.name || dbUser.username || "Student";
        }
    }

    // Fetch available menu items
    const menuItems = await prisma.menuItem.findMany({
        where: { available: true },
        orderBy: { category: 'asc' }
    });

    // Compute average ratings per menu item
    const allMenuItemIds = menuItems.map(i => i.id);
    const ratedOrders = await prisma.order.findMany({
        where: {
            rating: { not: null },
            orderItems: { some: { menuItemId: { in: allMenuItemIds } } }
        },
        select: {
            rating: true,
            review: true,
            orderItems: { select: { menuItemId: true } }
        }
    });

    const ratingMap: Record<string, { total: number; count: number; reviewCount: number }> = {};
    ratedOrders.forEach(order => {
        order.orderItems.forEach(oi => {
            if (!ratingMap[oi.menuItemId]) {
                ratingMap[oi.menuItemId] = { total: 0, count: 0, reviewCount: 0 };
            }
            ratingMap[oi.menuItemId].total += order.rating!;
            ratingMap[oi.menuItemId].count += 1;
            if (order.review) ratingMap[oi.menuItemId].reviewCount += 1;
        });
    });

    // Enrich items with rating data
    const enrichedItems = menuItems.map(item => {
        const rd = ratingMap[item.id];
        return {
            ...item,
            avgRating: rd ? Math.round((rd.total / rd.count) * 10) / 10 : 0,
            reviewCount: rd?.count || 0,
        };
    });

    // Fetch live CMS Banner Settings (Up to 3 multi-banners)
    let banners = await prisma.bannerSettings.findMany({
        take: 3,
        orderBy: { id: 'asc' }
    });

    if (banners.length === 0) {
        banners = [{
            id: '1',
            title: 'Welcome to Digital Canteen',
            description: 'Experience the best meals right to your desk.',
            price: null,
            imageUrl: 'https://images.unsplash.com/photo-1543362906-acfc16c67564?q=80&w=2000',
            menuItemId: null,
            updatedAt: new Date()
        }];
    }

    // Attach linked menu items for all 3 banners if applicable
    const bannersWithItems = await Promise.all(banners.map(async (banner) => {
        let linkedItem = null;
        if (banner.menuItemId) {
            linkedItem = await prisma.menuItem.findUnique({
                where: { id: banner.menuItemId }
            });
        }
        return { banner, linkedItem };
    }));

    return (
        <div className={styles.homeContainer}>
            <header className={styles.header}>
                <div>
                    <h1 className="text-gradient">Hello! {userName}</h1>
                    <p className="text-secondary">What are you craving today?</p>
                </div>
            </header>

            <HomeBannerClient bannersData={bannersWithItems as any} />

            <HomeMenuClient items={enrichedItems as any} />
        </div>
    );
}

