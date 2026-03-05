import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: Fetch reviews for a specific menu item
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const menuItemId = searchParams.get('menuItemId');

        if (!menuItemId) {
            return NextResponse.json({ error: 'menuItemId required' }, { status: 400 });
        }

        // Find all orders that contain this menu item AND have a rating
        const reviews = await prisma.order.findMany({
            where: {
                rating: { not: null },
                orderItems: {
                    some: { menuItemId }
                }
            },
            select: {
                id: true,
                rating: true,
                review: true,
                createdAt: true,
                user: {
                    select: { name: true, username: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        // Get vote counts for these reviews
        const orderIds = reviews.map(r => r.id);
        const votes = await prisma.reviewVote.findMany({
            where: { orderId: { in: orderIds } }
        });

        const reviewsWithVotes = reviews.map(r => ({
            ...r,
            likes: votes.filter((v: any) => v.orderId === r.id && v.vote === 'LIKE').length,
            dislikes: votes.filter((v: any) => v.orderId === r.id && v.vote === 'DISLIKE').length,
        }));

        return NextResponse.json({ reviews: reviewsWithVotes });
    } catch (error) {
        console.error('Failed to fetch menu item reviews:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
