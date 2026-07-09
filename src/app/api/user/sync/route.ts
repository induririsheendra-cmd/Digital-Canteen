import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);

        // Fetch all three sync dependencies in parallel in a single DB trip!
        const [notifications, unnotifiedOrders, recentCompletedCount] = await Promise.all([
            // 1. Fetch 20 most recent user and broadcast notifications
            prisma.notification.findMany({
                where: {
                    OR: [
                        { userId: userId },
                        { userId: null }
                    ]
                },
                orderBy: { createdAt: 'desc' },
                take: 20
            }),
            // 2. Fetch unacknowledged order status updates
            prisma.order.findMany({
                where: {
                    userId: userId,
                    isNotified: false,
                    status: { in: ['COOKING', 'READY', 'COMPLETED'] }
                },
                orderBy: { updatedAt: 'desc' },
                take: 3
            }),
            // 3. Fetch completed orders count in the last 6 hours for badge
            prisma.order.count({
                where: {
                    userId: userId,
                    status: 'COMPLETED',
                    updatedAt: { gte: sixHoursAgo }
                }
            })
        ]);

        const unreadNotificationsCount = notifications.filter(n => !n.read).length;

        return NextResponse.json({
            notifications,
            unreadNotificationsCount,
            newOrders: unnotifiedOrders,
            badgeCount: recentCompletedCount
        });
    } catch (error) {
        console.error('User Sync Error:', error);
        return NextResponse.json({ error: 'Failed to synchronize updates' }, { status: 500 });
    }
}
