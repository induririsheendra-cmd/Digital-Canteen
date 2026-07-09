import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import MenuCard from '@/components/Menu/MenuCard';
import HomeBannerClient from './HomeBannerClient';
import HomeMenuClient from './HomeMenuClient';
import styles from './home.module.css';

export default async function HomePage() {
    const session = await auth();
    const userId = session?.user?.id;

    // Parallelized DB queries
    const [dbUser, menuItems, banners] = await Promise.all([
        userId ? prisma.user.findUnique({
            where: { id: userId },
            select: { name: true, username: true }
        }) : Promise.resolve(null),
        prisma.menuItem.findMany({
            where: { available: true },
            include: {
                orderItems: {
                    where: { order: { rating: { not: null } } },
                    select: { order: { select: { rating: true, review: true } } }
                }
            },
            orderBy: { category: 'asc' }
        }),
        prisma.bannerSettings.findMany({
            take: 3,
            orderBy: { id: 'asc' },
            include: { menuItem: true }
        })
    ]);

    const userName = dbUser ? (dbUser.name || dbUser.username || "Student") : "Student";

    // Enrich items with average rating and review counts in memory
    const enrichedItems = menuItems.map(item => {
        const ratings = item.orderItems.map(oi => oi.order?.rating).filter((r): r is number => r !== null && r !== undefined);
        const total = ratings.reduce((sum, r) => sum + r, 0);
        const count = ratings.length;
        
        // Remove nested orderItems to keep the component props lightweight
        const { orderItems, ...rest } = item;
        return {
            ...rest,
            avgRating: count > 0 ? Math.round((total / count) * 10) / 10 : 0,
            reviewCount: count,
        };
    });

    // Format banners for HomeBannerClient
    const bannersWithItems = (banners.length > 0 ? banners : [{
        id: '1',
        title: 'Welcome to Digital Canteen',
        description: 'Experience the best meals right to your desk.',
        price: null,
        imageUrl: 'https://images.unsplash.com/photo-1543362906-acfc16c67564?q=80&w=2000',
        menuItemId: null,
        updatedAt: new Date(),
        menuItem: null
    }]).map(banner => ({
        banner: {
            id: banner.id,
            title: banner.title,
            description: banner.description,
            price: banner.price,
            imageUrl: banner.imageUrl,
            menuItemId: banner.menuItemId,
            updatedAt: banner.updatedAt
        },
        linkedItem: banner.menuItem
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

