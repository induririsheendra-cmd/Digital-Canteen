import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

// GET: Fetch all orders with reviews for admin
export async function GET(req: Request) {
    try {
        const session = await auth();
        const userWithRole = session?.user as any;
        if (userWithRole?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const dateStr = searchParams.get('date');

        let dateFilter: any = {};
        if (dateStr) {
            const startDate = new Date(dateStr + 'T00:00:00');
            const endDate = new Date(dateStr + 'T23:59:59.999');
            dateFilter = { createdAt: { gte: startDate, lte: endDate } };
        }

        const reviews = await prisma.order.findMany({
            where: {
                rating: { not: null },
                ...dateFilter,
            },
            select: {
                id: true,
                rating: true,
                review: true,
                totalAmount: true,
                createdAt: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        email: true,
                        rollNumber: true,
                        semester: true,
                        department: true,
                    }
                },
                orderItems: {
                    select: {
                        quantity: true,
                        menuItem: {
                            select: { name: true, category: true, isVeg: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Get dates that have reviews (for calendar dots) — last 90 days
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        ninetyDaysAgo.setHours(0, 0, 0, 0);

        const allReviewDates = await prisma.order.findMany({
            where: { rating: { not: null }, createdAt: { gte: ninetyDaysAgo } },
            select: { createdAt: true },
        });

        const reviewDates = [...new Set(allReviewDates.map(o => {
            const d = new Date(o.createdAt);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        }))];

        return NextResponse.json({ reviews, reviewDates });
    } catch (error) {
        console.error('Failed to fetch reviews:', error);
        return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }
}

// DELETE: Admin deletes a review from an order
export async function DELETE(request: Request) {
    try {
        const session = await auth();
        const userWithRole = session?.user as any;
        if (userWithRole?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { orderId } = await request.json();
        if (!orderId) {
            return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
        }

        await prisma.order.update({
            where: { id: orderId },
            data: { rating: null, review: null }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete review:', error);
        return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
    }
}
