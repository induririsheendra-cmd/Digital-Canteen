import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function DELETE(request: Request) {
    try {
        const session = await auth();
        const userWithRole = session?.user as any;

        if (userWithRole?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('id');

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true, username: true }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const timestamp = Date.now();
        const updatedEmail = user.email ? `${user.email}_deleted_${timestamp}` : null;
        const updatedUsername = user.username ? `${user.username}_deleted_${timestamp}` : null;

        await prisma.user.update({
            where: { id: userId },
            data: {
                isDeleted: true,
                email: updatedEmail,
                username: updatedUsername
            }
        });

        return NextResponse.json({ success: true, message: 'User account soft-deleted successfully.' });
    } catch (error: any) {
        console.error('Admin user deletion error:', error);
        return NextResponse.json(
            { error: 'An error occurred while deleting the user.' },
            { status: 500 }
        );
    }
}
