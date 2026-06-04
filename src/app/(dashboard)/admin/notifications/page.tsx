import AdminNotificationsClient from './AdminNotificationsClient';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';

export const metadata = {
    title: 'Management Broadcasts',
};

export default async function AdminNotificationsPage() {
    const session = await auth();
    const user = session?.user as any;

    if (!session?.user?.id || (session.user as any).role !== 'ADMIN') {
        redirect('/?login=true');
    }

    // Fetch history of global broadcasts
    const pastBroadcasts = await prisma.notification.findMany({
        where: { userId: null },
        orderBy: { createdAt: 'desc' },
        take: 50
    });

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Global Broadcasts</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                    Send system-wide push notifications to all authenticated users simultaneously.
                </p>
            </div>

            <AdminNotificationsClient pastBroadcasts={pastBroadcasts} />
        </div>
    );
}
