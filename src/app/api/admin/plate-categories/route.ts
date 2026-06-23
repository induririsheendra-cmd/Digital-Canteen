import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
    try {
        const categories = await prisma.plateCategory.findMany({
            orderBy: { createdAt: 'asc' }
        });
        return NextResponse.json(categories, { status: 200 });
    } catch (error) {
        console.error('Error fetching plate categories:', error);
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        const user = session?.user as any;
        if (!session || user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, label, limit } = await request.json();
        if (!name || !label) {
            return NextResponse.json({ error: 'Missing name or label' }, { status: 400 });
        }

        const standardName = name.trim().toUpperCase();

        const newCategory = await prisma.plateCategory.create({
            data: {
                name: standardName,
                label: label.trim(),
                limit: limit ? parseInt(limit) : 1
            }
        });

        return NextResponse.json(newCategory, { status: 201 });
    } catch (error: any) {
        console.error('Error creating plate category:', error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Category code already exists' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await auth();
        const user = session?.user as any;
        if (!session || user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing category ID' }, { status: 400 });
        }

        const deleted = await prisma.plateCategory.delete({
            where: { id }
        });

        return NextResponse.json(deleted, { status: 200 });
    } catch (error) {
        console.error('Error deleting plate category:', error);
        return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
    }
}
