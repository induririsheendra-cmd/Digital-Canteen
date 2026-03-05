import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { orderId, text, image } = body;

        if (!text) {
            return NextResponse.json({ error: 'Complaint text is required.' }, { status: 400 });
        }

        // Validate that if an orderId is provided, it belongs to the user
        if (orderId) {
            const orderCheck = await prisma.order.findUnique({
                where: { id: orderId }
            });
            if (!orderCheck || orderCheck.userId !== session.user.id) {
                return NextResponse.json({ error: 'Invalid Order ID or unauthorized access to order.' }, { status: 403 });
            }
        }

        // Create the new Complaint record
        const newComplaint = await prisma.complaint.create({
            data: {
                userId: session.user.id,
                orderId: orderId || null,
                text,
                image: image || null,
                status: 'PENDING'
            }
        });

        // Trigger a Notification for Admin (Optional Phase 8 stretch goal)
        // await prisma.notification.create({ ... })

        return NextResponse.json(newComplaint, { status: 201 });
    } catch (error) {
        console.error('Complaint submission error:', error);
        return NextResponse.json(
            { error: 'An error occurred while submitting your complaint.' },
            { status: 500 }
        );
    }
}
