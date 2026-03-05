import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const session = await auth();
        const user = session?.user as any;

        // Secure endpoint: Only Admins can broadcast globally
        if (!session || user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 403 });
        }

        const body = await request.json();
        const { message, link, type } = body;

        if (!message || !type) {
            return NextResponse.json({ error: 'Message and Type are required.' }, { status: 400 });
        }

        // Create the Global Broadcast Notification.
        // Leaving `userId` as NULL ensures it is scooped up by all authenticated clients polling `/api/notifications/route.ts`
        const newBroadcast = await prisma.notification.create({
            data: {
                message,
                type,
                link: link || null,
                userId: null
            }
        });

        return NextResponse.json(newBroadcast, { status: 201 });
    } catch (error) {
        console.error('Broadcast creation error:', error);
        return NextResponse.json(
            { error: 'An error occurred while deploying the broadcast.' },
            { status: 500 }
        );
    }
}
