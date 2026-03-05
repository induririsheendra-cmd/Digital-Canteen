import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function PATCH(request: Request) {
    try {
        const session = await auth();
        const user = session?.user as any;

        if (!session || user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 403 });
        }

        const body = await request.json();
        const { complaintId, status, adminReply } = body;

        if (!complaintId || !status) {
            return NextResponse.json({ error: 'Complaint ID and Status are required.' }, { status: 400 });
        }

        const updatedComplaint = await prisma.complaint.update({
            where: { id: complaintId },
            data: {
                status,
                adminReply: adminReply || null
            }
        });

        // Trigger Notification to the original User
        if (status === 'RESOLVED') {
            await prisma.notification.create({
                data: {
                    userId: updatedComplaint.userId,
                    message: `A Management Admin has responded to your complaint ticket.`,
                    type: 'COMPLAINT',
                    link: '/complaints'
                }
            });
        }

        return NextResponse.json(updatedComplaint, { status: 200 });
    } catch (error) {
        console.error('Complaint resolution error:', error);
        return NextResponse.json(
            { error: 'An error occurred while updating the complaint.' },
            { status: 500 }
        );
    }
}
