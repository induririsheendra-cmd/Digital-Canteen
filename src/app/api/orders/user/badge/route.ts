import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ count: 0 }, { status: 401 });
        }

        // Look for orders that were COMPLETED in the last 6 hours
        // and assume the user hasn't seen them yet if the alert hasn't been cleared
        // (A more robust system would add a `viewed` boolean to the Order schema)
        const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);

        const recentCompletedOrdersCount = await prisma.order.count({
            where: {
                userId: session.user.id,
                status: 'COMPLETED',
                updatedAt: {
                    gte: sixHoursAgo
                }
            }
        });

        return NextResponse.json({ count: recentCompletedOrdersCount });
    } catch (error) {
        console.error('Badge Polling Error:', error);
        return NextResponse.json({ count: 0 }, { status: 500 });
    }
}
