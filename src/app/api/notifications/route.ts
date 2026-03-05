import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        // Fetch notifications:
        // 1. Where userId matches the logged-in user
        // 2. OR where userId is NULL (Global Broadcasts)
        const notifications = await prisma.notification.findMany({
            where: {
                OR: [
                    { userId: userId },
                    { userId: null }
                ]
            },
            orderBy: { createdAt: 'desc' },
            take: 20 // Only fetch the 20 most recent to keep the badge snappy
        });

        // Calculate unread count
        const unreadCount = notifications.filter(n => !n.read).length;

        return NextResponse.json({ notifications, unreadCount });
    } catch (error) {
        console.error('Failed to fetch notifications:', error);
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { notificationId, markAll } = body;

        // Mark ALL as read
        if (markAll) {
            await prisma.notification.updateMany({
                where: {
                    OR: [
                        { userId: session.user.id },
                        { userId: null }
                    ],
                    read: false
                },
                data: { read: true }
            });
            return NextResponse.json({ success: true });
        }

        if (!notificationId) {
            return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 });
        }

        // Add a security check: ensure the notification belongs to the user or is global
        const targetNotification = await prisma.notification.findUnique({
            where: { id: notificationId }
        });

        if (!targetNotification) {
            return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
        }

        if (targetNotification.userId !== null && targetNotification.userId !== session.user.id) {
            return NextResponse.json({ error: 'Unauthorized to modify this notification' }, { status: 403 });
        }

        const updated = await prisma.notification.update({
            where: { id: notificationId },
            data: { read: true }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Failed to update notification:', error);
        return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
    }
}

export async function DELETE() {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Delete user-specific notifications and mark globals as read
        await prisma.notification.deleteMany({
            where: {
                OR: [
                    { userId: session.user.id },
                    { userId: null }
                ]
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to clear notifications:', error);
        return NextResponse.json({ error: 'Failed to clear notifications' }, { status: 500 });
    }
}
