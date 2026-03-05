import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

// GET: Check for newly completed, unacknowledged orders
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // We fetch orders for this user that are COMPLETED
        // In a full production app, you might add an `isAcknowledged` boolean.
        // For Phase 6 scope, we will rely on timestamp freshness (e.g., completed in the last 2 minutes).

        const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

        const recentCompletedOrders = await prisma.order.findMany({
            where: {
                userId: session.user.id,
                status: 'COMPLETED',
                updatedAt: {
                    gte: twoMinutesAgo
                }
            },
            orderBy: {
                updatedAt: 'desc'
            },
            take: 1
        });

        return NextResponse.json({ newOrders: recentCompletedOrders });
    } catch (error) {
        console.error('Polling error:', error);
        return NextResponse.json({ error: 'Failed to check order status' }, { status: 500 });
    }
}

// POST: Acknowledge a notification (pseudo-dismissal)
export async function POST(request: Request) {
    try {
        // Here we could formally mark `isAcknowledged: true` in Prisma
        // For the current Phase 6 schema, receiving the POST is sufficient to clear the frontend state.
        return NextResponse.json({ success: true, message: 'Notification dismissed' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to dismiss.' }, { status: 500 });
    }
}
