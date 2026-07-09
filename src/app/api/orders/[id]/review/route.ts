import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const orderId = id;
        const body = await request.json();
        const { rating, review } = body;

        if (typeof rating !== 'number' || rating < 1 || rating > 5) {
            return NextResponse.json({ error: 'Valid rating (1-5) is required' }, { status: 400 });
        }

        // Verify the order belongs to the user
        const existingOrder = await prisma.order.findUnique({
            where: { id: orderId }
        });

        if (!existingOrder) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Only allow reviewing completed orders
        if (existingOrder.status !== 'COMPLETED') {
            return NextResponse.json({ error: 'You can only review completed orders' }, { status: 400 });
        }

        if (existingOrder.userId !== session.user.id && (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { rating, review },
        });

        return NextResponse.json(updatedOrder);

    } catch (error: any) {
        console.error('Submit review error:', error);
        return NextResponse.json(
            { error: 'An error occurred while submitting your review.' },
            { status: 500 }
        );
    }
}

// User deletes their own review
export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const existingOrder = await prisma.order.findUnique({ where: { id } });

        if (!existingOrder) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Only the owner (or admin) can delete their review
        if (existingOrder.userId !== session.user.id && (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await prisma.order.update({
            where: { id },
            data: { rating: null, review: null },
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Delete review error:', error);
        return NextResponse.json(
            { error: 'An error occurred while deleting your review.' },
            { status: 500 }
        );
    }
}
