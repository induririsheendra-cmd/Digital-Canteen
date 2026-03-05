import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import MenuClient from "./MenuClient";

export default async function MenuPage() {
    const session = await auth();
    const userId = session?.user?.id;

    // Fetch all available menu items to pass to the client component for instant local filtering
    const allItems = await prisma.menuItem.findMany({
        where: { available: true }
    });

    // Fetch user's active restock subscriptions
    let userSubscriptions: string[] = [];
    if (userId) {
        const subs = await prisma.itemSubscription.findMany({
            where: { userId },
            select: { menuItemId: true }
        });
        userSubscriptions = subs.map(s => s.menuItemId);
    }

    // Compute Global Popularity (total quantity ordered)
    const popularItems = await prisma.orderItem.groupBy({
        by: ['menuItemId'],
        _sum: { quantity: true }
    });

    // Compute User Favorites (quantity ordered by this user)
    let userFavorites: any[] = [];
    if (userId) {
        // @ts-ignore - Prisma typing inference issue with groupBy 
        userFavorites = await prisma.orderItem.groupBy({
            by: ['menuItemId'],
            where: { order: { userId } },
            _sum: { quantity: true }
        });
    }

    // Compute average ratings per menu item from orders
    const allMenuItemIds = allItems.map(i => i.id);
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

    // Build rating map: menuItemId -> { avgRating, reviewCount }
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

    // Merge stats into items
    const enrichedItems = allItems.map(item => {
        const globalCount = popularItems.find(p => p.menuItemId === item.id)?._sum.quantity || 0;
        const userCount = userFavorites.find(u => u.menuItemId === item.id)?._sum.quantity || 0;
        const ratingData = ratingMap[item.id];
        return {
            ...item,
            popularity: globalCount,
            userOrderCount: userCount,
            avgRating: ratingData ? Math.round((ratingData.total / ratingData.count) * 10) / 10 : 0,
            reviewCount: ratingData?.count || 0,
        };
    });

    // Fetch Meal Timings
    const mealTimings = await prisma.mealTiming.findMany();

    return <MenuClient initialItems={enrichedItems as any} userSubscriptions={userSubscriptions} mealTimings={mealTimings} />;
}

