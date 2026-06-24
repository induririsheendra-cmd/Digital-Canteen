import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        name: true,
                        username: true,
                        rollNumber: true,
                        department: true,
                        semester: true,
                        userType: true,
                        isDeleted: true,
                    }
                },
                orderItems: {
                    include: {
                        menuItem: { select: { name: true } }
                    }
                }
            }
        });

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        return NextResponse.json(order);
    } catch (error) {
        console.error("Failed to fetch order:", error);
        return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
    }
}
