import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/auth';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const timings = await prisma.mealTiming.findMany();
        return NextResponse.json(timings, { status: 200 });
    } catch (error) {
        console.error('Error fetching meal timings:', error);
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const session = await auth();
        const user = session?.user as any;
        if (!session || user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id, startTime, endTime, isManualOpen } = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Fetch existing to check if manual status changed
        const existing = await prisma.mealTiming.findUnique({ where: { id } });
        if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        const updatedTiming = await prisma.mealTiming.update({
            where: { id },
            data: {
                ...(startTime && { startTime }),
                ...(endTime && { endTime }),
                ...(typeof isManualOpen === 'boolean' && { isManualOpen })
            },
        });

        // Broadcast notification if it was explicitly toggled
        if (typeof isManualOpen === 'boolean' && existing.isManualOpen !== isManualOpen) {
            const statusText = isManualOpen ? 'OPENED' : 'CLOSED';
            await prisma.notification.create({
                data: {
                    message: `📢 ${existing.category} is now manually ${statusText}!`,
                    type: 'GLOBAL',
                    link: '/menu',
                }
            });
        }

        return NextResponse.json(updatedTiming, { status: 200 });
    } catch (error) {
        console.error('Error updating meal timing:', error);
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}
