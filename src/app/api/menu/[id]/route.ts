import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth();

        const userWithRole = session?.user as any;
        if (userWithRole?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();

        // Destructure all possible update fields
        const { available, price, stock, lowStockThreshold, category, name, description, imageUrl, isVeg } = body;

        const updateData: any = {};
        if (available !== undefined) updateData.available = available;
        if (price !== undefined) updateData.price = price;
        if (stock !== undefined) updateData.stock = stock;
        if (lowStockThreshold !== undefined) updateData.lowStockThreshold = lowStockThreshold;
        if (category !== undefined) updateData.category = category;
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
        if (isVeg !== undefined) updateData.isVeg = isVeg;

        const updatedItem = await prisma.menuItem.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json({ success: true, menuItem: updatedItem });

    } catch (error) {
        console.error("Menu Item Update Error:", error);
        return NextResponse.json({ error: "Failed to update menu item" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth();

        const userWithRole = session?.user as any;
        if (userWithRole?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await prisma.menuItem.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Menu Item Delete Error:", error);
        return NextResponse.json({ error: "Failed to delete menu item" }, { status: 500 });
    }
}
