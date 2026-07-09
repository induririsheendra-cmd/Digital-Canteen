import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import SettingsClient from './SettingsClient';

export default async function SettingsPage() {
    const session = await auth();

    if (!session?.user?.email) {
        redirect('/?login=true');
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
            id: true,
            username: true,
            name: true,
            email: true,
            role: true,
            userType: true,
            rollNumber: true,
            semester: true,
            department: true,
            isDeleted: true,
            createdAt: true,
            updatedAt: true
        }
    });

    if (!user) {
        redirect('/login');
    }

    return (
        <div style={{ padding: '2rem' }}>
            <h1 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Account Settings</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Manage your academic profile and application preferences.
            </p>

            <SettingsClient user={user as any} />
        </div>
    );
}
