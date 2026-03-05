import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import AdminBannerClient from './AdminBannerClient';

export default async function AdminBannerPage() {
    const session = await auth();
    const userRole = (session?.user as any)?.role;

    if (userRole !== 'ADMIN') {
        redirect('/home');
    }

    // Fetch up to 3 Banners
    let banners = await prisma.bannerSettings.findMany({
        take: 3,
        orderBy: { id: 'asc' }
    });

    // Ensure we always have exactly 3 slots to edit
    const targetCount = 3;
    if (banners.length < targetCount) {
        const needed = targetCount - banners.length;
        for (let i = 0; i < needed; i++) {
            const nextId = (banners.length + i + 1).toString();
            const newBanner = await prisma.bannerSettings.create({
                data: {
                    id: nextId,
                    title: `Banner Slot ${nextId}`,
                    description: 'Click to edit this banner slot...',
                    price: null,
                    imageUrl: 'https://images.unsplash.com/photo-1543362906-acfc16c67564?q=80&w=2000'
                }
            });
            banners.push(newBanner);
        }
    }

    const allItems = await prisma.menuItem.findMany({
        select: { id: true, name: true, category: true, isVeg: true, price: true }
    });

    return (
        <div style={{ padding: '2rem' }}>
            <h1 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Banner CMS Control</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Dynamically update the landing page hero section in real-time. Link a Menu Item to allow users 1-Click adding from the banner!
            </p>

            <AdminBannerClient banners={banners} menuItems={allItems} />
        </div>
    );
}
