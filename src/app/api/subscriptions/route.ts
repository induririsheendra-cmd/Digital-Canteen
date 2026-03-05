import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        const { menuItemId } = await request.json();

        if (!menuItemId) {
            return NextResponse.json({ error: 'Missing Required Target parameters.' }, { status: 400 });
        }

        // Toggle logic: If subscribed, unsubscribe. Otherwise subscribe.
        const existing = await prisma.itemSubscription.findUnique({
            where: {
                userId_menuItemId: {
                    userId,
                    menuItemId
                }
            }
        });

        if (existing) {
            await prisma.itemSubscription.delete({ where: { id: existing.id } });
            return NextResponse.json({ success: true, subscribed: false });
        } else {
            await prisma.itemSubscription.create({
                data: {
                    userId,
                    menuItemId
                }
            });
            return NextResponse.json({ success: true, subscribed: true });
        }
    } catch (error) {
        console.error('Subscription error:', error);
        return NextResponse.json(
            { error: 'An error occurred processing the subscription request.' },
            { status: 500 }
        );
    }
}
