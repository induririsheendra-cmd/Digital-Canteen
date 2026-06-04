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

        // Fetch orders for this user that have a relevant status change and haven't been notified yet
        const unnotifiedOrders = await prisma.order.findMany({
            where: {
                userId: session.user.id,
                isNotified: false,
                status: { in: ['COOKING', 'READY', 'COMPLETED'] }
            },
            orderBy: { updatedAt: 'desc' },
            take: 3
        });

        return NextResponse.json({ newOrders: unnotifiedOrders });
    } catch (error) {
        console.error('Polling error:', error);
        return NextResponse.json({ error: 'Failed to check order status' }, { status: 500 });
    }
}

// POST: Acknowledge a notification (Formal dismissal)
export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { orderId } = await request.json();
        if (!orderId) return NextResponse.json({ error: 'Order ID required' }, { status: 400 });

        await prisma.order.update({
            where: { id: orderId, userId: session.user.id },
            data: { isNotified: true }
        });

        return NextResponse.json({ success: true, message: 'Notification marked as delivered' });
    } catch (error) {
        console.error("Acknowledgment error:", error);
        return NextResponse.json({ error: 'Failed to dismiss.' }, { status: 500 });
    }
}
