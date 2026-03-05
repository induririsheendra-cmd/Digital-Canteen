import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const session = await auth();
        // Allow Admins only
        const user = session?.user as any;
        if (user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const body = await req.json();
        const { name, description, price, imageUrl, category, isVeg } = body;

        if (!name || !price || !imageUrl || !category) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const newMenuItem = await prisma.menuItem.create({
            data: {
                name,
                description: description || "",
                price: parseFloat(price),
                imageUrl,
                category,
                isVeg: Boolean(isVeg),
                // default stock and thresholds will be applied by Prisma
            },
        });

        return NextResponse.json({ menuItem: newMenuItem }, { status: 201 });
    } catch (error) {
        console.error("Error creating menu item:", error);
        return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
    }
}
