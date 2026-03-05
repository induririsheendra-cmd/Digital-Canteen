import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import AdminComplaintsClient from './AdminComplaintsClient';

export default async function AdminComplaintsPage() {
    const session = await auth();
    const userRole = (session?.user as any)?.role;

    if (userRole !== 'ADMIN') {
        redirect('/home');
    }

    // Fetch all complaints with related user and order data
    const allComplaints = await prisma.complaint.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            user: {
                select: { name: true, username: true, department: true, rollNumber: true }
            },
            order: {
                select: { id: true, totalAmount: true }
            }
        }
    });

    return (
        <div style={{ padding: '2rem' }}>
            <h1 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Management Inbox</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Review and resolve user complaints and support tickets.
            </p>

            <AdminComplaintsClient initialComplaints={allComplaints} />
        </div>
    );
}
