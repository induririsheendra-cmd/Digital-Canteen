import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

// POST: Like or dislike a review
export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { orderId, vote } = await request.json();

        if (!orderId || !['LIKE', 'DISLIKE'].includes(vote)) {
            return NextResponse.json({ error: 'Invalid orderId or vote (LIKE/DISLIKE)' }, { status: 400 });
        }

        // Upsert: create or update the vote
        const existing = await prisma.reviewVote.findUnique({
            where: { userId_orderId: { userId: session.user.id, orderId } }
        });

        if (existing) {
            if (existing.vote === vote) {
                // Toggle off: remove the vote
                await prisma.reviewVote.delete({
                    where: { id: existing.id }
                });
                return NextResponse.json({ action: 'removed' });
            } else {
                // Switch vote
                await prisma.reviewVote.update({
                    where: { id: existing.id },
                    data: { vote }
                });
                return NextResponse.json({ action: 'switched', vote });
            }
        } else {
            await prisma.reviewVote.create({
                data: { userId: session.user.id, orderId, vote }
            });
            return NextResponse.json({ action: 'created', vote });
        }
    } catch (error) {
        console.error('Review vote error:', error);
        return NextResponse.json({ error: 'Failed to vote' }, { status: 500 });
    }
}

// GET: get vote counts per order
export async function GET(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const orderIds = searchParams.get('orderIds')?.split(',') || [];

        if (orderIds.length === 0) {
            return NextResponse.json({ votes: {} });
        }

        const allVotes = await prisma.reviewVote.findMany({
            where: { orderId: { in: orderIds } }
        });

        // Build counts per order
        const votes: Record<string, { likes: number; dislikes: number; userVote: string | null }> = {};
        orderIds.forEach(id => {
            const orderVotes = allVotes.filter((v: any) => v.orderId === id);
            votes[id] = {
                likes: orderVotes.filter((v: any) => v.vote === 'LIKE').length,
                dislikes: orderVotes.filter((v: any) => v.vote === 'DISLIKE').length,
                userVote: orderVotes.find((v: any) => v.userId === session.user!.id)?.vote || null
            };
        });

        return NextResponse.json({ votes });
    } catch (error) {
        console.error('Get votes error:', error);
        return NextResponse.json({ error: 'Failed to get votes' }, { status: 500 });
    }
}
