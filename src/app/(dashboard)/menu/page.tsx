import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import MenuClient from "./MenuClient";

export default async function MenuPage() {
    const session = await auth();
    const userId = session?.user?.id;

    // Parallelized DB queries
    const [allItems, userSubscriptions, popularItems, userFavorites, mealTimings] = await Promise.all([
        prisma.menuItem.findMany({
            where: { available: true },
            include: {
                orderItems: {
                    where: { order: { rating: { not: null } } },
                    select: { order: { select: { rating: true, review: true } } }
                }
            }
        }),
        userId ? prisma.itemSubscription.findMany({
            where: { userId },
            select: { menuItemId: true }
        }) : Promise.resolve([]),
        prisma.orderItem.groupBy({
            by: ['menuItemId'],
            _sum: { quantity: true }
        }),
        userId ? (prisma.orderItem.groupBy({
            by: ['menuItemId'],
            where: { order: { userId } },
            _sum: { quantity: true }
        }) as any) : Promise.resolve([]),
        prisma.mealTiming.findMany()
    ]);

    const userSubscribedItemIds = userSubscriptions.map(s => s.menuItemId);

    // Merge stats into items
    const enrichedItems = allItems.map(item => {
        const globalCount = popularItems.find((p: any) => p.menuItemId === item.id)?._sum.quantity || 0;
        const userCount = userFavorites.find((u: any) => u.menuItemId === item.id)?._sum.quantity || 0;
        
        const ratings = item.orderItems.map(oi => oi.order?.rating).filter((r): r is number => r !== null && r !== undefined);
        const total = ratings.reduce((sum, r) => sum + r, 0);
        const count = ratings.length;

        const { orderItems, ...rest } = item;
        return {
            ...rest,
            popularity: globalCount,
            userOrderCount: userCount,
            avgRating: count > 0 ? Math.round((total / count) * 10) / 10 : 0,
            reviewCount: count,
        };
    });

    return <MenuClient initialItems={enrichedItems as any} userSubscriptions={userSubscribedItemIds} mealTimings={mealTimings} />;
}

