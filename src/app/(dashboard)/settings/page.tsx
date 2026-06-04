import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import SettingsClient from './SettingsClient';

export default async function SettingsPage() {
    const session = await auth();

    if (!session?.user?.email) {
        redirect('/?login=true');
    }

    // Fetch the full User object directly from the database
    // This allows us to get the live RollNumber, Semester, etc.
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
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

            <SettingsClient user={user} />
        </div>
    );
}
