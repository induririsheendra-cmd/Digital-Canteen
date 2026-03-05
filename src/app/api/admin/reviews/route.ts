import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

// GET: Fetch all orders with reviews for admin
export async function GET() {
    try {
        const session = await auth();
        const userWithRole = session?.user as any;
        if (userWithRole?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const reviews = await prisma.order.findMany({
            where: {
                rating: { not: null }
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
                    }
                },
                orderItems: {
                    select: {
                        quantity: true,
                        menuItem: {
                            select: { name: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ reviews });
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
