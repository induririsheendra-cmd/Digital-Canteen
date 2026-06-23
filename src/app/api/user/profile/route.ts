import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function PATCH(request: Request) {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { username, name, email, rollNumber, semester, department, password } = body;

        if (!username) {
            return NextResponse.json({ error: 'Username is required' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { userType: true }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const isFaculty = user.userType === 'FACULTY';

        const updateData: any = {
            username,
            name,
            email,
            rollNumber,
            semester: isFaculty ? null : semester,
            department
        };

        // If user provided a new password, hash it and update
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateData.password = hashedPassword;
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                username: true,
                name: true,
                email: true,
                rollNumber: true,
                semester: true,
                department: true,
                userType: true,
            }
        });

        return NextResponse.json(updatedUser);
    } catch (error: any) {
        console.error('Profile update error:', error);
        return NextResponse.json(
            { error: 'An error occurred while updating profile.' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

        return NextResponse.json({ success: true, message: 'Account deleted successfully.' });
    } catch (error: any) {
        console.error('Account deletion error:', error);
        return NextResponse.json(
            { error: 'An error occurred while deleting account.' },
            { status: 500 }
        );
    }
}

