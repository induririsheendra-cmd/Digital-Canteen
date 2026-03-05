import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function PATCH(request: Request) {
    try {
        const session = await auth();
        const userRole = (session?.user as any)?.role;

        if (userRole !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 403 });
        }

        const body = await request.json();
        const { id, title, description, price, imageUrl, menuItemId } = body;

        if (!id || !title || !description || !imageUrl) {
            return NextResponse.json({ error: 'ID, Title, description, and image URL are required.' }, { status: 400 });
        }

        const updatedBanner = await prisma.bannerSettings.upsert({
            where: { id },
            update: {
                title,
                description,
                price: price || null,
                imageUrl,
                menuItemId: menuItemId || null
            },
            create: {
                id,
                title,
                description,
                price: price || null,
                imageUrl,
                menuItemId: menuItemId || null
            }
        });

        return NextResponse.json(updatedBanner);
    } catch (error: any) {
        console.error('CMS Banner Settings Error:', error);
        return NextResponse.json(
            { error: 'An error occurred while updating the banner.' },
            { status: 500 }
        );
    }
}
