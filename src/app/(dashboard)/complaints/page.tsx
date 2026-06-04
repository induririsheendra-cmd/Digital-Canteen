import ComplaintsClient from './ComplaintsClient';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';

export const metadata = {
    title: 'Complaints & Support',
};

export default async function ComplaintsPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/?login=true');
    }

    // Fetch the user's past 10 orders so they can optionally link a complaint to an order ID
    const recentOrders = await prisma.order.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, createdAt: true, status: true, totalAmount: true }
    });

    // Fetch the user's existing complaint history
    const pastComplaints = await prisma.complaint.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        include: {
            order: {
                select: { id: true }
            }
        }
    });

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Help & Support</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                    Having issues with your meal or the canteen service? Let us know. Upload a photo or detail the problem below.
                </p>
            </div>

            <ComplaintsClient recentOrders={recentOrders} pastComplaints={pastComplaints} />
        </div>
    );
}
